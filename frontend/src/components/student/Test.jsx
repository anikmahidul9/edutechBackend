import React, { useState, useEffect } from "react";
import { FaVial, FaSpinner, FaBookOpen, FaClipboardList, FaFilePdf, FaArrowRight, FaRedo, FaChartLine, FaTrophy } from "react-icons/fa";
import { auth, db } from "../../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";

const Test = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [availableWrittenExams, setAvailableWrittenExams] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [writtenExamSubmissions, setWrittenExamSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudentExams = async () => {
      setLoading(true);
      setError("");
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("You must be logged in to view tests.");
          setLoading(false);
          return;
        }

        // 1. Fetch enrolled course IDs
        const myCoursesRef = collection(db, "users", user.uid, "my_courses");
        const myCoursesSnapshot = await getDocs(myCoursesRef);
        const enrolledCourseIds = myCoursesSnapshot.docs.map((doc) => doc.id);

        if (enrolledCourseIds.length === 0) {
          setError("You are not enrolled in any courses yet.");
          setLoading(false);
          return;
        }

        // 2. Fetch details of enrolled courses
        const coursesRef = collection(db, "courses");
        const coursesQ = query(coursesRef, where("__name__", "in", enrolledCourseIds));
        const coursesSnapshot = await getDocs(coursesQ);
        const coursesData = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
        }));
        setEnrolledCourses(coursesData);

        // 3. Fetch quizzes for enrolled courses
        const quizzesRef = collection(db, "quizzes");
        const quizzesQ = query(quizzesRef, where("courseId", "in", enrolledCourseIds));
        const quizzesSnapshot = await getDocs(quizzesQ);
        const quizzesData = quizzesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "quiz",
        }));
        setAvailableQuizzes(quizzesData);

        // 4. Fetch written exams for enrolled courses
        const writtenExamsRef = collection(db, "writtenExams");
        const writtenExamsQ = query(writtenExamsRef, where("courseId", "in", enrolledCourseIds));
        const writtenExamsSnapshot = await getDocs(writtenExamsQ);
        const writtenExamsData = writtenExamsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "writtenExam",
        }));
        setAvailableWrittenExams(writtenExamsData);

        // 5. Fetch ALL student's quiz attempts
        const quizAttemptsRef = collection(db, "quizAttempts");
        const quizAttemptsQ = query(quizAttemptsRef, where("studentId", "==", user.uid));
        const quizAttemptsSnapshot = await getDocs(quizAttemptsQ);
        const attemptsData = quizAttemptsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate() || new Date(),
        }));
        setQuizAttempts(attemptsData);

        // 6. Fetch student's written exam submissions
        const writtenSubmissionsRef = collection(db, "writtenExamSubmissions");
        const writtenSubmissionsQ = query(writtenSubmissionsRef, where("studentId", "==", user.uid));
        const writtenSubmissionsSnapshot = await getDocs(writtenSubmissionsQ);
        const submissionsData = writtenSubmissionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate() || new Date(),
          gradedAt: doc.data().gradedAt?.toDate() || null,
        }));
        setWrittenExamSubmissions(submissionsData);

      } catch (err) {
        console.error("Error fetching student exams:", err);
        setError("Failed to load tests and quizzes.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentExams();
  }, []);

  // Helper function to get quiz attempts for a specific quiz
  const getQuizAttempts = (quizId) => {
    return quizAttempts.filter(attempt => attempt.quizId === quizId);
  };

  // Helper function to get the best attempt for a quiz
  const getBestAttempt = (quizId) => {
    const attempts = getQuizAttempts(quizId);
    if (attempts.length === 0) return null;
    
    return attempts.reduce((best, current) => {
      const bestPercentage = (best.score / best.totalQuestions) * 100;
      const currentPercentage = (current.score / current.totalQuestions) * 100;
      return currentPercentage > bestPercentage ? current : best;
    });
  };

  // Helper function to get the latest attempt for a quiz
  const getLatestAttempt = (quizId) => {
    const attempts = getQuizAttempts(quizId);
    if (attempts.length === 0) return null;
    
    return attempts.reduce((latest, current) => {
      return new Date(current.submittedAt) > new Date(latest.submittedAt) ? current : latest;
    });
  };

  // Helper function to get written exam submission for a specific exam
  const getWrittenExamSubmission = (examId) => {
    const submissions = writtenExamSubmissions.filter(sub => sub.examId === examId);
    if (submissions.length === 0) return null;
    
    // Return the latest submission
    return submissions.reduce((latest, current) => {
      return new Date(current.submittedAt) > new Date(latest.submittedAt) ? current : latest;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
        <p className="ml-4 text-lg text-gray-700">Loading tests and quizzes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4 flex items-center gap-3">
          <FaVial className="text-red-600" /> Error
        </h1>
        <p className="text-red-500">{error}</p>
        {error === "You are not enrolled in any courses yet." && (
          <div className="mt-6">
            <Link
              to="/student/courses"
              className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
            >
              Browse Available Courses <FaArrowRight className="ml-3" />
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Group exams by course
  const examsByCourse = enrolledCourses.reduce((acc, course) => {
    acc[course.id] = {
      courseTitle: course.title,
      quizzes: availableQuizzes.filter((quiz) => quiz.courseId === course.id),
      writtenExams: availableWrittenExams.filter((exam) => exam.courseId === course.id),
    };
    return acc;
  }, {});

  const hasExams = availableQuizzes.length > 0 || availableWrittenExams.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <FaVial className="text-indigo-600" /> My Tests & Quizzes
        </h1>

        {!hasExams ? (
          <div className="text-center py-12">
            <FaClipboardList className="text-gray-400 text-6xl mx-auto mb-6" />
            <p className="text-xl text-gray-600 mb-6">
              No tests or quizzes available for your enrolled courses yet.
            </p>
            <Link
              to="/student/courses"
              className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
            >
              Browse Available Courses <FaArrowRight className="ml-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(examsByCourse).map((courseId) => {
              const courseExams = examsByCourse[courseId];
              if (courseExams.quizzes.length === 0 && courseExams.writtenExams.length === 0) {
                return null;
              }
              return (
                <div key={courseId} className="border border-gray-200 rounded-2xl p-6 bg-gray-50">
                  <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                    <FaBookOpen className="mr-3 text-indigo-600" /> {courseExams.courseTitle}
                  </h2>

                  {courseExams.quizzes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <FaChartLine className="mr-2 text-indigo-500" /> Quizzes:
                      </h3>
                      <div className="space-y-3">
                        {courseExams.quizzes.map((quiz) => {
                          const attempts = getQuizAttempts(quiz.id);
                          const bestAttempt = getBestAttempt(quiz.id);
                          const latestAttempt = getLatestAttempt(quiz.id);
                          const attemptCount = attempts.length;
                          
                          return (
                            <div
                              key={quiz.id}
                              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                <div>
                                  <p className="font-bold text-gray-800 text-lg">
                                    {quiz.quizTitle}
                                  </p>
                                  {attemptCount > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <span className="text-sm text-gray-500">
                                        Attempts: {attemptCount}
                                      </span>
                                      {bestAttempt && (
                                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                          <FaTrophy className="inline mr-1" /> Best: {bestAttempt.score}/{bestAttempt.totalQuestions}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="mt-2 sm:mt-0">
                                  {attemptCount > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {latestAttempt && (
                                        <Link
                                          to={`/student/take-quiz/${quiz.id}`}
                                          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-md hover:from-indigo-600 hover:to-blue-600 transition-colors text-sm flex items-center"
                                        >
                                          <FaRedo className="mr-2" /> Retake Quiz
                                        </Link>
                                      )}
                        
                                    </div>
                                  ) : (
                                    <Link
                                      to={`/student/take-quiz/${quiz.id}`}
                                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-md hover:from-emerald-600 hover:to-teal-600 transition-colors text-sm"
                                    >
                                      Take Quiz
                                    </Link>
                                  )}
                                </div>
                              </div>
                              
                              {latestAttempt && (
                                <div className="mt-2 p-2 bg-gray-50 rounded">
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Latest attempt:</span> {latestAttempt.score}/{latestAttempt.totalQuestions} 
                                    ({Math.round((latestAttempt.score / latestAttempt.totalQuestions) * 100)}%)
                                    <span className="ml-2 text-xs text-gray-500">
                                      on {latestAttempt.submittedAt.toLocaleDateString()}
                                    </span>
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {courseExams.writtenExams.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-4">Written Exams:</h3>
                      <div className="space-y-3">
                        {courseExams.writtenExams.map((exam) => {
                          const submission = getWrittenExamSubmission(exam.id);
                          let statusText = "Not Submitted";
                          let statusColor = "text-red-500";
                          let actionButton = (
                            <Link
                              to={`/student/submit-written-exam/${exam.id}`}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-md hover:from-emerald-600 hover:to-teal-600 transition-colors text-sm"
                            >
                              Submit Exam
                            </Link>
                          );

                          if (submission) {
                            if (submission.graded) {
                              statusText = `Graded: ${submission.marks || 0}/100`;
                              statusColor = "text-green-600";
                              actionButton = (
                                <Link
                                  to={`/student/view-submission/${submission.id}`}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md hover:from-blue-600 hover:to-indigo-600 transition-colors text-sm"
                                >
                                  View Submission
                                </Link>
                              );
                            } else {
                              statusText = "Submitted (Pending Grading)";
                              statusColor = "text-yellow-600";
                              actionButton = (
                                <Link
                                  to={`/student/view-submission/${submission.id}`}
                                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-md hover:from-yellow-600 hover:to-amber-600 transition-colors text-sm"
                                >
                                  View Submission
                                </Link>
                              );
                            }
                          }
                          return (
                            <div
                              key={exam.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                            >
                              <div>
                                <p className="font-bold text-gray-800">
                                  {exam.title}
                                </p>
                                <div className={`mt-1 text-sm ${statusColor} flex items-center`}>
                                  <span className={`w-2 h-2 rounded-full mr-2 ${statusColor.replace('text-', 'bg-')}`}></span>
                                  {statusText}
                                </div>
                                {submission && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Submitted: {submission.submittedAt.toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <div className="mt-2 sm:mt-0">
                                {actionButton}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Test;