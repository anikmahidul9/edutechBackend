import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import {
  FaClock,
  FaCheck,
  FaTimes,
  FaBook,
  FaUser,
  FaVideo,
  FaSpinner,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaCalendar,
  FaGraduationCap,
} from "react-icons/fa";

const PendingApprovals = () => {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showApproveVideoModal, setShowApproveVideoModal] = useState(false);
  const [showRejectVideoModal, setShowRejectVideoModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [videoRejectReason, setVideoRejectReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [viewMode, setViewMode] = useState("courses"); // "courses" or "videos"

  useEffect(() => {
    fetchPendingCourses();
  }, [filterStatus]);

  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      const coursesSnapshot = await getDocs(collection(db, "courses"));

      const allCoursesList = await Promise.all(
        coursesSnapshot.docs.map(async (courseDoc) => {
          const courseData = { id: courseDoc.id, ...courseDoc.data() };

          // Fetch faculty name
          if (courseData.facultyId) {
            try {
              const facultyDoc = await getDoc(
                doc(db, "users", courseData.facultyId)
              );
              if (facultyDoc.exists()) {
                courseData.facultyName = facultyDoc.data().fullName;
                courseData.facultyEmail = facultyDoc.data().email;
              }
            } catch (error) {
              console.error("Error fetching faculty:", error);
            }
          }

          return courseData;
        })
      );

      // Filter based on status
      let coursesList = allCoursesList;
      if (filterStatus !== "all") {
        coursesList = allCoursesList.filter((course) => {
          if (filterStatus === "pending") {
            // Show courses with "pending" status, "active" status (old courses), or no status (very old courses)
            return (
              course.status === "pending" ||
              course.status === "active" ||
              !course.status
            );
          } else {
            // For approved/rejected, match exactly
            return course.status === filterStatus;
          }
        });
      }

      // Sort by creation date (newest first)
      coursesList.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });

      setAllCourses(allCoursesList);
      setPendingCourses(coursesList);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCourse = async () => {
    try {
      setActionLoading(true);
      const courseRef = doc(db, "courses", selectedCourse.id);
      await updateDoc(courseRef, {
        status: "approved",
        approvedAt: new Date(),
        rejectionReason: null,
      });

      // Refresh list
      await fetchPendingCourses();
      setShowApproveModal(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error("Error approving course:", error);
      alert("Failed to approve course. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCourse = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setActionLoading(true);
      const courseRef = doc(db, "courses", selectedCourse.id);
      await updateDoc(courseRef, {
        status: "rejected",
        rejectedAt: new Date(),
        rejectionReason: rejectReason,
      });

      // Refresh list
      await fetchPendingCourses();
      setShowRejectModal(false);
      setSelectedCourse(null);
      setRejectReason("");
    } catch (error) {
      console.error("Error rejecting course:", error);
      alert("Failed to reject course. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveVideo = async () => {
    try {
      setActionLoading(true);
      const courseRef = doc(db, "courses", selectedCourse.id);

      // Update the specific video's status in the videos array
      const updatedVideos = selectedCourse.videos.map((video) =>
        video.id === selectedVideo.id
          ? { ...video, status: "approved", approvedAt: new Date() }
          : video
      );

      await updateDoc(courseRef, {
        videos: updatedVideos,
      });

      // Refresh list
      await fetchPendingCourses();
      setShowApproveVideoModal(false);
      setSelectedVideo(null);
      setShowVideoModal(false);
    } catch (error) {
      console.error("Error approving video:", error);
      alert("Failed to approve video. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectVideo = async () => {
    if (!videoRejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setActionLoading(true);
      const courseRef = doc(db, "courses", selectedCourse.id);

      // Update the specific video's status in the videos array
      const updatedVideos = selectedCourse.videos.map((video) =>
        video.id === selectedVideo.id
          ? {
              ...video,
              status: "rejected",
              rejectedAt: new Date(),
              rejectionReason: videoRejectReason,
            }
          : video
      );

      await updateDoc(courseRef, {
        videos: updatedVideos,
      });

      // Refresh list
      await fetchPendingCourses();
      setShowRejectVideoModal(false);
      setSelectedVideo(null);
      setVideoRejectReason("");
      setShowVideoModal(false);
    } catch (error) {
      console.error("Error rejecting video:", error);
      alert("Failed to reject video. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
            <FaCheckCircle /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold flex items-center gap-1">
            <FaTimesCircle /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold flex items-center gap-1">
            <FaClock /> Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <FaClock className="text-indigo-600" />
          Approvals Management
        </h1>
        <p className="text-gray-600">
          Review and manage course and video approval requests from faculty
          members
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode("courses")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              viewMode === "courses"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FaBook /> Course Approvals
          </button>
          <button
            onClick={() => setViewMode("videos")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              viewMode === "videos"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FaVideo /> Video Approvals
          </button>
        </div>
      </div>

      {viewMode === "courses" ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-md p-6 border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <FaClock className="text-3xl text-yellow-600" />
                <span className="text-3xl font-bold text-yellow-900">
                  {
                    allCourses.filter(
                      (c) =>
                        c.status === "pending" ||
                        c.status === "active" ||
                        !c.status
                    ).length
                  }
                </span>
              </div>
              <p className="text-yellow-700 font-semibold">Pending Review</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <FaCheckCircle className="text-3xl text-green-600" />
                <span className="text-3xl font-bold text-green-900">
                  {allCourses.filter((c) => c.status === "approved").length}
                </span>
              </div>
              <p className="text-green-700 font-semibold">Approved</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md p-6 border-2 border-red-200">
              <div className="flex items-center justify-between mb-2">
                <FaTimesCircle className="text-3xl text-red-600" />
                <span className="text-3xl font-bold text-red-900">
                  {allCourses.filter((c) => c.status === "rejected").length}
                </span>
              </div>
              <p className="text-red-700 font-semibold">Rejected</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === "pending"
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus("approved")}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === "approved"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilterStatus("rejected")}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === "rejected"
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filterStatus === "all"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Courses List */}
          {pendingCourses.length > 0 ? (
            <div className="grid gap-6">
              {pendingCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 border-indigo-500"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Course Thumbnail */}
                    <div className="lg:w-48 lg:h-32 flex-shrink-0">
                      {course.thumbnailURL ? (
                        <img
                          src={course.thumbnailURL}
                          alt={course.title}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <FaBook className="text-4xl text-indigo-600" />
                        </div>
                      )}
                    </div>

                    {/* Course Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {course.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {course.description}
                          </p>
                        </div>
                        {getStatusBadge(course.status || "pending")}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaUser className="text-indigo-600" />
                          <span className="truncate">{course.facultyName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaGraduationCap className="text-purple-600" />
                          <span>{course.category}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaVideo className="text-pink-600" />
                          <span>{course.videos?.length || 0} Videos</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaStar className="text-yellow-500" />
                          <span>{course.rating || 0} Rating</span>
                        </div>
                      </div>

                      {course.status === "rejected" &&
                        course.rejectionReason && (
                          <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded">
                            <p className="text-red-700 text-sm font-semibold mb-1">
                              Rejection Reason:
                            </p>
                            <p className="text-red-600 text-sm">
                              {course.rejectionReason}
                            </p>
                          </div>
                        )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowViewModal(true);
                          }}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                          <FaEye /> View Details
                        </button>

                        {(course.status === "pending" ||
                          course.status === "active" ||
                          !course.status) && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedCourse(course);
                                setShowApproveModal(true);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-md"
                            >
                              <FaCheck /> Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCourse(course);
                                setShowRejectModal(true);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-md"
                            >
                              <FaTimes /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No Courses Found
              </h3>
              <p className="text-gray-500">
                {filterStatus === "pending"
                  ? "There are no courses waiting for approval"
                  : `No ${filterStatus} courses found`}
              </p>
            </div>
          )}
        </>
      ) : (
        <div>
          {/* Video Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-md p-6 border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <FaClock className="text-3xl text-yellow-600" />
                <span className="text-3xl font-bold text-yellow-900">
                  {allCourses.reduce(
                    (count, course) =>
                      count +
                      (course.videos?.filter(
                        (v) =>
                          v.status === "pending" ||
                          v.status === "active" ||
                          !v.status
                      ).length || 0),
                    0
                  )}
                </span>
              </div>
              <p className="text-yellow-700 font-semibold">Pending Videos</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <FaCheckCircle className="text-3xl text-green-600" />
                <span className="text-3xl font-bold text-green-900">
                  {allCourses.reduce(
                    (count, course) =>
                      count +
                      (course.videos?.filter((v) => v.status === "approved")
                        .length || 0),
                    0
                  )}
                </span>
              </div>
              <p className="text-green-700 font-semibold">Approved Videos</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md p-6 border-2 border-red-200">
              <div className="flex items-center justify-between mb-2">
                <FaTimesCircle className="text-3xl text-red-600" />
                <span className="text-3xl font-bold text-red-900">
                  {allCourses.reduce(
                    (count, course) =>
                      count +
                      (course.videos?.filter((v) => v.status === "rejected")
                        .length || 0),
                    0
                  )}
                </span>
              </div>
              <p className="text-red-700 font-semibold">Rejected Videos</p>
            </div>
          </div>

          {/* Video Approvals Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaVideo className="text-indigo-600" />
              Pending Video Approvals
            </h2>
            <p className="text-gray-600 mb-6">
              Review and approve videos from all courses
            </p>

            {allCourses.filter((course) =>
              course.videos?.some(
                (v) =>
                  v.status === "pending" || v.status === "active" || !v.status
              )
            ).length > 0 ? (
              <div className="space-y-6">
                {allCourses
                  .filter((course) =>
                    course.videos?.some(
                      (v) =>
                        v.status === "pending" ||
                        v.status === "active" ||
                        !v.status
                    )
                  )
                  .map((course) => (
                    <div
                      key={course.id}
                      className="border-2 border-gray-200 rounded-xl p-6"
                    >
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Faculty: {course.facultyName}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {course.videos
                          ?.filter(
                            (video) =>
                              video.status === "pending" ||
                              video.status === "active" ||
                              !video.status
                          )
                          .map((video) => (
                            <div
                              key={video.id}
                              className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="bg-indigo-100 p-3 rounded-lg">
                                  <FaVideo className="text-indigo-600 text-xl" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">
                                    {video.title}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Duration: {video.duration || "N/A"}
                                  </p>
                                  {video.status === "rejected" &&
                                    video.rejectionReason && (
                                      <p className="text-sm text-red-600 mt-1">
                                        Rejected: {video.rejectionReason}
                                      </p>
                                    )}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedCourse(course);
                                    setSelectedVideo(video);
                                    setShowVideoModal(true);
                                  }}
                                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
                                >
                                  <FaEye /> View
                                </button>
                                {(video.status === "pending" ||
                                  video.status === "active" ||
                                  !video.status) && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedCourse(course);
                                        setSelectedVideo(video);
                                        setShowApproveVideoModal(true);
                                      }}
                                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                                    >
                                      <FaCheck /> Approve
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedCourse(course);
                                        setSelectedVideo(video);
                                        setShowRejectVideoModal(true);
                                      }}
                                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                                    >
                                      <FaTimes /> Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <FaVideo className="text-5xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No pending videos for approval
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Course Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedCourse.thumbnailURL && (
                <img
                  src={selectedCourse.thumbnailURL}
                  alt={selectedCourse.title}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedCourse.title}
                  </h4>
                  {getStatusBadge(selectedCourse.status || "pending")}
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Faculty</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCourse.facultyName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCourse.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Level</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCourse.level}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-semibold text-gray-900">
                      ${selectedCourse.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCourse.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Language</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCourse.language}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-800">{selectedCourse.description}</p>
                </div>

                {selectedCourse.videos?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-semibold">
                      Videos ({selectedCourse.videos.length})
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedCourse.videos.map((video, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <FaVideo className="text-indigo-600" />
                          <span className="text-gray-800">{video.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCourse.status === "rejected" &&
                  selectedCourse.rejectionReason && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <p className="text-red-700 font-semibold mb-1">
                        Rejection Reason:
                      </p>
                      <p className="text-red-600">
                        {selectedCourse.rejectionReason}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-3xl" />
                <h3 className="text-2xl font-bold">Approve Course</h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to approve{" "}
                <span className="font-bold">{selectedCourse.title}</span>? This
                course will be visible to all students on the platform.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveCourse}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Approving...
                    </>
                  ) : (
                    <>
                      <FaCheck /> Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <FaTimesCircle className="text-3xl" />
                <h3 className="text-2xl font-bold">Reject Course</h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                You are rejecting{" "}
                <span className="font-bold">{selectedCourse.title}</span>.
                Please provide a reason:
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-red-500 resize-none"
                rows="4"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectCourse}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Rejecting...
                    </>
                  ) : (
                    <>
                      <FaTimes /> Reject
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video View Modal */}
      {showVideoModal && selectedVideo && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Video Details</h3>
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    setSelectedVideo(null);
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Video Title</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedVideo.title}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-gray-900">
                  {selectedVideo.duration || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Video URL</p>
                <a
                  href={selectedVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline break-all"
                >
                  {selectedVideo.url}
                </a>
              </div>

              <div>
                <p className="text-sm text-gray-600">Course</p>
                <p className="text-gray-900 font-semibold">
                  {selectedCourse.title}
                </p>
              </div>

              {selectedVideo.status === "rejected" &&
                selectedVideo.rejectionReason && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700 font-semibold mb-1">
                      Rejection Reason:
                    </p>
                    <p className="text-red-600">
                      {selectedVideo.rejectionReason}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Approve Video Modal */}
      {showApproveVideoModal && selectedVideo && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-3xl" />
                <h3 className="text-2xl font-bold">Approve Video</h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to approve the video{" "}
                <span className="font-bold">"{selectedVideo.title}"</span> from
                the course{" "}
                <span className="font-bold">"{selectedCourse.title}"</span>?
                This video will be visible to all students.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApproveVideoModal(false);
                    setSelectedVideo(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveVideo}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Approving...
                    </>
                  ) : (
                    <>
                      <FaCheck /> Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Video Modal */}
      {showRejectVideoModal && selectedVideo && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <FaTimesCircle className="text-3xl" />
                <h3 className="text-2xl font-bold">Reject Video</h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                You are rejecting the video{" "}
                <span className="font-bold">"{selectedVideo.title}"</span> from{" "}
                <span className="font-bold">"{selectedCourse.title}"</span>.
                Please provide a reason:
              </p>

              <textarea
                value={videoRejectReason}
                onChange={(e) => setVideoRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-red-500 resize-none"
                rows="4"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectVideoModal(false);
                    setVideoRejectReason("");
                    setSelectedVideo(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectVideo}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Rejecting...
                    </>
                  ) : (
                    <>
                      <FaTimes /> Reject
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;
