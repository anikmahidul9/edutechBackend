import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaSpinner, FaQuestionCircle, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError("");
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("You must be logged in to take a quiz.");
          setLoading(false);
          return;
        }

        const quizDocRef = doc(db, "quizzes", quizId);
        const quizDoc = await getDoc(quizDocRef);

        if (!quizDoc.exists()) {
          setError("Quiz not found.");
          setLoading(false);
          return;
        }

        setQuiz({ id: quizDoc.id, ...quizDoc.data() });
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to load quiz. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionIndex, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex,
    });
  };

  const handleSubmitQuiz = async () => {
    setLoading(true);
    setError("");
    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });
    const calculatedScore = correctCount; // Score is number of correct answers for now

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to submit a quiz.");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "quizAttempts"), {
        quizId: quiz.id,
        studentId: user.uid,
        courseId: quiz.courseId,
        selectedAnswers,
        score: calculatedScore,
        totalQuestions: quiz.questions.length,
        submittedAt: serverTimestamp(),
      });

      setScore(calculatedScore);
      setSubmitted(true);
      setSuccess("Quiz submitted successfully!"); // Assuming 'success' state exists
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError("Failed to submit quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
        <p className="ml-4 text-lg text-gray-700">Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4 flex items-center gap-3">
          <FaQuestionCircle className="text-red-600" /> Error
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

  if (!quiz) {
    return null; // Should not happen if error handled
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 flex items-center">
          <FaQuestionCircle className="mr-3 text-indigo-600" /> {quiz.quizTitle}
        </h1>
        <p className="text-gray-600 mb-6">{quiz.quizDescription}</p>

        {submitted ? (
          <div className="text-center py-10">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Quiz Completed!</h2>
            <p className="text-xl text-gray-700">You scored {score} out of {quiz.questions.length} questions.</p>
            <div className="mt-8 space-y-4 text-left">
              {quiz.questions.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border rounded-lg bg-gray-50">
                  <p className="font-bold text-gray-800 mb-2">Q{qIndex + 1}: {q.questionText}</p>
                  <ul className="space-y-1">
                    {q.options.map((option, oIndex) => (
                      <li key={oIndex} className={`flex items-center text-sm ${
                          oIndex === q.correctAnswer ? "text-green-600 font-semibold" : ""
                      }`}>
                        {selectedAnswers[qIndex] === oIndex && (
                            oIndex === q.correctAnswer ? (
                                <FaCheckCircle className="mr-2 text-green-500" />
                            ) : (
                                <FaTimesCircle className="mr-2 text-red-500" />
                            )
                        )}
                        <span>{String.fromCharCode(65 + oIndex)}. {option}</span>
                        {oIndex === q.correctAnswer && selectedAnswers[qIndex] !== oIndex && (
                            <span className="ml-2 text-green-600 font-semibold">(Correct Answer)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/student/test")}
              className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-lg"
            >
              Back to Tests
            </button>
          </div>
        ) : (
          <form className="space-y-6">
            {quiz.questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-gray-100 p-5 rounded-xl shadow-sm border border-gray-200">
                <p className="font-semibold text-lg text-gray-800 mb-3">
                  Q{qIndex + 1}: {q.questionText}
                </p>
                <div className="space-y-2">
                  {q.options.map((option, oIndex) => (
                    <label
                      key={oIndex}
                      className="flex items-center bg-white p-3 rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors duration-200"
                    >
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        checked={selectedAnswers[qIndex] === oIndex}
                        onChange={() => handleAnswerChange(qIndex, oIndex)}
                        className="form-radio h-4 w-4 text-indigo-600 transition-colors duration-150 focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-gray-700">
                        {String.fromCharCode(65 + oIndex)}. {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleSubmitQuiz}
              className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-lg shadow-md hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-3" />
              ) : (
                <FaCheckCircle className="mr-3" />
              )}
              {loading ? "Submitting..." : "Submit Quiz"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;
