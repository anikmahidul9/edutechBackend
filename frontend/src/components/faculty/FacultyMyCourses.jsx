import React, { useState, useEffect } from "react";
import { auth, db } from "../../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  FaBook,
  FaEdit,
  FaTrash,
  FaEye,
  FaUsers,
  FaStar,
  FaClock,
  FaVideo,
  FaPlus,
  FaSpinner,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const FacultyMyCourses = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchCourses(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchCourses = async (facultyId) => {
    try {
      setLoading(true);
      const coursesQuery = query(
        collection(db, "courses"),
        where("facultyId", "==", facultyId)
      );
      const querySnapshot = await getDocs(coursesQuery);
      const coursesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(coursesList);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      setDeleting(true);
      await deleteDoc(doc(db, "courses", courseToDelete.id));
      setCourses(courses.filter((course) => course.id !== courseToDelete.id));
      setDeleteConfirmModal(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-3 rounded-lg">
              <FaBook className="text-white text-2xl" />
            </div>
            My Courses
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and track your published courses
          </p>
        </div>
        <button
          onClick={() => navigate("/faculty/add-course")}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
        >
          <FaPlus />
          Add New Course
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Courses</p>
              <p className="text-3xl font-bold">{courses.length}</p>
            </div>
            <FaBook className="text-5xl text-blue-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Total Students</p>
              <p className="text-3xl font-bold">
                {courses.reduce(
                  (sum, course) => sum + (course.enrolledStudents || 0),
                  0
                )}
              </p>
            </div>
            <FaUsers className="text-5xl text-green-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Avg Rating</p>
              <p className="text-3xl font-bold">
                {courses.length > 0
                  ? (
                      courses.reduce(
                        (sum, course) => sum + (course.rating || 0),
                        0
                      ) / courses.length
                    ).toFixed(1)
                  : "0.0"}
              </p>
            </div>
            <FaStar className="text-5xl text-yellow-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Total Videos</p>
              <p className="text-3xl font-bold">
                {courses.reduce(
                  (sum, course) =>
                    sum + (course.videos ? course.videos.length : 0),
                  0
                )}
              </p>
            </div>
            <FaVideo className="text-5xl text-purple-200 opacity-50" />
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FaBook className="text-gray-300 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Courses Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Start creating courses to share your knowledge with students
          </p>
          <button
            onClick={() => navigate("/faculty/add-course")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
          >
            <FaPlus />
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Course Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-emerald-400 to-teal-500 overflow-hidden">
                {course.thumbnailURL ? (
                  <img
                    src={course.thumbnailURL}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaBook className="text-white text-6xl opacity-50" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold text-emerald-600">
                  {course.level || "Beginner"}
                </div>
              </div>

              {/* Course Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                {/* Course Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FaUsers />
                    <span>{course.enrolledStudents || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-500" />
                    <span>{course.rating || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaVideo />
                    <span>
                      {course.videos ? course.videos.length : 0} videos
                    </span>
                  </div>
                </div>

                {/* Course Meta */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <span className="text-sm text-gray-600">
                    {course.category}
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {course.price || "Free"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      navigate(`/faculty/course/${course.id}/edit`)
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <FaEdit />
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/faculty/course/${course.id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    <FaEye />
                    View
                  </button>
                  <button
                    onClick={() => {
                      setCourseToDelete(course);
                      setDeleteConfirmModal(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && courseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-red-600 text-white px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaTrash />
                Delete Course
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete{" "}
                <strong>{courseToDelete.title}</strong>?
              </p>
              <p className="text-sm text-red-600 mb-6">
                This action cannot be undone. All course data will be
                permanently removed.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteConfirmModal(false);
                    setCourseToDelete(null);
                  }}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCourse}
                  disabled={deleting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      Delete
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

export default FacultyMyCourses;
