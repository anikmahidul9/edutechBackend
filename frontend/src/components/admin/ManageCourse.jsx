import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import {
  FaBook,
  FaSearch,
  FaEye,
  FaTrash,
  FaSpinner,
  FaFilter,
  FaStar,
  FaUsers,
  FaVideo,
  FaChalkboardTeacher,
  FaTimes,
  FaExclamationTriangle,
  FaGraduationCap,
  FaClock,
  FaGlobe,
  FaTag,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ManageCourse = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageRating: 0,
    totalVideos: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, categoryFilter, levelFilter, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesQuery = query(
        collection(db, "courses"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(coursesQuery);
      const coursesList = await Promise.all(
        querySnapshot.docs.map(async (courseDoc) => {
          const courseData = { id: courseDoc.id, ...courseDoc.data() };

          // Fetch faculty name
          if (courseData.facultyId) {
            try {
              const facultyDoc = await getDoc(
                doc(db, "users", courseData.facultyId)
              );
              if (facultyDoc.exists()) {
                courseData.facultyName =
                  facultyDoc.data().fullName || "Unknown Faculty";
              }
            } catch (error) {
              courseData.facultyName = "Unknown Faculty";
            }
          }

          return courseData;
        })
      );

      setCourses(coursesList);
      setFilteredCourses(coursesList);

      // Calculate stats
      const totalStudents = coursesList.reduce(
        (sum, course) => sum + (course.enrolledStudents || 0),
        0
      );
      const totalVideos = coursesList.reduce(
        (sum, course) => sum + (course.videos?.length || 0),
        0
      );
      const avgRating =
        coursesList.length > 0
          ? (
              coursesList.reduce(
                (sum, course) => sum + (course.rating || 0),
                0
              ) / coursesList.length
            ).toFixed(1)
          : 0;

      setStats({
        totalCourses: coursesList.length,
        totalStudents,
        averageRating: avgRating,
        totalVideos,
      });
    } catch (error) {
      console.error("Error fetching courses:", error);
      alert("Failed to fetch courses data");
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (course) =>
          course.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Filter by level
    if (levelFilter !== "all") {
      filtered = filtered.filter(
        (course) => course.level?.toLowerCase() === levelFilter.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          course.facultyName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          course.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    try {
      setDeleting(true);
      await deleteDoc(doc(db, "courses", courseToDelete.id));
      setCourses(courses.filter((course) => course.id !== courseToDelete.id));
      setShowDeleteModal(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course");
    } finally {
      setDeleting(false);
    }
  };

  // Get unique categories
  const categories = [
    ...new Set(courses.map((course) => course.category).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-lg">
            <FaBook className="text-white text-2xl" />
          </div>
          Course Management
        </h1>
        <p className="text-gray-600">
          Manage all courses, view details, and monitor performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">
                Total Courses
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalCourses}
              </p>
            </div>
            <FaBook className="text-4xl text-indigo-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">
                Total Students
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalStudents}
              </p>
            </div>
            <FaUsers className="text-4xl text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">
                Average Rating
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.averageRating}
              </p>
            </div>
            <FaStar className="text-4xl text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">
                Total Videos
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalVideos}
              </p>
            </div>
            <FaVideo className="text-4xl text-purple-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses by title, description, faculty, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <FaFilter className="text-indigo-600" />
          <span>
            Showing {filteredCourses.length} of {courses.length} courses
          </span>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <FaBook className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No courses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Course
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Faculty
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Level
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Students
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Videos
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {course.thumbnailURL ? (
                          <img
                            src={course.thumbnailURL}
                            alt={course.title}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <FaBook className="text-indigo-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {course.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {course.price || "Free"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaChalkboardTeacher className="text-indigo-600" />
                        <span className="text-sm text-gray-700">
                          {course.facultyName || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                        {course.category || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          course.level?.toLowerCase() === "beginner"
                            ? "bg-green-100 text-green-700"
                            : course.level?.toLowerCase() === "intermediate"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {course.level || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaUsers className="text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          {course.enrolledStudents || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaStar className="text-yellow-500" />
                        <span className="text-sm font-semibold text-gray-900">
                          {course.rating || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaVideo className="text-purple-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          {course.videos?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(course)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(course)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Course"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Course Details Modal */}
      {showDetailsModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between sticky top-0">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaBook />
                Course Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Course Image */}
              {selectedCourse.thumbnailURL && (
                <img
                  src={selectedCourse.thumbnailURL}
                  alt={selectedCourse.title}
                  className="w-full h-48 object-cover rounded-xl mb-6"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}

              {/* Course Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">
                    {selectedCourse.title}
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FaChalkboardTeacher className="text-indigo-600" />
                      <div>
                        <p className="text-xs text-gray-500">Faculty</p>
                        <p className="font-semibold text-gray-900">
                          {selectedCourse.facultyName || "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaTag className="text-indigo-600" />
                      <div>
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="font-semibold text-gray-900">
                          {selectedCourse.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaGraduationCap className="text-indigo-600" />
                      <div>
                        <p className="text-xs text-gray-500">Level</p>
                        <p className="font-semibold text-gray-900">
                          {selectedCourse.level}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaClock className="text-indigo-600" />
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-semibold text-gray-900">
                          {selectedCourse.duration || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <FaUsers className="text-2xl text-blue-600" />
                      <div>
                        <p className="text-xs text-blue-600 font-semibold">
                          Enrolled Students
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {selectedCourse.enrolledStudents || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                    <div className="flex items-center gap-3 mb-2">
                      <FaStar className="text-2xl text-yellow-500" />
                      <div>
                        <p className="text-xs text-yellow-600 font-semibold">
                          Rating
                        </p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {selectedCourse.rating || 0} / 5
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <FaVideo className="text-2xl text-purple-600" />
                      <div>
                        <p className="text-xs text-purple-600 font-semibold">
                          Total Videos
                        </p>
                        <p className="text-2xl font-bold text-purple-900">
                          {selectedCourse.videos?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h5 className="font-bold text-gray-900 mb-2">Description</h5>
                <p className="text-gray-700 leading-relaxed">
                  {selectedCourse.description}
                </p>
              </div>

              {/* Additional Info */}
              <div className="grid md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Language</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <FaGlobe className="text-indigo-600" />
                    {selectedCourse.language || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Price</p>
                  <p className="font-semibold text-gray-900">
                    {selectedCourse.price || "Free"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedCourse.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedCourse.status || "Active"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Course ID</p>
                  <p className="font-mono text-xs text-gray-900">
                    {selectedCourse.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 sticky bottom-0">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => navigate(`/course/${selectedCourse.id}`)}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                View Full Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && courseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-red-600 text-white px-6 py-4 rounded-t-xl flex items-center gap-3">
              <FaExclamationTriangle className="text-2xl" />
              <h3 className="text-xl font-bold">Delete Course</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the course{" "}
                <strong>{courseToDelete.title}</strong>? This action cannot be
                undone.
              </p>
              <p className="text-sm text-gray-600 bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                <FaExclamationTriangle className="inline mr-2 text-yellow-600" />
                This will permanently remove all course data, videos, and
                student enrollments.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash />
                    Delete Course
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourse;
