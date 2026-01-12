import React, { useState, useEffect } from "react";
import {
  FaSpinner,
  FaChartLine,
  FaBookOpen,
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaFilePdf,
} from "react-icons/fa";
import { auth, db } from "../../config/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
} from "recharts";

const MyProgress = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [writtenSubmissions, setWrittenSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overallProgressData, setOverallProgressData] = useState([]);

  useEffect(() => {
    const fetchStudentProgress = async () => {
      setLoading(true);
      setError("");
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("You must be logged in to view your progress.");
          setLoading(false);
          return;
        }

        // 1. Fetch enrolled course IDs and details
        const myCoursesRef = collection(db, "users", user.uid, "my_courses");
        const myCoursesSnapshot = await getDocs(myCoursesRef);
        const enrolledCourseIds = myCoursesSnapshot.docs.map((d) => d.id);

        if (enrolledCourseIds.length === 0) {
          setEnrolledCourses([]);
          setQuizAttempts([]);
          setWrittenSubmissions([]);
          setLoading(false);
          return;
        }

        const coursesRef = collection(db, "courses");
        const coursesQ = query(coursesRef, where("__name__", "in", enrolledCourseIds));
        const coursesSnapshot = await getDocs(coursesQ);
        const coursesDetails = coursesSnapshot.docs.map((d) => ({
          id: d.id,
          title: d.data().title,
          category: d.data().category,
          // Add other relevant course details if needed for progress calculation
        }));
        setEnrolledCourses(coursesDetails);

        // 2. Fetch Quiz Attempts
        const quizAttemptsRef = collection(db, "quizAttempts");
        const quizAttemptsQ = query(quizAttemptsRef, where("studentId", "==", user.uid));
        const quizAttemptsSnapshot = await getDocs(quizAttemptsQ);
        setQuizAttempts(quizAttemptsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));

        // 3. Fetch Written Exam Submissions
        const writtenSubmissionsRef = collection(db, "writtenExamSubmissions");
        const writtenSubmissionsQ = query(writtenSubmissionsRef, where("studentId", "==", user.uid));
        const writtenSubmissionsSnapshot = await getDocs(writtenSubmissionsQ);
        setWrittenSubmissions(writtenSubmissionsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));

      } catch (err) {
        console.error("Error fetching student progress data:", err);
        setError("Failed to load your progress data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProgress();
  }, []);

  useEffect(() => {
    // Process data for overall progress chart
    if (!loading && !error && enrolledCourses.length > 0) {
      let totalMaxScore = 0;
      let totalEarnedScore = 0;
      let completedQuizzes = 0;
      let gradedWrittenExams = 0;
      
      enrolledCourses.forEach(course => {
        // Calculate quiz progress
        const courseQuizzes = quizAttempts.filter(attempt => attempt.courseId === course.id);
        courseQuizzes.forEach(attempt => {
            totalEarnedScore += attempt.score;
            totalMaxScore += attempt.totalQuestions;
            if (attempt.score === attempt.totalQuestions) { // Simple completion check for quiz
                completedQuizzes++;
            }
        });

        // Calculate written exam progress
        const courseWrittenExams = writtenSubmissions.filter(sub => sub.courseId === course.id);
        courseWrittenExams.forEach(submission => {
            if (submission.graded) {
                // Assuming max score for written exam needs to be fetched or defined
                // For simplicity, let's just count as graded
                gradedWrittenExams++;
            }
        });
      });

      const totalExams = quizAttempts.length + writtenSubmissions.length;
      const overallCompletionPercentage = totalMaxScore > 0 ? (totalEarnedScore / totalMaxScore) * 100 : 0;
      
      const data = [
        { name: 'Quizzes Completed', value: completedQuizzes, fill: '#8884d8' },
        { name: 'Written Exams Graded', value: gradedWrittenExams, fill: '#82ca9d' },
        { name: 'Overall Score', value: Math.round(overallCompletionPercentage), fill: '#ffc658' },
      ];
      
      setOverallProgressData(data);
    }
  }, [loading, error, enrolledCourses, quizAttempts, writtenSubmissions]);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
        <p className="ml-4 text-lg text-gray-700">Loading your progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4 flex items-center gap-3">
          <FaChartLine className="text-red-600" /> Error
        </h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center">
        <FaBookOpen className="text-gray-400 text-6xl mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">No Enrolled Courses</h1>
        <p className="text-gray-600 mb-6">Enroll in courses to start tracking your progress!</p>
        <Link
          to="/student/courses"
          className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
        >
          Browse Courses <FaArrowRight className="ml-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 flex items-center">
          <FaChartLine className="mr-3 text-indigo-600" /> My Learning Progress
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Overall Progress Chart */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Overall Achievement</h2>
            {overallProgressData.length > 0 && overallProgressData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart
                    innerRadius="10%"
                    outerRadius="80%"
                    data={overallProgressData}
                    startAngle={90}
                    endAngle={-270}
                >
                    <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff' }} background clockWise dataKey="value" />
                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                    <Tooltip />
                </RadialBarChart>
                </ResponsiveContainer>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    <p>No data to display. Start taking quizzes and exams!</p>
                </div>
            )}
            
          </div>

          {/* Progress Summary */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Progress Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg flex items-center">
                <FaBookOpen className="text-blue-600 text-2xl mr-3" />
                <p className="text-gray-700">Courses Enrolled: <span className="font-bold">{enrolledCourses.length}</span></p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg flex items-center">
                <FaClipboardList className="text-green-600 text-2xl mr-3" />
                <p className="text-gray-700">Quizzes Attempted: <span className="font-bold">{quizAttempts.length}</span></p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg flex items-center">
                <FaFilePdf className="text-yellow-600 text-2xl mr-3" />
                <p className="text-gray-700">Written Exams Submitted: <span className="font-bold">{writtenSubmissions.length}</span></p>
              </div>
              {/* Additional summary stats can be added here */}
            </div>
          </div>
        </div>

        {/* Detailed Course Progress */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Detailed Course Progress</h2>
          <div className="space-y-6">
            {enrolledCourses.map((course) => {
              const courseQuizAttempts = quizAttempts.filter(att => att.courseId === course.id);
              const courseWrittenSubmissions = writtenSubmissions.filter(sub => sub.courseId === course.id);

              let courseQuizScore = 0;
              let courseQuizTotalQuestions = 0;
              courseQuizAttempts.forEach(att => {
                courseQuizScore += att.score;
                courseQuizTotalQuestions += att.totalQuestions;
              });

              let courseWrittenGradedCount = 0;
              let courseWrittenMarksSum = 0;
              courseWrittenSubmissions.forEach(sub => {
                if (sub.graded) {
                    courseWrittenGradedCount++;
                    courseWrittenMarksSum += sub.marks || 0;
                }
              });

              return (
                <div key={course.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">{course.title}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <FaClipboardList className="text-indigo-600 mr-2" />
                      <p className="text-gray-700">Quizzes: <span className="font-semibold">{courseQuizAttempts.length} attempted</span></p>
                    </div>
                    <div className="flex items-center">
                      <FaCheckCircle className="text-green-600 mr-2" />
                      <p className="text-gray-700">Quiz Score: <span className="font-semibold">{courseQuizScore} / {courseQuizTotalQuestions}</span></p>
                    </div>
                    <div className="flex items-center">
                      <FaFilePdf className="text-red-600 mr-2" />
                      <p className="text-gray-700">Written Exams: <span className="font-semibold">{courseWrittenSubmissions.length} submitted, {courseWrittenGradedCount} graded</span></p>
                    </div>
                    {courseWrittenGradedCount > 0 && (
                        <div className="flex items-center">
                            <FaClipboardList className="text-purple-600 mr-2" />
                            <p className="text-gray-700">Written Exam Marks: <span className="font-semibold">{courseWrittenMarksSum} total</span></p>
                        </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProgress;