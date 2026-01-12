import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaSpinner, FaUpload, FaFilePdf, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const SubmitWrittenExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answerFile, setAnswerFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      setError("");
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("You must be logged in to submit an exam.");
          setLoading(false);
          return;
        }

        const examDocRef = doc(db, "writtenExams", examId);
        const examDoc = await getDoc(examDocRef);

        if (!examDoc.exists()) {
          setError("Written exam not found.");
          setLoading(false);
          return;
        }

        setExam({ id: examDoc.id, ...examDoc.data() });
      } catch (err) {
        console.error("Error fetching exam:", err);
        setError("Failed to load exam details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  const uploadPdfToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "edutech_exam_submissions"); // Specific preset for submissions
      formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("PDF upload failed");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      setError("Failed to upload answer sheet to Cloudinary.");
      return null;
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAnswerFile(e.target.files[0]);
    } else {
      setAnswerFile(null);
    }
  };

  const handleSubmitAnswerSheet = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (!answerFile) {
      setError("Please select a PDF file to upload.");
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to submit an exam.");
        setLoading(false);
        return;
      }

      const answerPdfUrl = await uploadPdfToCloudinary(answerFile);
      if (!answerPdfUrl) {
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "writtenExamSubmissions"), {
        examId: exam.id,
        studentId: user.uid,
        courseId: exam.courseId,
        answerPdfUrl: answerPdfUrl,
        submittedAt: serverTimestamp(),
        graded: false, // Mark as not yet graded
        marks: null, // Marks will be assigned by faculty
      });

      setSubmitted(true);
      setSuccessMessage("Answer sheet submitted successfully!");
      setAnswerFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear file input
      }
    } catch (err) {
      console.error("Error submitting answer sheet:", err);
      setError("Failed to submit answer sheet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
        <p className="ml-4 text-lg text-gray-700">Loading exam...</p>
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

  if (!exam) {
    return null; // Should not happen if error handled
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 flex items-center">
          <FaFilePdf className="mr-3 text-indigo-600" /> {exam.title}
        </h1>
        <p className="text-gray-600 mb-6">{exam.description}</p>

        {submitted ? (
          <div className="text-center py-10">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Submission Successful!</h2>
            <p className="text-xl text-gray-700">{successMessage}</p>
            <p className="text-gray-600 mt-4">
              Your answer sheet has been submitted. The faculty will review and grade it.
            </p>
            <button
              onClick={() => navigate("/student/test")}
              className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-lg"
            >
              Back to Tests
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitAnswerSheet} className="space-y-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Exam Questions:</h3>
              <a
                href={exam.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 transition-colors duration-200"
              >
                <FaFilePdf className="mr-2 text-xl" /> View Question Paper (PDF)
              </a>
            </div>

            <div className="mb-8">
              <label htmlFor="answerPdfUpload" className="block text-gray-700 text-sm font-bold mb-2">
                Upload Your Answer Sheet (PDF)
              </label>
              <input
                type="file"
                id="answerPdfUpload"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center justify-center w-full px-6 py-3 border-2 border-dashed border-indigo-300 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <FaUpload className="mr-3 text-2xl" />
                {answerFile ? answerFile.name : "Choose your Answer PDF File"}
              </button>
              {answerFile && (
                <p className="text-sm text-gray-500 mt-2">
                  Selected: {answerFile.name}
                </p>
              )}
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-lg shadow-md hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-3" />
              ) : (
                <FaCheckCircle className="mr-3" />
              )}
              {loading ? "Submitting..." : "Submit Answer Sheet"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubmitWrittenExam;