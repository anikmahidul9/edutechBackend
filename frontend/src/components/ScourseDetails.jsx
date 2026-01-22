import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  FaExclamationTriangle,
  FaPlay,
  FaExpand,
  FaCheck,
  FaFilePdf
} from "react-icons/fa";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../config/firebase";

const ScourseDetails = () => {
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
  const [watchedVideos, setWatchedVideos] = useState(new Set());
  const [progress, setProgress] = useState(0);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const playerContainerRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
        setIsEnrolled(false);
        setEnrollmentLoading(false);
      }
    });

    fetchCourse();
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    console.log("useEffect [currentUser, course]", currentUser, course);
    if (currentUser && course) {
      checkEnrollmentStatus();
    } else if (course) {
      setEnrollmentLoading(false);
    }
  }, [currentUser, course]);

  const checkEnrollmentStatus = async () => {
    try {
      console.log("checkEnrollmentStatus: currentUser", currentUser);
      if (!currentUser || !course) return;
      
      setEnrollmentLoading(true);
      const q = query(
        collection(db, "enrollments"),
        where("userId", "==", currentUser.uid),
        where("courseId", "==", course.id),
        where("status", "in", ["paid", "free"])
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
    } finally {
      setEnrollmentLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && course && isEnrolled) {
      fetchProgress();
    }
  }, [currentUser, course, isEnrolled]);

  useEffect(() => {
    if (selectedVideo && currentUser && course && isEnrolled) {
      checkVideoCompletion();
    } else {
      setVideoCompleted(false);
    }
  }, [selectedVideo, currentUser, course, isEnrolled]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const courseDoc = await getDoc(doc(db, "courses", id));

      if (courseDoc.exists()) {
        const courseData = { id: courseDoc.id, ...courseDoc.data() };
        setCourse(courseData);

        // Process videos to ensure they have proper IDs and URLs
        if (courseData.videos && courseData.videos.length > 0) {
          const processedVideos = courseData.videos.map((video, index) => ({
            ...video,
            // Ensure ID is a string
            id: video.id ? String(video.id) : `video_${index}_${Date.now()}`,
            url: video.url || video.videoUrl || video.link || "",
          }));
          courseData.videos = processedVideos;
          setSelectedVideo(processedVideos[0]);
        } else if (courseData.youtubePlaylist) {
          setSelectedVideo({
            id: "playlist",
            title: "YouTube Playlist",
            url: courseData.youtubePlaylist,
            type: "playlist",
            thumbnail: courseData.thumbnailURL
          });
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


  const fetchProgress = async () => {
    if (!currentUser || !course || !isEnrolled) return;

    try {
      const enrollmentId = `${currentUser.uid}_${course.id}`;
      const enrollmentRef = doc(db, "enrollments", enrollmentId);
      const enrollmentSnap = await getDoc(enrollmentRef);
      
      if (enrollmentSnap.exists()) {
        const enrollmentData = enrollmentSnap.data();
        setProgress(enrollmentData.progress || 0);
        
        // Fetch watched videos from user's progress collection
        if (course.videos?.length > 0) {
          const watchedSet = new Set();
          try {
            // Get progress from users/{userId}/progress/{courseId}/videos
            const progressRef = collection(
              db,
              "users",
              currentUser.uid,
              "progress",
              course.id,
              "videos"
            );
            const progressSnapshot = await getDocs(progressRef);
            progressSnapshot.docs.forEach((doc) => {
              const data = doc.data();
              if (data.watched && data.videoId) {
                watchedSet.add(String(data.videoId));
              }
            });
            setWatchedVideos(watchedSet);
          } catch (error) {
            console.error("Error fetching progress:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching enrollment progress:", error);
    }
  };

  const checkVideoCompletion = async () => {
    if (!selectedVideo || !currentUser || !course || !isEnrolled || selectedVideo.id === "playlist") {
      setVideoCompleted(false);
      return;
    }

    try {
      // Check if video is in watchedVideos set
      const videoId = String(selectedVideo.id);
      const isWatched = watchedVideos.has(videoId);
      setVideoCompleted(isWatched);
      
      // Also check in Firestore for verification
      if (videoId) {
        const progressRef = doc(
          db,
          "users",
          currentUser.uid,
          "progress",
          course.id,
          "videos",
          videoId
        );
        console.log("checkVideoCompletion: currentUser.uid", currentUser.uid);
        console.log("checkVideoCompletion: course.id", course.id);
        console.log("checkVideoCompletion: videoId", videoId);
        console.log("checkVideoCompletion: progressRef.path", progressRef.path);
        
        const progressSnap = await getDoc(progressRef);
        if (progressSnap.exists()) {
          setVideoCompleted(true);
        }
      }
    } catch (error) {
      console.error("Error checking video completion:", error);
      setVideoCompleted(false);
    }
  };

  const markVideoAsComplete = async () => {
    if (!isEnrolled || !selectedVideo || selectedVideo.id === "playlist" || !currentUser || !course) {
      console.error("Cannot mark video as complete: Missing required data");
      return;
    }

    // Validate and convert video ID to string
    const videoId = selectedVideo.id ? String(selectedVideo.id) : null;
    if (!videoId) {
      console.error("Invalid video ID:", selectedVideo.id);
      return;
    }

    setMarkingComplete(true);
    try {
      console.log("Marking video as complete:", videoId);
      
      const newWatchedVideos = new Set(watchedVideos);
      newWatchedVideos.add(videoId);
      setWatchedVideos(newWatchedVideos);
      setVideoCompleted(true);

      // Save to user's progress collection
      const progressRef = doc(
        db,
        "users",
        currentUser.uid,
        "progress",
        course.id,
        "videos",
        videoId
      );
      
      await setDoc(progressRef, { 
        watched: true,
        timestamp: new Date().toISOString(),
        videoTitle: selectedVideo.title || "Untitled Video",
        videoId: videoId,
        courseId: course.id,
        courseTitle: course.title,
        markedComplete: true,
        userId: currentUser.uid
      });

      console.log("Progress saved to Firestore");

      // Calculate new progress
      const totalVideos = course.videos?.length || 0;
      const newProgress = totalVideos > 0 
        ? Math.round((newWatchedVideos.size / totalVideos) * 100)
        : 0;
      
      setProgress(newProgress);
      console.log("New progress calculated:", newProgress, "%");

      // Update enrollment document with progress
      const enrollmentId = `${currentUser.uid}_${course.id}`;
      const enrollmentRef = doc(db, "enrollments", enrollmentId);

      // Check if enrollment document exists, if not, create it
      const enrollmentSnap = await getDoc(enrollmentRef);
      if (!enrollmentSnap.exists()) {
        console.warn("Enrollment document not found, creating a new one with initial progress.");
        await setDoc(enrollmentRef, {
          userId: currentUser.uid,
          courseId: course.id,
          courseTitle: course.title,
          enrolledAt: new Date().toISOString(),
          status: isEnrolled ? "paid" : "free", // Assuming if not free, it's paid
          progress: newProgress,
          price: course.price || 0,
          paymentStatus: isEnrolled ? "completed" : "free",
          lastAccessed: new Date().toISOString(),
          lastVideoWatched: selectedVideo.title || "Untitled Video",
          lastVideoWatchedAt: new Date().toISOString(),
          watchedVideosCount: newWatchedVideos.size,
          totalVideos: totalVideos
        });
      } else {
        await updateDoc(enrollmentRef, { 
          progress: newProgress,
          lastAccessed: new Date().toISOString(),
          lastVideoWatched: selectedVideo.title || "Untitled Video",
          lastVideoWatchedAt: new Date().toISOString(),
          watchedVideosCount: newWatchedVideos.size,
          totalVideos: totalVideos
        });
      }

      console.log("Enrollment updated in Firestore");

      // Show success message
      console.log(`Video "${selectedVideo.title}" marked as complete! Progress: ${newProgress}%`);

    } catch (error) {
      console.error("Error marking video as complete:", error);
      console.error("Error details:", {
        selectedVideoId: selectedVideo.id,
        selectedVideoTitle: selectedVideo.title,
        userId: currentUser?.uid,
        courseId: course?.id
      });
      
      // Revert on error
      const revertedWatchedVideos = new Set(watchedVideos);
      revertedWatchedVideos.delete(videoId);
      setWatchedVideos(revertedWatchedVideos);
      setVideoCompleted(false);
      
      setError("Failed to mark video as complete. Please try again.");
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      navigate("/student/login");
      return;
    }
    
    if (isEnrolled) return;

    if (course.price === "Free" || course.price === 0 || course.price === "0") {
      await enrollForFree();
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
          courseTitle: course.title,
          userEmail: currentUser.email,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        setError("Failed to initiate payment. No URL received.");
      }
    } catch (err) {
      console.error("Error initiating payment:", err);
      setError(
        err.response?.data?.message ||
          "Failed to initiate payment. Please try again."
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  const enrollForFree = async () => {
    setIsEnrolling(true);
    try {
      const enrollmentId = `${currentUser.uid}_${course.id}`;
      
      // Create enrollment document
      const enrollmentData = {
        userId: currentUser.uid,
        courseId: course.id,
        courseTitle: course.title,
        enrolledAt: new Date().toISOString(),
        status: "free",
        progress: 0,
        price: 0,
        paymentStatus: "free",
        lastAccessed: new Date().toISOString()
      };

      const enrollmentRef = doc(db, "enrollments", enrollmentId);
      await setDoc(enrollmentRef, enrollmentData);

      // Also add to user's enrolledCourses collection
      const userEnrollmentRef = doc(
        db,
        "users",
        currentUser.uid,
        "enrolledCourses",
        course.id
      );
      await setDoc(userEnrollmentRef, {
        courseId: course.id,
        enrolledAt: new Date().toISOString(),
        status: "free",
        progress: 0
      });

      // Increment enrolledStudents count in the courses collection
      const courseRef = doc(db, "courses", course.id);
      await updateDoc(courseRef, {
        enrolledStudents: increment(1)
      });

      setIsEnrolled(true);
      setProgress(0);
      setWatchedVideos(new Set());

    } catch (error) {
      console.error("Error enrolling for free:", error);
      setError("Failed to enroll. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const canAccessVideo = (videoIndex) => {
    if (isEnrolled) return true;
    if (course.price === "Free" || course.price === 0 || course.price === "0") return true;
    if (videoIndex === 0) return true;
    return false;
  };

  const getVideoAccessText = (videoIndex) => {
    if (isEnrolled) return "";
    if (course.price === "Free" || course.price === 0 || course.price === "0") return "";
    if (videoIndex === 0) return "Preview";
    return "Enroll to unlock";
  };

  const extractYouTubeVideoId = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^&\n?#]+)/,
      /youtube\.com\/.*?[?&]v=([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1].split('?')[0];
      }
    }
    
    return null;
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Check if it's a playlist
    if (url.includes('list=')) {
      const playlistId = url.split('list=')[1]?.split('&')[0];
      if (playlistId) {
        return `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
      }
    }
    
    return url;
  };

  const getVideoThumbnail = (video) => {
    if (video.thumbnail) return video.thumbnail;
    
    const videoId = extractYouTubeVideoId(video.url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    
    return course?.thumbnailURL || "https://via.placeholder.com/1280x720/4ade80/ffffff?text=No+Thumbnail";
  };

  const isYouTubeUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const handleVideoSelect = (video) => {
    if (!video || !video.id) {
      console.error("Invalid video selected");
      return;
    }
    
    const videoIndex = course.videos?.findIndex(v => String(v.id) === String(video.id)) || 0;
    if (canAccessVideo(videoIndex)) {
      setSelectedVideo(video);
      setPlayerReady(false);
      setPlayerError(false);
      // Reset video completion status when selecting a new video
      if (video.id !== selectedVideo?.id) {
        setVideoCompleted(false);
      }
    }
  };

  const handlePlayerError = () => {
    setPlayerError(true);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const renderVideoPlayer = () => {
    if (!selectedVideo || !selectedVideo.url) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <FaVideo className="text-6xl mx-auto mb-4 opacity-50" />
            <p className="text-lg">No video selected</p>
          </div>
        </div>
      );
    }

    if (playerError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="text-center text-white p-6">
            <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
            <p className="text-lg mb-2">Failed to load video</p>
            <p className="text-sm opacity-75 mb-4">The video may be private or unavailable</p>
            <a
              href={selectedVideo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaYoutube />
              Watch on YouTube
            </a>
          </div>
        </div>
      );
    }

    const embedUrl = getYouTubeEmbedUrl(selectedVideo.url);
    
    if (!embedUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
            <p className="text-lg">Invalid video URL</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full relative">
        {!playerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <FaSpinner className="animate-spin text-white text-4xl" />
          </div>
        )}
        
        <iframe
          src={embedUrl}
          className={`w-full h-full ${playerReady ? 'block' : 'hidden'}`}
          title={selectedVideo.title || "Video Player"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => {
            console.log("YouTube iframe loaded");
            setPlayerReady(true);
          }}
          onError={handlePlayerError}
        />
        
        <button
          onClick={toggleFullscreen}
          className="absolute bottom-4 right-4 bg-black/70 text-white p-2 rounded-lg hover:bg-black/90 transition-colors z-20"
          title="Toggle fullscreen"
        >
          <FaExpand />
        </button>
      </div>
    );
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 font-semibold"
          >
            <FaArrowLeft />
            Back
          </button>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                  {course.level}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-white/90 text-base sm:text-lg mb-6 line-clamp-3">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                {/* <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-300" />
                  <span className="font-semibold">
                    {course.rating || 0} Rating
                  </span>
                </div> */}
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
                <div className="relative w-full h-48 sm:h-64 rounded-xl shadow-2xl overflow-hidden">
                  <img
                    src={course.thumbnailURL}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/800x450/4ade80/ffffff?text=Course+Thumbnail";
                    }}
                  />
                  {selectedVideo && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <FaPlay className="text-white text-4xl" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-48 sm:h-64 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaBook className="text-4xl sm:text-6xl text-white/50" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player Section */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 sm:px-6 py-4">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <FaPlayCircle />
                  {selectedVideo ? selectedVideo.title : "Course Content"}
                </h2>
              </div>

              <div 
                ref={playerContainerRef}
                className={`relative bg-black ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[500px]'}`}
              >
                {renderVideoPlayer()}
              </div>

              {selectedVideo && selectedVideo.id !== "playlist" && (
                <div className="p-4 sm:p-6 border-t">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        {selectedVideo.title || "Video"}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {selectedVideo.duration && (
                          <span className="flex items-center gap-2">
                            <FaClock />
                            Duration: {selectedVideo.duration}
                          </span>
                        )}
                        {isYouTubeUrl(selectedVideo.url) && (
                          <span className="flex items-center gap-2 text-red-600">
                            <FaYoutube />
                            YouTube Video
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Mark as Complete Button */}
                    {isEnrolled && selectedVideo.id && (
                      <button
                        onClick={markVideoAsComplete}
                        disabled={videoCompleted || markingComplete || !selectedVideo.id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                          videoCompleted
                            ? 'bg-green-100 text-green-800 cursor-default'
                            : markingComplete
                            ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {markingComplete ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            Marking...
                          </>
                        ) : videoCompleted ? (
                          <>
                            <FaCheckCircle />
                            Completed
                          </>
                        ) : (
                          <>
                            <FaCheck />
                            Mark as Complete
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {selectedVideo.description && (
                    <p className="text-gray-700 mt-3">{selectedVideo.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Course Videos List */}
            {course.videos && course.videos.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaVideo className="text-emerald-600" />
                  Course Videos ({course.videos.length})
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {course.videos.map((video, index) => {
                    // Ensure ID is a string
                    const videoId = video.id ? String(video.id) : `video_${index}_${Date.now()}`;
                    
                    const isAccessible = canAccessVideo(index);
                    const isSelected = selectedVideo?.id ? String(selectedVideo.id) === videoId : false;
                    const isWatched = watchedVideos.has(videoId);
                    const accessText = getVideoAccessText(index);
                    const videoThumbnail = getVideoThumbnail(video);

                    return (
                      <button
                        key={videoId}
                        onClick={() => handleVideoSelect({...video, id: videoId})}
                        disabled={!isAccessible || !videoId}
                        className={`w-full text-left p-3 sm:p-4 rounded-lg transition-all ${
                          isSelected
                            ? "bg-emerald-50 border-2 border-emerald-600"
                            : isAccessible
                            ? "bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200"
                            : "bg-gray-100 border-2 border-transparent opacity-75 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="relative w-16 h-12 sm:w-20 sm:h-14 flex-shrink-0">
                            <img
                              src={videoThumbnail}
                              alt={video.title || "Video"}
                              className="w-full h-full object-cover rounded"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/160x90/4ade80/ffffff?text=Video";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <FaPlay className="text-white text-xs" />
                            </div>
                            {isWatched && (
                              <div className="absolute top-1 right-1">
                                <FaCheckCircle className="text-green-500 text-xs bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                {video.title || `Video ${index + 1}`}
                              </h4>
                              {isWatched && (
                                <FaCheckCircle className="text-green-500 text-sm ml-2 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mt-1">
                              {video.duration && (
                                <span className="flex items-center gap-1">
                                  <FaClock className="text-xs" />
                                  {video.duration}
                                </span>
                              )}
                              {accessText && (
                                <span className={`text-xs font-medium flex items-center gap-1 ml-2 ${
                                  accessText === "Preview" ? "text-blue-600" : "text-emerald-600"
                                }`}>
                                  {accessText === "Preview" ? (
                                    <FaPlayCircle className="text-xs" />
                                  ) : (
                                    <FaLock className="text-xs" />
                                  )}
                                  {accessText}
                                </span>
                              )}
                            </div>
                          </div>
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 ${
                              isSelected
                                ? "bg-emerald-600 text-white"
                                : isAccessible
                                ? "bg-gray-300 text-gray-700"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {!isAccessible ? (
                              <FaLock className="text-xs sm:text-sm" />
                            ) : isSelected ? (
                              <FaPlayCircle />
                            ) : (
                              index + 1
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Course Description */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mt-6 sm:mt-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Course Description
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">
                  {course.description || "No description available."}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl sm:text-4xl font-bold text-emerald-600 mb-2">
                  {course.price === "Free" || course.price === 0 || course.price === "0" 
                    ? "Free" 
                    : `Tk${course.price}`}
                </div>
                
                {enrollmentLoading ? (
                  <div className="w-full py-3">
                    <FaSpinner className="animate-spin text-emerald-600 mx-auto" />
                  </div>
                ) : isEnrolled ? (
                  <div className="w-full">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Course Progress
                      </span>
                      <span className="text-sm font-medium text-emerald-600">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {watchedVideos.size} of {course.videos?.length || 0} videos completed
                    </p>
                  </div>
                ) : !isLoggedIn ? (
                  <button
                    onClick={() => navigate("/student/login")}
                    className="w-full px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    Login to Enroll
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className={`w-full px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl text-sm sm:text-base ${
                      isEnrolling
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                    }`}
                  >
                    {isEnrolling ? (
                      <>
                        <FaSpinner className="animate-spin inline-block mr-2" />
                        Processing...
                      </>
                    ) : course.price === "Free" || course.price === 0 || course.price === "0" ? (
                      "Enroll for Free"
                    ) : (
                      "Enroll Now"
                    )}
                  </button>
                )}
              </div>

              <div className="space-y-4 border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">
                  Course Information
                </h3>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                    <FaGraduationCap className="text-emerald-600" />
                    Level
                  </span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    {course.level}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                    <FaClock className="text-emerald-600" />
                    Duration
                  </span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    {course.duration || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                    <FaGlobe className="text-emerald-600" />
                    Language
                  </span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    {course.language || "English"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                    <FaVideo className="text-emerald-600" />
                    Videos
                  </span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    {course.videos?.length || "Playlist"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                    <FaUsers className="text-emerald-600" />
                    Enrolled
                  </span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    {course.enrolledStudents || 0} students
                  </span>
                </div>

                {isEnrolled && course.resourceUrl && (
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                      <FaFilePdf className="text-emerald-600" />
                      Resource
                    </span>
                    <a
                      href={course.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 hover:underline text-sm sm:text-base"
                    >
                      Download PDF
                    </a>
                  </div>
                )}

                {/* <div className="flex items-center justify-between py-3">
                  <span className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                    <FaStar className="text-emerald-600" />
                    Rating
                  </span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">
                    {course.rating || 0} / 5
                  </span>
                </div> */}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-600">
                  <FaTag className="text-emerald-600" />
                  <span className="font-semibold">{course.category}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm flex items-center gap-2">
                    <FaExclamationTriangle />
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScourseDetails;