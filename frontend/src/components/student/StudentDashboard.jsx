import React, { useState, useEffect } from "react";
import {
  FaBook,
  FaTasks,
  FaCheckCircle,
  FaChartBar,
  FaArrowRight,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { auth, db } from "../../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch student's enrolled courses from their 'my_courses' subcollection
        const enrolledCoursesQuery = query(
          collection(db, "users", user.uid, "my_courses")
        );
        const enrolledCoursesSnapshot = await getDocs(enrolledCoursesQuery);
        const enrolledCourseIds = enrolledCoursesSnapshot.docs.map(
          (doc) => doc.id
        );

        if (enrolledCourseIds.length === 0) {
          setCourses([]);
          setLoading(false);
          return;
        }

        // Fetch details for each enrolled course
        const coursesData = [];
        for (const courseId of enrolledCourseIds) {
          try {
            const courseDoc = await getDoc(doc(db, "courses", courseId));
            if (courseDoc.exists()) {
              coursesData.push({
                id: courseDoc.id,
                ...courseDoc.data(),
                // Mocking progress for now - replace with real progress data
                progress: Math.floor(Math.random() * 100),
              });
            }
          } catch (error) {
            console.error(`Error fetching course ${courseId}:`, error);
          }
        }

        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const completedCourses = courses.filter((c) => c.progress === 100).length;
  const overallProgress =
    courses.length > 0
      ? Math.round(
          courses.reduce((acc, c) => acc + c.progress, 0) / courses.length
        )
      : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaBook className="animate-spin text-4xl text-indigo-600" />
        <p className="ml-4 text-lg text-gray-700">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
          My Dashboard
        </h1>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<FaBook className="text-blue-500" />}
            title="Courses Enrolled"
            value={courses.length}
            color="blue"
          />
          <StatCard
            icon={<FaCheckCircle className="text-green-500" />}
            title="Completed Courses"
            value={completedCourses}
            color="green"
          />
          <StatCard
            icon={<FaTasks className="text-yellow-500" />}
            title="Overall Progress"
            value={`${overallProgress}%`}
            color="yellow"
          />
        </div>

        {/* --- Course Progress Chart --- */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FaChartBar className="mr-3 text-indigo-600" />
            Course Progress
          </h2>
          {courses.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={courses}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="progress"
                  fill="#8884d8"
                  name="Progress (%)"
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>
                No course data to display. Enroll in a course to see your
                progress!
              </p>
            </div>
          )}
        </div>

        {/* --- My Courses List --- */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Courses</h2>
          {courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map((course) => (
                <CourseListItem key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                You are not enrolled in any courses yet.
              </p>
              <Link
                to="/student/courses"
                className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 inline-flex items-center gap-2"
              >
                Browse Courses <FaArrowRight />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Sub-components for cleaner structure ---

const StatCard = ({ icon, title, value, color }) => (
  <div
    className={`bg-white rounded-2xl shadow-md p-6 flex items-center gap-6 border-l-4 border-${color}-500`}
  >
    <div className={`text-4xl bg-${color}-100 p-4 rounded-full`}>{icon}</div>
    <div>
      <p className="text-gray-500 font-semibold">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const CourseListItem = ({ course }) => (
  <div className="bg-gray-50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-gray-100 transition-colors">
    <div className="flex items-center gap-4 w-full sm:w-auto">
      <img
        src={course.thumbnailURL || "/logo/eduLogo.png"}
        alt={course.title}
        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-grow">
        <h3 className="font-bold text-gray-800 text-lg">{course.title}</h3>
        <p className="text-sm text-gray-500">Category: {course.category}</p>
      </div>
    </div>

    <div className="w-full sm:w-1/3">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm font-medium text-indigo-600">
          {course.progress}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full"
          style={{ width: `${course.progress}%` }}
        ></div>
      </div>
    </div>

    <Link
      to={`/student/course/${course.id}`}
      className="bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors text-sm w-full sm:w-auto text-center"
    >
      Continue
    </Link>
  </div>
);

export default StudentDashboard;
