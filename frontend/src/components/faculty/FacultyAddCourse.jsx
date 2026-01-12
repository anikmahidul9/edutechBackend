import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import {
  FaBook,
  FaVideo,
  FaImage,
  FaYoutube,
  FaPlus,
  FaTrash,
  FaSave,
  FaSpinner,
  FaList,
  FaGraduationCap,
  FaClock,
  FaTag,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";

const FacultyAddCourse = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    level: "Beginner",
    duration: "",
    language: "English",
    price: "Free",
    thumbnailURL: "",
    youtubePlaylist: "",
    videos: [],
  });

  const [videoInput, setVideoInput] = useState({
    title: "",
    url: "",
    duration: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVideoInputChange = (e) => {
    setVideoInput({
      ...videoInput,
      [e.target.name]: e.target.value,
    });
  };

  const addVideoToList = () => {
    if (videoInput.title && videoInput.url) {
      setCourseData({
        ...courseData,
        videos: [
          ...courseData.videos,
          { ...videoInput, id: Date.now(), status: "pending" },
        ],
      });
      setVideoInput({ title: "", url: "", duration: "" });
    }
  };

  const removeVideo = (videoId) => {
    setCourseData({
      ...courseData,
      videos: courseData.videos.filter((video) => video.id !== videoId),
    });
  };

  const handleThumbnailChange = (e) => {
    const url = e.target.value;
    setCourseData({
      ...courseData,
      thumbnailURL: url,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError("Please log in to add a course");
      return;
    }

    if (!courseData.title || !courseData.description || !courseData.category) {
      setError("Please fill in all required fields");
      return;
    }

    if (!courseData.youtubePlaylist && courseData.videos.length === 0) {
      setError("Please add a YouTube playlist or individual videos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Add course to Firestore (no file upload needed)
      console.log("Adding course to Firestore...");
      await addDoc(collection(db, "courses"), {
        ...courseData,
        facultyId: userId,
        enrolledStudents: 0,
        rating: 0,
        reviews: [],
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccess(true);
      setError("");

      // Reset form
      setCourseData({
        title: "",
        description: "",
        category: "",
        level: "Beginner",
        duration: "",
        language: "English",
        price: "Free",
        thumbnailURL: "",
        youtubePlaylist: "",
        videos: [],
      });
      setThumbnailFile(null);
      setThumbnailPreview(null);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error adding course:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);

      // Show specific error message
      if (err.code === "permission-denied") {
        setError("Permission denied. Please check Firestore rules.");
      } else {
        setError(`Failed to add course: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 rounded-lg">
            <FaBook className="text-white text-2xl" />
          </div>
          Add New Course
        </h1>
        <p className="text-gray-600 mt-2">
          Create a new course with YouTube videos and manage your content
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg flex items-center gap-3">
          <FaCheckCircle className="text-2xl" />
          <div>
            <p className="font-semibold">Course submitted successfully!</p>
            <p className="text-sm">
              Your course is pending admin approval. It will be visible to
              students once approved.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center gap-3">
          <FaInfoCircle className="text-2xl" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Thumbnail */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaImage className="text-emerald-600" />
            Course Thumbnail (Image URL)
          </h2>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {courseData.thumbnailURL ? (
              <img
                src={courseData.thumbnailURL}
                alt="Thumbnail preview"
                className="w-full md:w-64 h-40 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full md:w-64 h-40 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                <FaImage className="text-emerald-400 text-5xl" />
              </div>
            )}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thumbnail Image URL (Optional)
              </label>
              <input
                type="url"
                name="thumbnailURL"
                value={courseData.thumbnailURL}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter a direct URL to your course thumbnail image
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaBook className="text-emerald-600" />
            Course Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                name="title"
                value={courseData.title}
                onChange={handleChange}
                placeholder="e.g., Complete Web Development Bootcamp"
                required
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Description *
              </label>
              <textarea
                name="description"
                value={courseData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe what students will learn in this course..."
                required
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaTag className="inline mr-1" />
                Category *
              </label>
              <input
                type="text"
                name="category"
                value={courseData.category}
                onChange={handleChange}
                placeholder="e.g., Web Development, Data Science"
                required
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaGraduationCap className="inline mr-1" />
                Level
              </label>
              <select
                name="level"
                value={courseData.level}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaClock className="inline mr-1" />
                Duration
              </label>
              <input
                type="text"
                name="duration"
                value={courseData.duration}
                onChange={handleChange}
                placeholder="e.g., 10 hours, 5 weeks"
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Language
              </label>
              <input
                type="text"
                name="language"
                value={courseData.language}
                onChange={handleChange}
                placeholder="e.g., English, Hindi"
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price
              </label>
              <input
                type="text"
                name="price"
                value={courseData.price}
                onChange={handleChange}
                placeholder="e.g., Free, $49, ₹999"
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* YouTube Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaYoutube className="text-red-600" />
            YouTube Content
          </h2>

          {/* YouTube Playlist */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              YouTube Playlist URL (Optional)
            </label>
            <input
              type="url"
              name="youtubePlaylist"
              value={courseData.youtubePlaylist}
              onChange={handleChange}
              placeholder="https://www.youtube.com/playlist?list=..."
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
            <p className="text-sm text-gray-500 mt-2">
              Paste your YouTube playlist URL here, or add individual videos
              below
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Individual Videos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Add Individual Videos
            </label>
            <div className="bg-emerald-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  name="title"
                  value={videoInput.title}
                  onChange={handleVideoInputChange}
                  placeholder="Video Title"
                  className="px-4 py-2 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <input
                  type="url"
                  name="url"
                  value={videoInput.url}
                  onChange={handleVideoInputChange}
                  placeholder="YouTube Video URL"
                  className="px-4 py-2 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                <input
                  type="text"
                  name="duration"
                  value={videoInput.duration}
                  onChange={handleVideoInputChange}
                  placeholder="Duration (e.g., 15:30)"
                  className="px-4 py-2 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={addVideoToList}
                className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                <FaPlus />
                Add Video to List
              </button>
            </div>

            {/* Video List */}
            {courseData.videos.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FaList />
                  Course Videos ({courseData.videos.length})
                </p>
                {courseData.videos.map((video, index) => (
                  <div
                    key={video.id}
                    className="bg-white border-2 border-emerald-200 rounded-lg p-3 flex items-center justify-between hover:bg-emerald-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {video.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {video.url}
                        </p>
                      </div>
                      {video.duration && (
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          <FaClock className="inline mr-1" />
                          {video.duration}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVideo(video.id)}
                      className="ml-3 text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Adding Course...
              </>
            ) : (
              <>
                <FaSave />
                Add Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FacultyAddCourse;
