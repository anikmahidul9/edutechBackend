import React, { useState, useEffect } from "react";
import { FaVial, FaSpinner, FaBookOpen, FaClipboardList, FaFilePdf, FaArrowRight } from "react-icons/fa";
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

        // 5. Fetch student's quiz attempts
        const quizAttemptsRef = collection(db, "quizAttempts");
        const quizAttemptsQ = query(quizAttemptsRef, where("studentId", "==", user.uid));
        const quizAttemptsSnapshot = await getDocs(quizAttemptsQ);
        const attemptsData = quizAttemptsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuizAttempts(attemptsData);

        // 6. Fetch student's written exam submissions
        const writtenSubmissionsRef = collection(db, "writtenExamSubmissions");
        const writtenSubmissionsQ = query(writtenSubmissionsRef, where("studentId", "==", user.uid));
        const writtenSubmissionsSnapshot = await getDocs(writtenSubmissionsQ);
        const submissionsData = writtenSubmissionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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
                return null; // Skip if no exams for this course
              }
              return (
                <div key={courseId} className="border border-gray-200 rounded-2xl p-6 bg-gray-50">
                  <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                    <FaBookOpen className="mr-3 text-indigo-600" /> {courseExams.courseTitle}
                  </h2>

                  {courseExams.quizzes.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-700 mb-4">Quizzes:</h3>
                      <div className="space-y-3">
                        {courseExams.quizzes.map((quiz) => {
                          const attempt = quizAttempts.find(
                            (att) => att.quizId === quiz.id
                          );
                          return (
                            <div
                              key={quiz.id}
                              className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                            >
                              <p className="font-medium text-gray-800">
                                {quiz.quizTitle}
                                {attempt && (
                                  <span className="ml-3 text-sm text-gray-500">
                                    (Last Score: {attempt.score}/{attempt.totalQuestions})
                                  </span>
                                )}
                              </p>
                              {attempt ? (
                                <Link
                                  to={`/student/take-quiz/${quiz.id}`} // Route will display results if submitted
                                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                                >
                                  View Results / Retake
                                </Link>
                              ) : (
                                <Link
                                  to={`/student/take-quiz/${quiz.id}`}
                                  className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors text-sm"
                                >
                                  Take Quiz
                                </Link>
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
                          const submission = writtenExamSubmissions.find(
                            (sub) => sub.examId === exam.id
                          );
                          let statusText = "Not Submitted";
                          let statusColor = "text-red-500";
                          let actionButton = (
                            <Link
                              to={`/student/submit-written-exam/${exam.id}`}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors text-sm"
                            >
                              Submit Exam
                            </Link>
                          );

                          if (submission) {
                            if (submission.graded) {
                              statusText = `Graded (${submission.marks || 0} Marks)`;
                              statusColor = "text-green-600";
                              actionButton = (
                                <Link
                                  to={`/student/view-submission/${submission.id}`} // Placeholder for viewing submission
                                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                                >
                                  View Submission
                                </Link>
                              );
                            } else {
                              statusText = "Submitted (Pending Grading)";
                              statusColor = "text-yellow-600";
                              actionButton = (
                                <Link
                                  to={`/student/view-submission/${submission.id}`} // Placeholder for viewing submission
                                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                                >
                                  View Submission
                                </Link>
                              );
                            }
                          }
                          return (
                            <div
                              key={exam.id}
                              className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                            >
                              <p className="font-medium text-gray-800">
                                {exam.title}{" "}
                                <span className={`ml-2 text-sm ${statusColor}`}>
                                  ({statusText})
                                </span>
                              </p>
                              {actionButton}
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