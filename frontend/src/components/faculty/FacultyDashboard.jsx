import React, { useState, useEffect } from "react";
import { auth, db } from "../../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  FaBook,
  FaUsers,
  FaStar,
  FaDollarSign,
  FaChartLine,
  FaPlus,
  FaVideo,
  FaClock,
  FaGraduationCap,
  FaSpinner,
  FaTrophy,
  FaFire,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [facultyData, setFacultyData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageRating: 0,
    totalRevenue: 0,
    totalVideos: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchDashboardData(user.uid);
      } else {
        navigate("/faculty/login");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchDashboardData = async (userId) => {
    try {
      setLoading(true);

      // Fetch faculty profile
      const facultyDoc = await getDoc(doc(db, "users", userId));
      if (facultyDoc.exists()) {
        setFacultyData({ id: facultyDoc.id, ...facultyDoc.data() });
      }

      // Fetch courses
      const coursesQuery = query(
        collection(db, "courses"),
        where("facultyId", "==", userId)
      );
      const querySnapshot = await getDocs(coursesQuery);
      const coursesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(coursesList);

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
          ? coursesList.reduce((sum, course) => sum + (course.rating || 0), 0) /
            coursesList.length
          : 0;

      setStats({
        totalCourses: coursesList.length,
        totalStudents,
        averageRating: avgRating.toFixed(1),
        totalRevenue: 0, // Can be calculated based on course prices
        totalVideos,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {facultyData?.fullName || "Faculty"}! 👋
            </h1>
            <p className="text-white/90 text-lg">
              Here's what's happening with your courses today
            </p>
          </div>
          <div className="hidden md:block">
            <FaTrophy className="text-8xl text-white/20" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Courses */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-emerald-600">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <FaBook className="text-2xl text-emerald-600" />
            </div>
            <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <FaArrowUp />
              12%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">
            Total Courses
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalCourses}
          </p>
          <p className="text-xs text-gray-500 mt-2">Active courses</p>
        </div>

        {/* Total Students */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-blue-600">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaUsers className="text-2xl text-blue-600" />
            </div>
            <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <FaArrowUp />
              8%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">
            Total Students
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalStudents}
          </p>
          <p className="text-xs text-gray-500 mt-2">Enrolled learners</p>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FaStar className="text-2xl text-yellow-500" />
            </div>
            <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <FaArrowUp />
              5%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">
            Average Rating
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.averageRating}{" "}
            <span className="text-lg text-gray-500">/ 5.0</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">Course ratings</p>
        </div>

        {/* Total Videos */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-purple-600">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaVideo className="text-2xl text-purple-600" />
            </div>
            <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <FaArrowUp />
              15%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">
            Total Videos
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalVideos}
          </p>
          <p className="text-xs text-gray-500 mt-2">Learning content</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaChartLine className="text-emerald-600" />
              Course Performance
            </h2>
            <select className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-4">
            {courses.slice(0, 5).map((course, index) => {
              const maxStudents = Math.max(
                ...courses.map((c) => c.enrolledStudents || 0),
                1
              );
              const percentage =
                ((course.enrolledStudents || 0) / maxStudents) * 100;

              return (
                <div key={course.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 truncate max-w-xs">
                      {course.title}
                    </span>
                    <span className="text-sm text-gray-600">
                      {course.enrolledStudents || 0} students
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-12">
              <FaChartLine className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No course data available</p>
              <button
                onClick={() => navigate("/faculty/add-course")}
                className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Create Your First Course
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaFire className="text-orange-500" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/faculty/add-course")}
              className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
            >
              <FaPlus className="text-xl" />
              <span className="font-semibold">Create New Course</span>
            </button>

            <button
              onClick={() => navigate("/faculty/my-courses")}
              className="w-full flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border-2 border-blue-200"
            >
              <FaBook className="text-xl" />
              <span className="font-semibold">View My Courses</span>
            </button>

            <button
              onClick={() => navigate("/faculty/profile")}
              className="w-full flex items-center gap-3 p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border-2 border-purple-200"
            >
              <FaGraduationCap className="text-xl" />
              <span className="font-semibold">Edit Profile</span>
            </button>
          </div>

          {/* Stats Summary */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-bold text-gray-700 mb-3">
              This Month's Summary
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">New Students</span>
                <span className="font-bold text-green-600">+24</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Course Views</span>
                <span className="font-bold text-blue-600">1,234</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Revenue</span>
                <span className="font-bold text-emerald-600">$0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FaBook className="text-emerald-600" />
            Recent Courses
          </h2>
          <button
            onClick={() => navigate("/faculty/my-courses")}
            className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
          >
            View All →
          </button>
        </div>

        {courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course) => (
              <div
                key={course.id}
                className="border-2 border-gray-200 rounded-xl p-4 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/faculty/course/${course.id}`)}
              >
                {course.thumbnailURL ? (
                  <img
                    src={course.thumbnailURL}
                    alt={course.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg mb-3 flex items-center justify-center">
                    <FaBook className="text-4xl text-emerald-400" />
                  </div>
                )}
                <h3 className="font-bold text-gray-900 mb-2 truncate">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <FaUsers className="text-blue-600" />
                    {course.enrolledStudents || 0}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <FaStar className="text-yellow-500" />
                    {course.rating || 0}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <FaVideo className="text-purple-600" />
                    {course.videos?.length || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaBook className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              You haven't created any courses yet
            </p>
            <button
              onClick={() => navigate("/faculty/add-course")}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
            >
              <FaPlus className="inline mr-2" />
              Create Your First Course
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
