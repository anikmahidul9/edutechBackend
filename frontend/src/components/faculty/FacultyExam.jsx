import React, { useState, useEffect, useRef } from "react";
import {
  FaPlus,
  FaTrash,
  FaSave,
  FaClipboardList,
  FaBookOpen,
  FaSpinner,
  FaUpload,
  FaFilePdf,
} from "react-icons/fa";
import { auth, db } from "../../config/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { uploadPreset } from "../../config/cloudinary";
const FacultyExam = () => {
  const [activeTab, setActiveTab] = useState("quiz"); // 'quiz' or 'writtenExam'
  // Quiz states
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  // Written Exam states
  const [writtenExamTitle, setWrittenExamTitle] = useState("");
  const [writtenExamDescription, setWrittenExamDescription] = useState("");
  const [writtenExamFile, setWrittenExamFile] = useState(null);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: -1, // Index of the correct option
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [facultyWrittenExams, setFacultyWrittenExams] = useState([]);
  const [submissionsByExam, setSubmissionsByExam] = useState({});

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          return;
        }

        // Fetch faculty's courses
        const coursesQ = query(
          collection(db, "courses"),
          where("facultyId", "==", user.uid)
        );
        const coursesSnapshot = await getDocs(coursesQ);
        const facultyCourses = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(facultyCourses);

        // Fetch faculty's written exams
        const writtenExamsQ = query(
          collection(db, "writtenExams"),
          where("facultyId", "==", user.uid)
        );
        const writtenExamsSnapshot = await getDocs(writtenExamsQ);
        const writtenExamsData = writtenExamsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFacultyWrittenExams(writtenExamsData);
      } catch (err) {
        console.error("Error fetching faculty data:", err);
        setError("Failed to load your data.");
      }
    };

    fetchFacultyData();
  }, []);

  // const uploadPdfToCloudinary = async (file) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("file", file);
  //     formData.append("upload_preset", uploadPreset); // Use imported uploadPreset
  //     formData.append("resource_type", "raw"); // Explicitly set resource type for non-image files

  //     const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  //     const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/auto/upload`; // Corrected URL with /auto/upload

  //     const response = await fetch(
  //       uploadUrl,
  //       {
  //         method: "POST",
  //         body: formData,
  //       }
  //     );

  //     const data = await response.json();
  //     console.log("Cloudinary response:", data);


  //     if (!response.ok) {
  //       throw new Error(data.error?.message || "PDF upload failed");
  //     }

  //     // --- Client-side URL Correction Workaround ---
  //     // If Cloudinary's preset forces resource_type to 'image' for a PDF,
  //     // we manually correct the URL to use the 'raw' delivery path.
  //     let secureUrl = data.secure_url;
  //     if (data.resource_type === "image" && data.format === "pdf") {
  //       const rawUrl = secureUrl.replace('/image/upload/', '/raw/upload/');
  //       return rawUrl;
  //     }

  //     return secureUrl;
  //   } catch (uploadError) {
  //     console.error("Cloudinary upload error:", uploadError);
  //     setError(`Failed to upload PDF: ${uploadError.message}. 
  //       Please check: 
  //       1. Your Cloudinary upload preset exists and is named "${uploadPreset}".
  //       2. The preset is set to "Unsigned" mode.
  //       3. Your Cloudinary cloud name is correct in your .env file.`);
  //     return null;
  //   }
  // };

  const uploadPdfToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset); // Use imported uploadPreset
      formData.append("resource_type", "raw"); // Explicitly set resource type for non-image files

      const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/auto/upload`; // Corrected URL with /auto/upload

      const response = await fetch(
        uploadUrl,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      console.log("Cloudinary response:", data);


      if (!response.ok) {
        throw new Error(data.error?.message || "PDF upload failed");
      }

      // --- Client-side URL Correction Workaround ---
      // If Cloudinary's preset forces resource_type to 'image' for a PDF,
      // we manually correct the URL to use the 'raw' delivery path.
      let secureUrl = data.secure_url;
      if (data.resource_type === "image" && data.format === "pdf") {
        const rawUrl = secureUrl.replace('/image/upload/', '/raw/upload/');
        return rawUrl;
      }

      return secureUrl;
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      setError(`Failed to upload PDF: ${uploadError.message}. 
        Please check: 
        1. Your Cloudinary upload preset exists and is named "${uploadPreset}".
        2. The preset is set to "Unsigned" mode.
        3. Your Cloudinary cloud name is correct in your .env file.`);
      return null;
    }
  };

  
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: -1,
      },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleQuestionTextChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].questionText = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = oIndex;
    setQuestions(newQuestions);
  };

  const validateForm = () => {
    if (!quizTitle.trim() || !quizDescription.trim() || !selectedCourse) {
      setError("Please fill in all quiz details and select a course.");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1}: Question text cannot be empty.`);
        return false;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Question ${i + 1}: Option ${j + 1} cannot be empty.`);
          return false;
        }
      }
      if (q.correctAnswer === -1) {
        setError(`Question ${i + 1}: Please select a correct answer.`);
        return false;
      }
    }
    return true;
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to create a quiz.");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "quizzes"), {
        quizTitle,
        quizDescription,
        courseId: selectedCourse,
        facultyId: user.uid,
        questions,
        createdAt: serverTimestamp(),
      });

      setSuccess("Quiz created successfully!");
      setQuizTitle("");
      setQuizDescription("");
      setSelectedCourse("");
      setQuestions([
        {
          questionText: "",
          options: ["", "", "", ""],
          correctAnswer: -1,
        },
      ]);
    } catch (err) {
      console.error("Error saving quiz:", err);
      setError("Failed to save quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWrittenExamFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file only.");
        setWrittenExamFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      setWrittenExamFile(file);
    }
  };

  const handleSaveWrittenExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (
      !writtenExamTitle.trim() ||
      !writtenExamDescription.trim() ||
      !selectedCourse ||
      !writtenExamFile
    ) {
      setError("Please fill all fields and upload a PDF for the written exam.");
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to upload an exam.");
        setLoading(false);
        return;
      }

      const pdfUrl = await uploadPdfToCloudinary(writtenExamFile);
      if (!pdfUrl) {
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "writtenExams"), {
        title: writtenExamTitle,
        description: writtenExamDescription,
        courseId: selectedCourse,
        facultyId: user.uid,
        pdfUrl: pdfUrl,
        fileName: writtenExamFile.name,
        fileSize: writtenExamFile.size,
        createdAt: serverTimestamp(),
      });

      setSuccess("Written exam uploaded successfully!");
      setWrittenExamTitle("");
      setWrittenExamDescription("");
      setSelectedCourse("");
      setWrittenExamFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear file input
      }
      
      // Refresh the exams list
      const writtenExamsQ = query(
        collection(db, "writtenExams"),
        where("facultyId", "==", user.uid)
      );
      const writtenExamsSnapshot = await getDocs(writtenExamsQ);
      const writtenExamsData = writtenExamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFacultyWrittenExams(writtenExamsData);
      
    } catch (err) {
      console.error("Error saving written exam:", err);
      setError("Failed to upload written exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissionsForExam = async (examId) => {
    setSubmissionsByExam((prev) => ({
      ...prev,
      [examId]: { loading: true, data: [] },
    }));
    try {
      const submissionsQ = query(
        collection(db, "writtenExamSubmissions"),
        where("examId", "==", examId)
      );
      const submissionsSnapshot = await getDocs(submissionsQ);
      const submissionsData = await Promise.all(
        submissionsSnapshot.docs.map(async (docSnap) => {
          const submission = { id: docSnap.id, ...docSnap.data() };
          // Fetch student name
          const studentDoc = await getDoc(doc(db, "users", submission.studentId));
          const studentName = studentDoc.exists()
            ? studentDoc.data().fullName || "Unknown Student"
            : "Unknown Student";
          return { ...submission, studentName };
        })
      );
      setSubmissionsByExam((prev) => ({
        ...prev,
        [examId]: { loading: false, data: submissionsData },
      }));
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Failed to fetch submissions.");
      setSubmissionsByExam((prev) => ({
        ...prev,
        [examId]: { loading: false, data: [] },
      }));
    }
  };

  const toggleSubmissions = (examId) => {
    if (submissionsByExam[examId] && submissionsByExam[examId].data) {
      // If already fetched and visible, hide it
      setSubmissionsByExam((prev) => ({
        ...prev,
        [examId]: null, // Clear data to hide and allow refetching next time
      }));
    } else {
      fetchSubmissionsForExam(examId);
    }
  };

  const handleMarksChange = (examId, submissionId, marks) => {
    setSubmissionsByExam((prev) => {
      const updatedSubmissions = prev[examId].data.map((submission) =>
        submission.id === submissionId ? { ...submission, marks: marks } : submission
      );
      return {
        ...prev,
        [examId]: { ...prev[examId], data: updatedSubmissions },
      };
    });
  };

  const handleSaveMarks = async (examId, submissionId, marks) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Find the submission and ensure marks are valid
      const currentSubmissionData = submissionsByExam[examId].data.find(
        (sub) => sub.id === submissionId
      );
      if (!currentSubmissionData || marks === undefined || marks === null || marks === "") {
        setError("Invalid marks provided.");
        setLoading(false);
        return;
      }

      // Update the marks for the specific submission in Firestore
      const submissionRef = doc(db, "writtenExamSubmissions", submissionId);
      await setDoc(
        submissionRef,
        {
          marks: parseFloat(marks), // Store marks as a number
          graded: true,
          gradedAt: serverTimestamp(),
        },
        { merge: true }
      ); // Use merge to only update the marks field

      setSuccess("Marks saved successfully!");
    } catch (err) {
      console.error("Error saving marks:", err);
      setError("Failed to save marks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 flex items-center">
          <FaClipboardList className="mr-4 text-emerald-600" /> Exam Management
        </h1>

        {/* Tab Buttons */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`py-3 px-6 text-lg font-semibold transition-colors duration-300 ${
              activeTab === "quiz"
                ? "border-b-4 border-emerald-500 text-emerald-700"
                : "text-gray-500 hover:text-emerald-700"
            }`}
            onClick={() => setActiveTab("quiz")}
          >
            Create MCQ Quiz
          </button>
          <button
            className={`py-3 px-6 text-lg font-semibold transition-colors duration-300 ${
              activeTab === "writtenExam"
                ? "border-b-4 border-emerald-500 text-emerald-700"
                : "text-gray-500 hover:text-emerald-700"
            }`}
            onClick={() => setActiveTab("writtenExam")}
          >
            Manage Written Exams
          </button>
        </div>

        {success && (
          <div
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg shadow-sm"
            role="alert"
          >
            {success}
          </div>
        )}
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {activeTab === "quiz" && (
          <form onSubmit={handleSaveQuiz} className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            {/* Quiz Details */}
            <div className="mb-6">
              <label htmlFor="quizTitle" className="block text-gray-700 text-sm font-bold mb-2">
                Quiz Title
              </label>
              <input
                type="text"
                id="quizTitle"
                className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., Introduction to React Quiz"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="quizDescription"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Quiz Description
              </label>
              <textarea
                id="quizDescription"
                className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent h-24 resize-none"
                placeholder="Provide a brief description for the quiz."
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="mb-8">
              <label htmlFor="selectCourse" className="block text-gray-700 text-sm font-bold mb-2">
                Assign to Course
              </label>
              <div className="relative">
                <select
                  id="selectCourse"
                  className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white pr-10"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  required
                >
                  <option value="">-- Select a Course --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                  <FaBookOpen className="text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaPlus className="mr-3 text-emerald-600" /> Questions
            </h2>

            {questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="bg-gray-50 rounded-xl p-6 mb-6 shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Question {qIndex + 1}
                  </h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor={`questionText-${qIndex}`}
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Question Text
                  </label>
                  <input
                    type="text"
                    id={`questionText-${qIndex}`}
                    className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your question here"
                    value={q.questionText}
                    onChange={(e) =>
                      handleQuestionTextChange(qIndex, e.target.value)
                    }
                    required
                  />
                </div>

                <div className="mb-4">
                  <p className="block text-gray-700 text-sm font-bold mb-2">
                    Options (Select Correct Answer)
                  </p>
                  <div className="space-y-3">
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center">
                        <input
                          type="radio"
                          id={`option-${qIndex}-${oIndex}`}
                          name={`question-${qIndex}-correct-answer`}
                          className="form-radio h-4 w-4 text-emerald-600 transition-colors duration-150 focus:ring-emerald-500"
                          checked={q.correctAnswer === oIndex}
                          onChange={() =>
                            handleCorrectAnswerChange(qIndex, oIndex)
                          }
                        />
                        <label htmlFor={`option-${qIndex}-${oIndex}`} className="ml-3 flex-1">
                          <input
                            type="text"
                            className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder={`Option ${oIndex + 1}`}
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(qIndex, oIndex, e.target.value)
                            }
                            required
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center px-6 py-3 border border-emerald-500 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors mb-8"
            >
              <FaPlus className="mr-2" /> Add Question
            </button>

            <button
              type="submit"
              className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105"
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-3" />
              ) : (
                <FaSave className="mr-3" />
              )}
              {loading ? "Saving Quiz..." : "Save Quiz"}
            </button>
          </form>
        )}

        {activeTab === "writtenExam" && (
          <div>
            <form
              onSubmit={handleSaveWrittenExam}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaUpload className="mr-3 text-emerald-600" /> Upload Written Exam Questions
              </h2>

              {/* Written Exam Details */}
              <div className="mb-6">
                <label
                  htmlFor="writtenExamTitle"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Exam Title
                </label>
                <input
                  type="text"
                  id="writtenExamTitle"
                  className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Midterm Exam - Web Development"
                  value={writtenExamTitle}
                  onChange={(e) => setWrittenExamTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="writtenExamDescription"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Exam Description
                </label>
                <textarea
                  id="writtenExamDescription"
                  className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent h-24 resize-none"
                  placeholder="Provide instructions or a description for the written exam."
                  value={writtenExamDescription}
                  onChange={(e) => setWrittenExamDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="mb-8">
                <label
                  htmlFor="selectCourseWritten"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Assign to Course
                </label>
                <div className="relative">
                  <select
                    id="selectCourseWritten"
                    className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white pr-10"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    required
                  >
                    <option value="">-- Select a Course --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                    <FaBookOpen className="text-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <label htmlFor="pdfUpload" className="block text-gray-700 text-sm font-bold mb-2">
                  Upload Exam PDF
                </label>
                <input
                  type="file"
                  id="pdfUpload"
                  accept="application/pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleWrittenExamFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center justify-center w-full px-6 py-3 border-2 border-dashed border-emerald-300 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <FaFilePdf className="mr-3 text-2xl" />
                  {writtenExamFile ? writtenExamFile.name : "Choose PDF File"}
                </button>
                {writtenExamFile && (
                  <p className="text-sm text-gray-500 mt-2">
                    Selected: {writtenExamFile.name} ({(writtenExamFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <FaSpinner className="animate-spin mr-3" />
                ) : (
                  <FaSave className="mr-3" />
                )}
                {loading ? "Uploading Exam..." : "Upload Exam"}
              </button>
            </form>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaClipboardList className="mr-3 text-emerald-600" /> My Written Exams
              </h2>

              {facultyWrittenExams.length === 0 ? (
                <p className="text-gray-600">You haven't uploaded any written exams yet.</p>
              ) : (
                <div className="space-y-4">
                  {facultyWrittenExams.map((exam) => (
                    <div key={exam.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            {exam.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Course: {courses.find((c) => c.id === exam.courseId)?.title || "N/A"}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleSubmissions(exam.id)}
                          className="text-emerald-600 hover:text-emerald-800 font-medium px-4 py-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          {submissionsByExam[exam.id] ? "Hide Submissions" : "View Submissions"}
                        </button>
                      </div>
                      {submissionsByExam[exam.id] && (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <h4 className="text-lg font-semibold text-gray-700 mb-3">
                            Submissions:
                          </h4>
                          {submissionsByExam[exam.id].loading ? (
                            <p className="text-gray-500 flex items-center">
                              <FaSpinner className="animate-spin mr-2" /> Loading submissions...
                            </p>
                          ) : submissionsByExam[exam.id].data.length === 0 ? (
                            <p className="text-gray-500">No submissions yet for this exam.</p>
                          ) : (
                            <div className="space-y-3">
                              {submissionsByExam[exam.id].data.map((submission) => (
                                <div
                                  key={submission.id}
                                  className="bg-gray-50 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center"
                                >
                                  <div>
                                    <p className="font-medium text-gray-800">
                                      {submission.studentName}
                                    </p>
                                    <a
                                      href={submission.answerPdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline text-sm flex items-center"
                                    >
                                      <FaFilePdf className="mr-1" /> View Submission
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                    <input
                                      type="number"
                                      placeholder="Marks"
                                      value={submission.marks || ""}
                                      onChange={(e) =>
                                        handleMarksChange(exam.id, submission.id, e.target.value)
                                      }
                                      className="w-24 px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                    <button
                                      onClick={() =>
                                        handleSaveMarks(exam.id, submission.id, submission.marks)
                                      }
                                      className="bg-emerald-500 text-white px-3 py-1 rounded-md text-sm hover:bg-emerald-600 transition-colors"
                                      disabled={loading}
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyExam;