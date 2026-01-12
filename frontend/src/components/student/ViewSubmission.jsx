import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { FaSpinner, FaFilePdf, FaArrowLeft, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const ViewSubmission = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("You must be logged in to view submissions.");
          setLoading(false);
          return;
        }

        const submissionDocRef = doc(db, "writtenExamSubmissions", submissionId);
        const submissionDoc = await getDoc(submissionDocRef);

        if (!submissionDoc.exists()) {
          setError("Submission not found.");
          setLoading(false);
          return;
        }

        const submissionData = { id: submissionDoc.id, ...submissionDoc.data() };

        // Ensure the submission belongs to the current user
        if (submissionData.studentId !== user.uid) {
            setError("You do not have permission to view this submission.");
            setLoading(false);
            return;
        }
        setSubmission(submissionData);

        // Fetch exam details
        const examDocRef = doc(db, "writtenExams", submissionData.examId);
        const examDoc = await getDoc(examDocRef);
        if (examDoc.exists()) {
            setExam({ id: examDoc.id, ...examDoc.data() });
        } else {
            console.warn("Associated exam not found for submission:", submissionData.examId);
        }

      } catch (err) {
        console.error("Error fetching submission details:", err);
        setError("Failed to load submission details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionDetails();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
        <p className="ml-4 text-lg text-gray-700">Loading submission...</p>
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
        <button
          onClick={() => navigate("/student/test")}
          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Tests
        </button>
      </div>
    );
  }

  if (!submission) {
    return null; // Should not happen if error handled
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <button
          onClick={() => navigate("/student/test")}
          className="mb-6 inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Back to Tests
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 flex items-center">
          <FaFilePdf className="mr-3 text-indigo-600" /> Submission for {exam?.title || "Written Exam"}
        </h1>
        <p className="text-gray-600 mb-6">Submitted on: {submission.submittedAt?.toDate().toLocaleString()}</p>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Answer Sheet:</h3>
            <a
                href={submission.answerPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 transition-colors duration-200"
            >
                <FaFilePdf className="mr-2 text-xl" /> View Submitted PDF
            </a>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Grading Status:</h3>
            {submission.graded ? (
                <div className="flex items-center text-green-600 font-bold text-lg">
                    <FaCheckCircle className="mr-2" /> Graded: {submission.marks !== null ? `${submission.marks} Marks` : "Marks not available"}
                </div>
            ) : (
                <div className="flex items-center text-yellow-600 font-bold text-lg">
                    <FaSpinner className="animate-spin mr-2" /> Pending Grading
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ViewSubmission;
