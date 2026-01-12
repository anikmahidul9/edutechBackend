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

        // 2. Fetch enrolled course IDs
        const myCoursesRef = collection(db, "users", user.uid, "my_courses");
        const myCoursesSnapshot = await getDocs(myCoursesRef);
        const enrolledCourseIds = myCoursesSnapshot.docs.map((d) => d.id);

        if (enrolledCourseIds.length === 0) {
          setEligibleCertificates([]);
          setLoading(false);
          return;
        }

        // 3. Fetch details of enrolled courses
        const coursesRef = collection(db, "courses");
        const coursesQ = query(coursesRef, where("__name__", "in", enrolledCourseIds));
        const coursesSnapshot = await getDocs(coursesQ);
        const coursesDetails = coursesSnapshot.docs.map((d) => ({
          id: d.id,
          title: d.data().title,
          instructor: d.data().facultyName || "N/A", // Assuming facultyName is stored in course
        }));

        // 4. Fetch all quizzes for these courses
        const quizzesRef = collection(db, "quizzes");
        const quizzesQ = query(quizzesRef, where("courseId", "in", enrolledCourseIds));
        const quizzesSnapshot = await getDocs(quizzesQ);
        const quizzesData = quizzesSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        // 5. Fetch all quiz attempts by the student
        const quizAttemptsRef = collection(db, "quizAttempts");
        const quizAttemptsQ = query(quizAttemptsRef, where("studentId", "==", user.uid));
        const quizAttemptsSnapshot = await getDocs(quizAttemptsQ);
        const quizAttemptsData = quizAttemptsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        // 6. Determine certificate eligibility
        const eligibleCourses = [];
        coursesDetails.forEach((course) => {
          const courseQuizzes = quizzesData.filter((q) => q.courseId === course.id);
          const passedQuizzes = new Set(); // Use Set to count unique quizzes passed

          quizAttemptsData.forEach((attempt) => {
            if (attempt.courseId === course.id) {
              const quiz = courseQuizzes.find((q) => q.id === attempt.quizId);
              if (quiz) {
                const scorePercentage = (attempt.score / attempt.totalQuestions) * 100;
                if (scorePercentage >= 60) {
                  passedQuizzes.add(attempt.quizId);
                }
              }
            }
          });

          if (passedQuizzes.size >= 3) {
            // Check if student has achieved >= 60% on at least 3 unique quizzes for this course
            eligibleCourses.push({
              courseId: course.id,
              courseTitle: course.title,
              instructor: course.instructor,
              completionDate: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }), // Placeholder for actual completion date
            });
          }
        });

        setEligibleCertificates(eligibleCourses);
      } catch (err) {
        console.error("Error fetching certificate data:", err);
        setError("Failed to load certificate data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificateData();
  }, []);

  const generateCertificatePdf = (certificateData) => {
    const { courseTitle, completionDate, studentName, instructor } = certificateData;

    // Create a temporary div to render the certificate HTML
    const certificateContainer = document.createElement("div");
    certificateContainer.style.width = "800px"; // Standard certificate width
    certificateContainer.style.height = "600px"; // Standard certificate height
    certificateContainer.style.padding = "20px";
    certificateContainer.style.boxSizing = "border-box";
    certificateContainer.style.fontFamily = "Arial, sans-serif";
    certificateContainer.style.border = "10px solid #f0b90b"; // Gold border
    certificateContainer.style.backgroundImage = "url('/public/certificate_bg.png')"; // Example background image - ensure this path is correct relative to public/
    certificateContainer.style.backgroundSize = "cover";
    certificateContainer.style.textAlign = "center";
    certificateContainer.style.position = "relative";
    certificateContainer.style.overflow = "hidden";
    certificateContainer.style.display = "flex"; // Use flexbox for centering
    certificateContainer.style.flexDirection = "column";
    certificateContainer.style.justifyContent = "space-between"; // Distribute content vertically


    certificateContainer.innerHTML = `
      <div style="flex-shrink: 0; padding-top: 20px;">
        <img src="/public/logo/eduLogo.png" alt="EduTech Logo" style="width: 100px; height: auto; margin-bottom: 5px;" />
        <h1 style="color: #0d47a1; font-size: 36px; margin: 0; font-weight: bold;">EduTech</h1>
        <p style="color: #666; font-size: 14px; margin-top: 5px;">Empowering Minds, Shaping Futures</p>
      </div>
      <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; padding: 0 40px;">
        <p style="color: #333; font-size: 20px; margin-bottom: 10px;">CERTIFICATE OF COMPLETION</p>
        <p style="color: #555; font-size: 16px; margin-bottom: 20px;">This certifies that</p>
        <h2 style="color: #0d47a1; font-size: 48px; margin: 0; text-transform: uppercase; font-weight: bold;">${studentName}</h2>
        <p style="color: #555; font-size: 16px; margin-top: 20px; margin-bottom: 10px;">has successfully completed the course</p>
        <h3 style="color: #333; font-size: 32px; margin: 0; font-weight: bold;">${courseTitle}</h3>
        <p style="color: #555; font-size: 16px; margin-top: 20px;">on ${completionDate}</p>
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
          to="/student/test" // Or appropriate link
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
            <p className="text-xl text-gray-600 mb-6">
              You have not earned any certificates yet. Keep learning and passing quizzes!
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
                className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{cert.courseTitle}</h2>
                  <p className="text-gray-600">Issued: {cert.completionDate}</p>
                </div>
                <button
                  onClick={() => generateCertificatePdf({
                    courseTitle: cert.courseTitle,
                    completionDate: cert.completionDate,
                    studentName: studentProfile?.fullName || studentProfile?.firstName + " " + studentProfile?.lastName || "Student Name",
                    instructor: cert.instructor
                  })}
                  className="mt-4 sm:mt-0 px-6 py-3 bg-yellow-500 text-white font-bold rounded-lg shadow-md hover:bg-yellow-600 transition-all duration-300 flex items-center"
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
