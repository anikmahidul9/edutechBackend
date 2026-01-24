import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc } from "firebase/firestore";
import { FaSpinner, FaQuestionCircle, FaCheckCircle, FaTimesCircle, FaRedo } from "react-icons/fa";

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
  const [previousAttempts, setPreviousAttempts] = useState([]);

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

        // Fetch quiz details
        const quizDocRef = doc(db, "quizzes", quizId);
        const quizDoc = await getDoc(quizDocRef);

        if (!quizDoc.exists()) {
          setError("Quiz not found.");
          setLoading(false);
          return;
        }

        setQuiz({ id: quizDoc.id, ...quizDoc.data() });

        // Fetch previous attempts for this quiz
        const attemptsRef = collection(db, "quizAttempts");
        const attemptsQuery = query(
          attemptsRef, 
          where("quizId", "==", quizId), 
          where("studentId", "==", user.uid)
        );
        const querySnapshot = await getDocs(attemptsQuery);
        
        const attempts = [];
        querySnapshot.forEach((doc) => {
          attempts.push({
            id: doc.id,
            ...doc.data(),
            submittedAt: doc.data().submittedAt?.toDate() || new Date()
          });
        });
        
        setPreviousAttempts(attempts);
        
        // If there's a previous attempt, we can show the option to retake
        if (attempts.length > 0) {
          // Optionally, you can load the last attempt's answers here
          // For now, we'll start fresh
          setSelectedAnswers({});
        }
        
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
    
    // Validate that all questions are answered
    const unansweredQuestions = [];
    if (quiz) {
      quiz.questions.forEach((q, index) => {
        if (selectedAnswers[index] === undefined) {
          unansweredQuestions.push(index + 1);
        }
      });
    }
    
    if (unansweredQuestions.length > 0) {
      setError(`Please answer all questions. Unanswered questions: ${unansweredQuestions.join(', ')}`);
      setLoading(false);
      return;
    }

    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });
    const calculatedScore = correctCount;

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to submit a quiz.");
        setLoading(false);
        return;
      }

      // ALWAYS create a new attempt instead of updating
      // This allows multiple attempts to be tracked
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
      setSuccess("Quiz submitted successfully!");
      
      // Refresh previous attempts count
      const attemptsRef = collection(db, "quizAttempts");
      const attemptsQuery = query(
        attemptsRef, 
        where("quizId", "==", quizId), 
        where("studentId", "==", user.uid)
      );
      const querySnapshot = await getDocs(attemptsQuery);
      setPreviousAttempts(querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date()
      })));
      
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError("Failed to submit quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeQuiz = () => {
    setSubmitted(false);
    setSelectedAnswers({});
    setScore(0);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
        <p className="ml-4 text-lg text-gray-700">Loading quiz...</p>
      </div>
    );
  }

  if (error && !submitted) {
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
    return null;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center">
            <FaQuestionCircle className="mr-3 text-indigo-600" /> {quiz.quizTitle}
          </h1>
          {previousAttempts.length > 0 && !submitted && (
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
              Previous attempts: {previousAttempts.length}
            </div>
          )}
        </div>
        
        <p className="text-gray-600 mb-6">{quiz.quizDescription}</p>
        
        {!submitted && previousAttempts.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <FaRedo className="text-blue-500 mr-2" />
              <p className="text-blue-800 font-medium">
                You have {previousAttempts.length} previous attempt{previousAttempts.length !== 1 ? 's' : ''}.
              </p>
            </div>
            {previousAttempts.length > 0 && (
              <p className="text-blue-600 text-sm mt-1">
                Best score: {
                  Math.max(...previousAttempts.map(attempt => 
                    Math.round((attempt.score / attempt.totalQuestions) * 100)
                  ))
                }%
              </p>
            )}
          </div>
        )}

        {submitted ? (
          <div className="text-center py-10">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Quiz Completed!</h2>
            
            {/* Score Summary */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
              <div className="flex justify-center items-center space-x-8 mb-2">
                <div className="text-center">
                  <p className="text-5xl font-bold text-gray-800">{score}/{quiz.questions.length}</p>
                  <p className="text-gray-600">Score</p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-bold text-gray-800">
                    {Math.round((score / quiz.questions.length) * 100)}%
                  </p>
                  <p className="text-gray-600">Percentage</p>
                </div>
              </div>
              <p className="text-gray-600 mt-2">
                Attempt #{previousAttempts.length} submitted successfully!
              </p>
            </div>

            {/* Question Review */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-left">Review Your Answers:</h3>
              <div className="space-y-4 text-left">
                {quiz.questions.map((q, qIndex) => {
                  const isCorrect = selectedAnswers[qIndex] === q.correctAnswer;
                  return (
                    <div 
                      key={qIndex} 
                      className={`p-4 border rounded-lg ${
                        isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        {isCorrect ? (
                          <FaCheckCircle className="text-green-500 mr-2" />
                        ) : (
                          <FaTimesCircle className="text-red-500 mr-2" />
                        )}
                        <p className="font-bold text-gray-800">Q{qIndex + 1}: {q.questionText}</p>
                      </div>
                      <ul className="space-y-1 ml-6">
                        {q.options.map((option, oIndex) => (
                          <li key={oIndex} className={`flex items-center text-sm ${
                            oIndex === q.correctAnswer 
                              ? "text-green-600 font-semibold" 
                              : selectedAnswers[qIndex] === oIndex && !isCorrect 
                                ? "text-red-600 font-semibold" 
                                : "text-gray-600"
                          }`}>
                            <span className="mr-2">•</span>
                            <span>{String.fromCharCode(65 + oIndex)}. {option}</span>
                            {oIndex === q.correctAnswer && !isCorrect && (
                              <span className="ml-2 text-green-600 font-semibold text-xs">(Correct Answer)</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <button
                onClick={() => navigate("/student/test")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-lg transition-colors"
              >
                Back to Tests
              </button>
            </div>
          </div>
        ) : (
          <form className="space-y-6">
            {quiz.questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center mb-3">
                  <div className="bg-indigo-100 text-indigo-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    {qIndex + 1}
                  </div>
                  <p className="font-semibold text-lg text-gray-800">
                    {q.questionText}
                  </p>
                </div>
                <div className="space-y-2 ml-11">
                  {q.options.map((option, oIndex) => (
                    <label
                      key={oIndex}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedAnswers[qIndex] === oIndex
                          ? 'bg-indigo-100 border border-indigo-300'
                          : 'bg-white border border-gray-200 hover:bg-indigo-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        checked={selectedAnswers[qIndex] === oIndex}
                        onChange={() => handleAnswerChange(qIndex, oIndex)}
                        className="form-radio h-4 w-4 text-indigo-600 transition-colors duration-150 focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-gray-700">
                        <span className="font-medium mr-2">{String.fromCharCode(65 + oIndex)}.</span>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Progress and Submit */}
            <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600">
                  Answered: {Object.keys(selectedAnswers).length} / {quiz.questions.length}
                </div>
                {Object.keys(selectedAnswers).length < quiz.questions.length && (
                  <div className="text-sm text-yellow-600">
                    Please answer all questions
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleSubmitQuiz}
                className={`w-full flex items-center justify-center px-8 py-4 text-white font-bold rounded-lg shadow-md transition-all duration-300 ${
                  Object.keys(selectedAnswers).length === quiz.questions.length
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transform hover:scale-105'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={loading || Object.keys(selectedAnswers).length < quiz.questions.length}
              >
                {loading ? (
                  <FaSpinner className="animate-spin mr-3" />
                ) : (
                  <FaCheckCircle className="mr-3" />
                )}
                {loading ? "Submitting..." : "Submit Quiz"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;