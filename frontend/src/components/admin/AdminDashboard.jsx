import React, { useState, useEffect } from "react";
import { auth, db } from "../../config/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  collectionGroup,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaBook,
  FaDollarSign,
  FaUserGraduate,
  FaSpinner,
  FaTrophy,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaStar,
  FaVideo,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeStudents: 0,
    activeFaculty: 0,
    totalEnrollments: 0,
    averageRating: 0,
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminData(user);
        fetchDashboardData();
      } else {
        navigate("/admin/login");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch Students
      const studentsQuery = query(
        collection(db, "users"),
        where("role", "==", "student")
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsList = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Students fetched:", studentsList.length, studentsList);

      // Fetch Faculty
      const facultyQuery = query(
        collection(db, "users"),
        where("role", "==", "faculty")
      );
      const facultySnapshot = await getDocs(facultyQuery);
      const facultyList = facultySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Faculty fetched:", facultyList.length, facultyList);

      // Fetch Courses
      const coursesSnapshot = await getDocs(collection(db, "courses"));
      const coursesList = coursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Courses fetched:", coursesList.length, coursesList);

      // Count enrollments from students' my_courses subcollections
      let totalEnrollmentsCount = 0;
      let totalRevenue = 0;

      try {
        // For each student, count their enrolled courses
        for (const student of studentsList) {
          try {
            const myCoursesSnapshot = await getDocs(
              collection(db, "users", student.id, "my_courses")
            );
            totalEnrollmentsCount += myCoursesSnapshot.docs.length;

            // Calculate revenue if each course has a price
            myCoursesSnapshot.docs.forEach((courseDoc) => {
              const courseData = courseDoc.data();
              // Find the course details to get the price
              const course = coursesList.find(
                (c) => c.id === courseData.courseId
              );
              if (course && course.price) {
                totalRevenue += course.price;
              }
            });
          } catch (studentError) {
            console.warn(
              `Could not fetch my_courses for student ${student.id}:`,
              studentError.message
            );
          }
        }
        console.log("Total Enrollments:", totalEnrollmentsCount);
        console.log("Total Revenue:", totalRevenue);
      } catch (error) {
        console.warn("Error counting enrollments:", error.message);
      }

      // Also try to fetch from enrollments collection as backup
      let enrollmentsList = [];
      try {
        const enrollmentsSnapshot = await getDocs(
          collection(db, "enrollments")
        );
        enrollmentsList = enrollmentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log(
          "Enrollments collection fetched:",
          enrollmentsList.length,
          enrollmentsList
        );

        // If enrollments collection exists, use its revenue data
        const enrollmentRevenue = enrollmentsList.reduce((sum, enrollment) => {
          return sum + (enrollment.amount || 0);
        }, 0);
        if (enrollmentRevenue > 0) {
          totalRevenue = enrollmentRevenue;
        }
      } catch (enrollmentError) {
        console.warn(
          "Could not fetch enrollments collection:",
          enrollmentError.message
        );
      }

      // Calculate stats
      const activeStudents = studentsList.filter(
        (s) => (s.status || "active").toLowerCase() === "active"
      ).length;

      const activeFaculty = facultyList.filter(
        (f) => (f.status || "active").toLowerCase() === "active"
      ).length;

      const avgRating =
        coursesList.length > 0
          ? (
              coursesList.reduce(
                (sum, course) => sum + (course.rating || 0),
                0
              ) / coursesList.length
            ).toFixed(1)
          : 0;

      // Category distribution
      const categories = {};
      coursesList.forEach((course) => {
        const cat = course.category || "Uncategorized";
        categories[cat] = (categories[cat] || 0) + 1;
      });

      const categoryArray = Object.entries(categories).map(([name, count]) => ({
        name,
        count,
      }));

      setStats({
        totalStudents: studentsList.length,
        totalFaculty: facultyList.length,
        totalCourses: coursesList.length,
        totalRevenue: totalRevenue,
        activeStudents,
        activeFaculty,
        totalEnrollments: totalEnrollmentsCount,
        averageRating: avgRating,
      });

      // Recent students (last 5)
      const recentStd = studentsList
        .sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime - aTime;
        })
        .slice(0, 5);

      setRecentStudents(recentStd);

      // Recent courses (last 5)
      const recentCrs = coursesList
        .sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime - aTime;
        })
        .slice(0, 5);

      setRecentCourses(recentCrs);
      setCategoryData(categoryArray);
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
          <FaSpinner className="animate-spin text-5xl text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <FaTrophy className="text-9xl" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {adminData?.displayName || "Admin"}! 👋
          </h1>
          <p className="text-white/90 text-lg mb-4">
            Here's what's happening in your education platform today
          </p>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-300" />
              <span>System Status: Online</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Students */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaUserGraduate className="text-2xl text-blue-600" />
            </div>
            <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <FaArrowUp />
              12%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">
            Total Students
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalStudents}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.activeStudents} active
          </p>
        </div>

        {/* Total Faculty */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaChalkboardTeacher className="text-2xl text-purple-600" />
            </div>
            <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <FaArrowUp />
              8%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">
            Total Faculty
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalFaculty}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.activeFaculty} active
          </p>
        </div>

        {/* Total Courses */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-600 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <FaBook className="text-2xl text-emerald-600" />
            </div>
            <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <FaArrowUp />
              15%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">
            Total Courses
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalCourses}
          </p>
          <p className="text-xs text-gray-500 mt-2">Active & Listed</p>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
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
            {stats.averageRating}
          </p>
          <p className="text-xs text-gray-500 mt-2">Out of 5.0</p>
        </div>
      </div>

      {/* Revenue & Enrollments Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FaDollarSign className="text-2xl text-green-600" />
            </div>
            <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <FaArrowUp />
              25%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">
            Total Revenue
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            ৳{stats.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">From enrollments</p>
        </div>

        {/* Total Enrollments */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-600 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <FaChartLine className="text-2xl text-orange-600" />
            </div>
            <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <FaArrowUp />
              18%
            </span>
          </div>
          <h3 className="text-gray-600 text-sm font-semibold mb-1">
            Total Enrollments
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalEnrollments}
          </p>
          <p className="text-xs text-gray-500 mt-2">Active students</p>
        </div>
      </div>

      {/* Charts and Tables Row */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Category Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaChartLine className="text-indigo-600" />
              Course Distribution by Category
            </h2>
          </div>

          {categoryData.length > 0 ? (
            <div className="space-y-4">
              {categoryData.map((category, index) => {
                const maxCount = Math.max(...categoryData.map((c) => c.count));
                const percentage = (category.count / maxCount) * 100;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        {category.name}
                      </span>
                      <span className="text-sm text-gray-600">
                        {category.count} courses
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-xs text-white font-semibold">
                          {Math.round(
                            (category.count / stats.totalCourses) * 100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaChartLine className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No category data available</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Quick Stats
          </h2>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-semibold mb-1">
                    Total Enrollments
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats.totalEnrollments}
                  </p>
                </div>
                <FaUsers className="text-3xl text-blue-600 opacity-30" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 font-semibold mb-1">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {stats.activeStudents + stats.activeFaculty}
                  </p>
                </div>
                <FaCheckCircle className="text-3xl text-purple-600 opacity-30" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border-2 border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-600 font-semibold mb-1">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-emerald-900">$0</p>
                </div>
                <FaDollarSign className="text-3xl text-emerald-600 opacity-30" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 font-semibold mb-1">
                    Completion Rate
                  </p>
                  <p className="text-2xl font-bold text-orange-900">78%</p>
                </div>
                <FaTrophy className="text-3xl text-orange-600 opacity-30" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Students */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaUserGraduate className="text-blue-600" />
              Recent Students
            </h2>
            <button
              onClick={() => navigate("/admin/manage-students")}
              className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
            >
              View All →
            </button>
          </div>

          {recentStudents.length > 0 ? (
            <div className="space-y-3">
              {recentStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {student.photoURL ? (
                    <img
                      src={student.photoURL}
                      alt={student.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {student.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {student.fullName}
                    </p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      (student.status || "active").toLowerCase() === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {student.status || "Active"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaUserGraduate className="text-4xl text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No recent students</p>
            </div>
          )}
        </div>

        {/* Recent Courses */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaBook className="text-emerald-600" />
              Recent Courses
            </h2>
            <button
              onClick={() => navigate("/admin/manage-courses")}
              className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
            >
              View All →
            </button>
          </div>

          {recentCourses.length > 0 ? (
            <div className="space-y-3">
              {recentCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
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
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                      <FaBook className="text-emerald-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {course.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaUsers />
                        {course.enrolledStudents || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaStar className="text-yellow-500" />
                        {course.rating || 0}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                    {course.category}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaBook className="text-4xl text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No recent courses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
