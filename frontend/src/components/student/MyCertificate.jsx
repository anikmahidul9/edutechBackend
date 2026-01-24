import React, { useState, useEffect } from "react";
import { FaCertificate, FaSpinner, FaDownload, FaAward, FaTimesCircle, FaBookOpen } from "react-icons/fa";
import { auth, db } from "../../config/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import html2pdf from "html2pdf.js";
import { Link } from "react-router-dom";

const MyCertificate = () => {
  const [studentProfile, setStudentProfile] = useState(null);
  const [eligibleCertificates, setEligibleCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCertificateData = async () => {
      setLoading(true);
      setError("");
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("You must be logged in to view certificates.");
          setLoading(false);
          return;
        }

        // 1. Fetch student profile
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setStudentProfile(userDoc.data());
        } else {
          setError("Student profile not found.");
          setLoading(false);
          return;
        }

        // 2. Fetch enrolled courses
        const myCoursesRef = collection(db, "users", user.uid, "my_courses");
        const myCoursesSnapshot = await getDocs(myCoursesRef);
        const enrolledCourseIds = myCoursesSnapshot.docs.map((d) => d.id);

        if (enrolledCourseIds.length === 0) {
          setEligibleCertificates([]);
          setLoading(false);
          return;
        }

        const eligibleCertificatesData = [];

        for (const courseId of enrolledCourseIds) {
          // Fetch course details
          const courseDocRef = doc(db, "courses", courseId);
          const courseDoc = await getDoc(courseDocRef);

          if (!courseDoc.exists()) continue;

          const courseData = courseDoc.data();
          
          // Calculate average marks from quizzes and written exams
          const averageMarks = await calculateAverageMarks(user.uid, courseId);
          
          // Check if average is 70% or higher
          if (averageMarks >= 70) {
            // Find the latest completion date from submissions
            const latestCompletionDate = await getLatestCompletionDate(user.uid, courseId);
            
            eligibleCertificatesData.push({
              courseId: courseDoc.id,
              courseTitle: courseData.title,
              instructor: courseData.facultyName || "N/A",
              completionDate: latestCompletionDate,
              averageMarks: Math.round(averageMarks)
            });
          }
        }

        setEligibleCertificates(eligibleCertificatesData);
      } catch (err) {
        console.error("Error fetching certificate data:", err);
        setError("Failed to load certificate data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificateData();
  }, []);

  // Function to calculate average marks from quizzes and written exams
  const calculateAverageMarks = async (userId, courseId) => {
    try {
      let totalMarks = 0;
      let count = 0;

      // 1. Fetch quiz attempts for this course
      const quizAttemptsQuery = query(
        collection(db, "quizAttempts"),
        where("studentId", "==", userId),
        where("courseId", "==", courseId)
      );
      
      const quizAttemptsSnapshot = await getDocs(quizAttemptsQuery);
      
      quizAttemptsSnapshot.forEach((doc) => {
        const attempt = doc.data();
        if (attempt.score !== undefined && attempt.totalQuestions) {
          const percentage = (attempt.score / attempt.totalQuestions) * 100;
          totalMarks += percentage;
          count++;
        }
      });

      // 2. Fetch written exam submissions for this course
      const writtenExamsQuery = query(
        collection(db, "writtenExamSubmissions"),
        where("studentId", "==", userId),
        where("courseId", "==", courseId),
        where("graded", "==", true)
      );
      
      const writtenExamsSnapshot = await getDocs(writtenExamsQuery);
      
      writtenExamsSnapshot.forEach((doc) => {
        const submission = doc.data();
        if (submission.marks !== undefined) {
          // Assuming written exams are out of 100
          totalMarks += submission.marks;
          count++;
        }
      });

      // Calculate average if we have data
      if (count > 0) {
        return totalMarks / count;
      }

      return 0; // No attempts yet
    } catch (error) {
      console.error("Error calculating average marks:", error);
      return 0;
    }
  };

  // Function to get the latest completion date
  const getLatestCompletionDate = async (userId, courseId) => {
    let latestDate = null;

    try {
      // Check quiz attempts for latest date
      const quizAttemptsQuery = query(
        collection(db, "quizAttempts"),
        where("studentId", "==", userId),
        where("courseId", "==", courseId)
      );
      
      const quizAttemptsSnapshot = await getDocs(quizAttemptsQuery);
      
      quizAttemptsSnapshot.forEach((doc) => {
        const attempt = doc.data();
        if (attempt.submittedAt) {
          const attemptDate = attempt.submittedAt.toDate();
          if (!latestDate || attemptDate > latestDate) {
            latestDate = attemptDate;
          }
        }
      });

      // Check written exam submissions for latest date
      const writtenExamsQuery = query(
        collection(db, "writtenExamSubmissions"),
        where("studentId", "==", userId),
        where("courseId", "==", courseId),
        where("graded", "==", true)
      );
      
      const writtenExamsSnapshot = await getDocs(writtenExamsQuery);
      
      writtenExamsSnapshot.forEach((doc) => {
        const submission = doc.data();
        if (submission.submittedAt) {
          const submissionDate = submission.submittedAt.toDate();
          if (!latestDate || submissionDate > latestDate) {
            latestDate = submissionDate;
          }
        }
      });

      // Format the date
      if (latestDate) {
        return latestDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      return new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error getting latest completion date:", error);
      return new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const generateCertificatePdf = (certificateData) => {
    const { courseTitle, completionDate, studentName, instructor, averageMarks } = certificateData;

    // Create a temporary div to render the certificate HTML
    const certificateContainer = document.createElement("div");
    certificateContainer.style.width = "800px";
    certificateContainer.style.height = "600px";
    certificateContainer.style.padding = "20px";
    certificateContainer.style.boxSizing = "border-box";
    certificateContainer.style.fontFamily = "Arial, sans-serif";
    certificateContainer.style.border = "10px solid #f0b90b";
    certificateContainer.style.backgroundImage = "url('/public/certificate_bg.png')";
    certificateContainer.style.backgroundSize = "cover";
    certificateContainer.style.textAlign = "center";
    certificateContainer.style.position = "relative";
    certificateContainer.style.overflow = "hidden";
    certificateContainer.style.display = "flex";
    certificateContainer.style.flexDirection = "column";
    certificateContainer.style.justifyContent = "space-between";

    certificateContainer.innerHTML = `
      <div style="flex-shrink: 0; padding-top: 20px;">
        <img src="/public/logo/eduLogo.png" alt="EduTech Logo" style="width: 100px; height: auto; margin-bottom: 5px;" />
        <h1 style="color: #0d47a1; font-size: 36px; margin: 0; font-weight: bold;">EduTech</h1>
        <p style="color: #666; font-size: 14px; margin-top: 5px;">Empowering Minds, Shaping Futures</p>
      </div>
      <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; padding: 0 40px;">
        <p style="color: #333; font-size: 20px; margin-bottom: 10px;">CERTIFICATE OF ACHIEVEMENT</p>
        <p style="color: #555; font-size: 16px; margin-bottom: 20px;">This certifies that</p>
        <h2 style="color: #0d47a1; font-size: 48px; margin: 0; text-transform: uppercase; font-weight: bold;">${studentName}</h2>
        <p style="color: #555; font-size: 16px; margin-top: 20px; margin-bottom: 10px;">has successfully completed the course</p>
        <h3 style="color: #333; font-size: 32px; margin: 0; font-weight: bold;">${courseTitle}</h3>
        <p style="color: #555; font-size: 16px; margin-top: 20px;">with an average score of <strong>${averageMarks}%</strong></p>
        <p style="color: #555; font-size: 16px; margin-top: 10px;">on ${completionDate}</p>
      </div>
      <div style="flex-shrink: 0; padding-bottom: 30px; display: flex; justify-content: space-around; width: 100%;">
        <div style="text-align: center;">
          <hr style="border: none; border-top: 1px solid #ccc; width: 180px; margin: 0 auto 5px auto;" />
          <p style="font-size: 14px; color: #777;">${instructor || "Lead Instructor"}</p>
          <p style="font-size: 12px; color: #999;">(Instructor's Name)</p>
        </div>
        <div style="text-align: center;">
          <hr style="border: none; border-top: 1px solid #ccc; width: 180px; margin: 0 auto 5px auto;" />
          <p style="font-size: 14px; color: #777;">Dr. Aisha Khan</p>
          <p style="font-size: 12px; color: #999;">(Authorized Signature)</p>
        </div>
      </div>
    `;

    const opt = {
      margin: 0,
      filename: `certificate_${studentName.replace(/\s/g, "_")}_${courseTitle.replace(/\s/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "px", format: [800, 600], orientation: "landscape" },
      pagebreak: { avoid: "img" }
    };

    html2pdf().set(opt).from(certificateContainer).save();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
        <p className="ml-4 text-lg text-gray-700">Loading your certificates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4 flex items-center gap-3">
          <FaTimesCircle className="text-red-600" /> Error
        </h1>
        <p className="text-red-500">{error}</p>
        <Link
          to="/student/dashboard"
          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <FaAward className="text-yellow-500" /> My Certificates
        </h1>

        {eligibleCertificates.length === 0 ? (
          <div className="text-center py-12">
            <FaCertificate className="text-gray-400 text-6xl mx-auto mb-6" />
            <p className="text-xl text-gray-600 mb-4">
              You haven't earned any certificates yet.
            </p>
            <p className="text-gray-500 mb-6">
              Complete quizzes and written exams with an average score of 70% or higher to earn certificates.
            </p>
            <Link
              to="/student/courses"
              className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
            >
              Browse Available Courses <FaBookOpen className="ml-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {eligibleCertificates.map((cert) => (
              <div
                key={cert.courseId}
                className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="mb-4 sm:mb-0">
                  <h2 className="text-xl font-bold text-gray-800">{cert.courseTitle}</h2>
                  <div className="mt-2 space-y-1">
                    <p className="text-gray-600">Issued: {cert.completionDate}</p>
                    <p className="text-gray-600">Average Score: <span className="font-bold text-green-600">{cert.averageMarks}%</span></p>
                    <p className="text-sm text-gray-500">Based on quiz and written exam performances</p>
                  </div>
                </div>
                <button
                  onClick={() => generateCertificatePdf({
                    courseTitle: cert.courseTitle,
                    completionDate: cert.completionDate,
                    studentName: studentProfile?.fullName || 
                               `${studentProfile?.firstName || ''} ${studentProfile?.lastName || ''}`.trim() || 
                               "Student Name",
                    instructor: cert.instructor,
                    averageMarks: cert.averageMarks
                  })}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold rounded-lg shadow-md hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 flex items-center transform hover:scale-105"
                >
                  <FaDownload className="mr-2" /> Download Certificate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCertificate;