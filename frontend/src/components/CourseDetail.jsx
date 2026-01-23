import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../config/firebase";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import {
  FaArrowLeft,
  FaBook,
  FaStar,
  FaUsers,
  FaClock,
  FaGraduationCap,
  FaGlobe,
  FaTag,
  FaVideo,
  FaPlayCircle,
  FaSpinner,
  FaYoutube,
  FaCheckCircle,
  FaLock,
  FaChalkboardTeacher
} from "react-icons/fa";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isFaculty, setIsFaculty] = useState(false); // New state for faculty check

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    // Check auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        checkUserRole(user.uid); // Check if user is faculty
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
        setIsFaculty(false);
      }
    });

    fetchCourse();
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (currentUser && course) {
      checkEnrollmentStatus();
    }
  }, [currentUser, course]);

  // Function to check if user is faculty
  const checkUserRole = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Assuming you have a 'role' field in users collection
        // Possible values: 'student', 'faculty', 'admin', etc.
        setIsFaculty(userData.role === "faculty" || userData.role === "admin");
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      setIsFaculty(false);
    }
  };

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const courseDoc = await getDoc(doc(db, "courses", id));

      if (courseDoc.exists()) {
        const courseData = { id: courseDoc.id, ...courseDoc.data() };
        setCourse(courseData);

        // Set first video as selected if available
        if (courseData.videos && courseData.videos.length > 0) {
          setSelectedVideo(courseData.videos[0]);
        }
      } else {
        setError("Course not found");
      }
    } catch (err) {
      console.error("Error fetching course:", err);
      setError("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const q = query(
        collection(db, "enrollments"),
        where("userId", "==", currentUser.uid),
        where("courseId", "==", course.id)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setIsEnrolled(true);
      } else {
        setIsEnrolled(false);
      }
    } catch (error) {
      console.error("Error checking enrollment status:", error);
      setIsEnrolled(false);
    }
  };

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (isEnrolled || isFaculty) {
      return;
    }

    setIsEnrolling(true);
    try {
      const idToken = await currentUser.getIdToken();

      const response = await axios.post(
        `${BACKEND_URL}/api/payment/initiate`,
        {
          courseId: course.id,
          userId: currentUser.uid,
          amount: course.price,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.data && response.data.url) {
        window.location.replace(response.data.url);
      } else {
        setError("Failed to initiate payment. No URL received.");
      }
    } catch (err) {
      console.error("Error initiating payment:", err);
      setError(
        err.response?.data?.message || "Failed to initiate payment. Please try again."
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;

    let videoId = null;

    if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("embed/")) {
      videoId = url.split("embed/")[1]?.split("?")[0];
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const getPlaylistEmbedUrl = (url) => {
    if (!url) return null;

    if (url.includes("list=")) {
      const playlistId = url.split("list=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
    }

    return url;
  };

  // Check if user has access to course content
  const hasAccess = () => {
    return isEnrolled || course.price === "Free" || isFaculty;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaBook className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Course not found"}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <FaArrowLeft />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 font-semibold"
          >
            <FaArrowLeft />
            Back
          </button>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                {isFaculty && (
                  <span className="px-3 py-1 bg-yellow-500 rounded-full text-sm font-semibold flex items-center gap-1">
                    <FaChalkboardTeacher />
                    Faculty Access
                  </span>
                )}
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                  {course.level}
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-white/90 text-lg mb-6">{course.description}</p>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <FaUsers />
                  <span>{course.enrolledStudents || 0} Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock />
                  <span>{course.duration || "N/A"}</span>
                </div>
              </div>
            </div>

            <div>
              {course.thumbnailURL ? (
                <img
                  src={course.thumbnailURL}
                  alt={course.title}
                  className="w-full h-64 object-cover rounded-xl shadow-2xl"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-64 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaBook className="text-6xl text-white/50" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaPlayCircle />
                  {selectedVideo ? selectedVideo.title : "Course Content"}
                  {isFaculty && (
                    <span className="text-sm bg-yellow-500 px-2 py-1 rounded ml-2">
                      Faculty Preview
                    </span>
                  )}
                </h2>
              </div>

              <div
                className="relative bg-black"
                style={{ paddingBottom: "56.25%" }}
              >
                {hasAccess() ? (
                  selectedVideo ? (
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={getYouTubeEmbedUrl(selectedVideo.url)}
                      title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : course.youtubePlaylist ? (
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={getPlaylistEmbedUrl(course.youtubePlaylist)}
                      title="Course Playlist"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <div className="text-center text-white">
                        <FaYoutube className="text-6xl mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No video content available</p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/80">
                    <div className="text-center text-white p-4">
                      <FaLock className="text-6xl mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">Enroll to watch this course</h3>
                      <p className="text-lg">Access all videos by enrolling in this course.</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedVideo && hasAccess() && (
                <div className="p-6 border-t">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedVideo.title}
                    {isFaculty && (
                      <span className="text-sm text-yellow-600 ml-2">
                        (Faculty Preview)
                      </span>
                    )}
                  </h3>
                  {selectedVideo.duration && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <FaClock />
                      Duration: {selectedVideo.duration}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Course Videos List */}
            {course.videos && course.videos.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaVideo className="text-emerald-600" />
                  Course Videos ({course.videos.length})
                  {isFaculty && (
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">
                      Full Faculty Access
                    </span>
                  )}
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {course.videos.map((video, index) => (
                    <button
                      key={video.id || index}
                      onClick={() => hasAccess() ? setSelectedVideo(video) : null}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        selectedVideo?.id === video.id
                          ? "bg-emerald-100 border-2 border-emerald-600"
                          : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                      } ${!hasAccess() && "cursor-not-allowed opacity-60"}`}
                      disabled={!hasAccess()}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            selectedVideo?.id === video.id
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-300 text-gray-700"
                          }`}
                        >
                          {selectedVideo?.id === video.id ? (
                            <FaPlayCircle />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {video.title}
                            {isFaculty && (
                              <span className="text-xs text-yellow-600 ml-2">
                                (Preview)
                              </span>
                            )}
                          </h4>
                          {video.duration && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <FaClock className="text-xs" />
                              {video.duration}
                            </p>
                          )}
                        </div>
                        {selectedVideo?.id === video.id && (
                          <FaCheckCircle className="text-emerald-600 text-xl" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube Playlist Info */}
            {course.youtubePlaylist && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaYoutube className="text-red-600" />
                  YouTube Playlist
                </h2>
                <a
                  href={course.youtubePlaylist}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2"
                >
                  View Full Playlist on YouTube
                  <FaArrowLeft className="rotate-180" />
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-emerald-600 mb-2">
                  {course.price || "Free"}
                </div>
                
                {/* Enrollment Button Logic */}
                {isFaculty ? (
                  <div className="w-full px-6 py-3 bg-yellow-100 text-yellow-800 rounded-lg font-semibold flex items-center justify-center gap-2">
                    <FaChalkboardTeacher />
                    Faculty Access Granted
                  </div>
                ) : isEnrolled ? (
                  <button
                    className="w-full px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold cursor-not-allowed"
                    disabled
                  >
                    Already Enrolled
                  </button>
                ) : !isLoggedIn ? (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Login to Enroll
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? <FaSpinner className="animate-spin inline-block mr-2" /> : "Enroll Now"}
                  </button>
                )}
              </div>

              <div className="space-y-4 border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-3">
                  Course Information
                </h3>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="flex items-center gap-2 text-gray-600">
                    <FaGraduationCap className="text-emerald-600" />
                    Level
                  </span>
                  <span className="font-semibold text-gray-900">
                    {course.level}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="flex items-center gap-2 text-gray-600">
                    <FaClock className="text-emerald-600" />
                    Duration
                  </span>
                  <span className="font-semibold text-gray-900">
                    {course.duration || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="flex items-center gap-2 text-gray-600">
                    <FaGlobe className="text-emerald-600" />
                    Language
                  </span>
                  <span className="font-semibold text-gray-900">
                    {course.language}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="flex items-center gap-2 text-gray-600">
                    <FaVideo className="text-emerald-600" />
                    Videos
                  </span>
                  <span className="font-semibold text-gray-900">
                    {course.videos?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="flex items-center gap-2 text-gray-600">
                    <FaUsers className="text-emerald-600" />
                    Enrolled
                  </span>
                  <span className="font-semibold text-gray-900">
                    {course.enrolledStudents || 0} students
                  </span>
                </div>
                
                {/* User Status Info */}
                {isLoggedIn && (
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="flex items-center gap-2 text-gray-600">
                      <FaChalkboardTeacher className="text-emerald-600" />
                      Your Status
                    </span>
                    <span className={`font-semibold ${
                      isFaculty ? "text-yellow-600" : 
                      isEnrolled ? "text-green-600" : "text-gray-900"
                    }`}>
                      {isFaculty ? "Faculty" : isEnrolled ? "Enrolled" : "Not Enrolled"}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaTag className="text-emerald-600" />
                  <span className="font-semibold">{course.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;