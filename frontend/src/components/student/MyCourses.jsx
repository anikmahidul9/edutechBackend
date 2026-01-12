import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { FaBookOpen, FaSpinner, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const MyCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        // Get the student's enrolled course IDs from their 'my_courses' subcollection
        const myCoursesRef = collection(db, "users", user.uid, "my_courses");
        const myCoursesSnapshot = await getDocs(myCoursesRef);
        const courseIds = myCoursesSnapshot.docs.map((doc) => doc.id);

        if (courseIds.length === 0) {
          setEnrolledCourses([]);
          setLoading(false);
          return;
        }

        // Fetch the details of these courses from the main 'courses' collection
        const coursesRef = collection(db, "courses");
        const q = query(coursesRef, where("__name__", "in", courseIds));
        const coursesSnapshot = await getDocs(q);

        const coursesData = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEnrolledCourses(coursesData);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
        <p className="ml-4 text-lg text-gray-700">Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">
          My Enrolled Courses
        </h1>

        {enrolledCourses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <FaBookOpen className="text-indigo-400 text-6xl mx-auto mb-6" />
            <p className="text-xl text-gray-600 mb-6">
              You haven't enrolled in any courses yet.
            </p>
            <Link
              to="/student/courses"
              className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
            >
              Browse Available Courses <FaArrowRight className="ml-3" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrolledCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <img
                  src={course.thumbnailURL || "/logo/eduLogo.png"}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {course.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Category: {course.category || "General"}
                  </p>
                  <Link
                    to={`/student/course/${course.id}`}
                    className="inline-flex items-center px-5 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-300"
                  >
                    Go to Course <FaArrowRight className="ml-2 text-sm" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;