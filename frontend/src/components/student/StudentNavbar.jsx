import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  FaBars,
  FaTimes,
  FaBookOpen,
  FaSignOutAlt,
  FaUserCircle,
  FaBell,
  FaSearch,
  FaEnvelope,
  FaCog,
  FaGraduationCap,
  FaChartLine,
  FaCertificate,
  FaVial,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

const StudentNavbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/student/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navLinks = [
    {
      name: "Dashboard",
      path: "/student/dashboard",
      icon: <MdDashboard />,
    },
    {
      name: "My Profile",
      path: "/student/profile",
      icon: <FaUserCircle />,
    },
    {
      name: "My Courses",
      path: "/student/my-courses",
      icon: <FaBookOpen />,
    },
    {
      name: "Progress",
      path: "/student/progress",
      icon: <FaChartLine />,
    },
    {
      name: "Certificates",
      path: "/student/certificates",
      icon: <FaCertificate />,
    },
    {
      name: "Test",
      path: "/student/test",
      icon: <FaVial />,
    },
    {
      name: "Browse Courses",
      path: "/student/courses",
      icon: <FaSearch />,
    },
  ];

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-gradient-to-r from-blue-50 via-white to-sky-50 border-b-2 border-blue-200 fixed top-0 left-0 right-0 z-50 h-20 shadow-lg backdrop-blur-sm">
        <div className="h-full px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Left: Menu Button + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="text-blue-700 hover:text-blue-900 p-3 hover:bg-blue-100 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FaBars className="text-2xl" />
            </button>
            <Link
              to="/student/dashboard"
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <img
                  src="/logo/eduLogo.png"
                  alt="EduTech Logo"
                  className="h-12 w-12 object-contain relative"
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-gray-900 text-xl font-bold leading-tight bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
                  EduTech Student
                </span>
                <span className="text-blue-600 text-sm font-semibold tracking-wide">
                  Learning Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="Search for courses, instructors, topics..."
                className="w-full pl-12 pr-4 py-3 bg-white/80 border-2 border-blue-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition-all shadow-sm hover:shadow-md placeholder:text-gray-500"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 text-base group-hover:text-blue-600 transition-colors" />
            </div>
          </div>

          {/* Right: Actions + Profile */}
          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <Link to="/student/courses" className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <FaSearch className="text-lg" />
              <span className="hidden lg:inline">Browse</span>
            </Link>

            {/* Messages */}
            <button className="relative text-gray-600 hover:text-blue-600 p-3 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
              <FaEnvelope className="text-xl" />
            </button>

            {/* Notifications */}
            <button className="relative text-gray-600 hover:text-blue-600 p-3 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
              <FaBell className="text-xl" />
            </button>

            {/* Settings */}
            <button className="hidden lg:block text-gray-600 hover:text-blue-600 p-3 hover:bg-blue-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
              <FaCog className="text-xl hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:bg-blue-50 rounded-xl px-4 py-2.5 transition-all duration-200 border-2 border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md"
              >
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 via-blue-600 to-sky-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-blue-200">
                  <FaGraduationCap className="text-white text-xl" />
                </div>
                <span className="hidden md:block text-base font-bold text-gray-800">
                  Student
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    {userProfile ? (
                      <>
                        <p className="text-sm font-semibold text-gray-900">
                          {userProfile.fullName}
                        </p>
                        <p className="text-xs text-gray-500">{userProfile.email}</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">Loading...</p>
                    )}
                  </div>
                  <Link
                    to="/student/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                  >
                    <FaUserCircle className="text-blue-600" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/student/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 transition-colors"
                  >
                    <FaCog className="text-blue-600" />
                    <span>Settings</span>
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Left Sidebar - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-20 bottom-0 w-64 bg-gradient-to-b from-blue-800 via-blue-900 to-sky-950 shadow-xl z-40 overflow-y-auto">
        <div className="p-4 flex flex-col h-full">
          {/* Navigation */}
          <div className="space-y-1 flex-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-blue-800 hover:text-white"
                  }`
                }
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
            onClick={toggleSidebar}
          ></div>

          {/* Sidebar */}
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-blue-800 via-blue-900 to-sky-950 shadow-2xl z-50 lg:hidden overflow-y-auto">
            <div className="p-4 h-full flex flex-col">
              {/* Close Button + Logo */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-700">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo/eduLogo.png"
                    alt="EduTech Logo"
                    className="h-10 w-10 object-contain bg-white rounded-lg p-1"
                  />
                  <div>
                    <span className="text-white font-bold text-sm">
                      EduTech Student
                    </span>
                    <p className="text-blue-400 text-xs">Learning Portal</p>
                  </div>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="text-gray-400 hover:text-white p-2 hover:bg-blue-800 rounded transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Navigation */}
              <div className="space-y-1 flex-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={toggleSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg"
                          : "text-gray-300 hover:bg-blue-800 hover:text-white"
                      }`
                    }
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span>{link.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default StudentNavbar;
