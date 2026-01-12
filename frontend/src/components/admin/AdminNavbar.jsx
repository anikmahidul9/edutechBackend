import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import {
  FaBars,
  FaTimes,
  FaUserShield,
  FaUsers,
  FaChalkboardTeacher,
  FaBook,
  FaSignOutAlt,
  FaUserCircle,
  FaBell,
  FaSearch,
  FaEnvelope,
  FaCog,
  FaHeart,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

const AdminNavbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navLinks = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <MdDashboard />,
    },
    {
      name: "My Profile",
      path: "/admin/profile",
      icon: <FaUserCircle />,
    },
    {
      name: "Pending Approvals",
      path: "/admin/pending-approvals",
      icon: <FaBell />,
    },
    {
      name: "Manage Students",
      path: "/admin/manage-students",
      icon: <FaUsers />,
    },
    {
      name: "Manage Faculty",
      path: "/admin/manage-faculty",
      icon: <FaChalkboardTeacher />,
    },
    {
      name: "Manage Courses",
      path: "/admin/manage-courses",
      icon: <FaBook />,
    },
  ];

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-20 shadow-sm">
        <div className="h-full px-6 sm:px-8 lg:px-10 flex justify-between items-center">
          {/* Left: Menu Button + Logo */}
          <div className="flex items-center gap-5">
            <button
              onClick={toggleSidebar}
              className="text-gray-600 hover:text-indigo-600 p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaBars className="text-2xl" />
            </button>
            <Link to="/admin/dashboard" className="flex items-center gap-4">
              <img
                src="/logo/eduLogo.png"
                alt="EduTech Logo"
                className="h-12 w-12 object-contain"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-gray-900 text-lg font-bold leading-tight">
                  EduTech Admin
                </span>
                <span className="text-indigo-600 text-sm font-medium">
                  Management Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-10">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search students, faculty, courses..."
                className="w-full pl-12 pr-5 py-3 bg-gray-100 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
            </div>
          </div>

          {/* Right: Actions + Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-base font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <FaBook className="text-lg" />
              <span className="hidden lg:inline">Add Course</span>
            </button>

            {/* Messages */}
            <button className="relative text-gray-600 hover:text-indigo-600 p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
              <FaEnvelope className="text-xl" />
              <span className="absolute top-1 right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                5
              </span>
            </button>

            {/* Notifications */}
            <button className="relative text-gray-600 hover:text-indigo-600 p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
              <FaBell className="text-xl" />
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                3
              </span>
            </button>

            {/* Settings */}
            <button className="hidden lg:block text-gray-600 hover:text-indigo-600 p-2.5 hover:bg-gray-100 rounded-lg transition-colors">
              <FaCog className="text-xl" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative ml-3">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-4 py-2.5 transition-colors border border-gray-200"
              >
                <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FaUserCircle className="text-white text-xl" />
                </div>
                <span className="hidden md:block text-base font-semibold text-gray-700">
                  Admin
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      Admin User
                    </p>
                    <p className="text-xs text-gray-500">admin@edutech.com</p>
                  </div>
                  <Link
                    to="/admin/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-indigo-50 transition-colors"
                  >
                    <FaUserShield className="text-indigo-600" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/admin/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-indigo-50 transition-colors"
                  >
                    <FaCog className="text-indigo-600" />
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
      <aside className="hidden lg:block fixed left-0 top-20 bottom-0 w-64 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-xl z-40 overflow-y-auto">
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
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-slate-800 hover:text-white"
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
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-2xl z-50 lg:hidden overflow-y-auto">
            <div className="p-4 h-full flex flex-col">
              {/* Close Button + Logo */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo/eduLogo.png"
                    alt="EduTech Logo"
                    className="h-10 w-10 object-contain bg-white rounded-lg p-1"
                  />
                  <div>
                    <span className="text-white font-bold text-sm">
                      EduTech Admin
                    </span>
                    <p className="text-indigo-400 text-xs">Management Portal</p>
                  </div>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="text-gray-400 hover:text-white p-2 hover:bg-slate-800 rounded transition-colors"
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
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                          : "text-gray-300 hover:bg-slate-800 hover:text-white"
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

      {/* Bottom Bar */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
        <div className="flex items-center justify-center px-6 py-4 gap-4">
          <p className="text-gray-700 text-sm font-medium">
            © 2026{" "}
            <span className="font-semibold text-indigo-600">EduTech</span>. All
            rights reserved.
          </p>
          <span className="text-gray-300 font-light">|</span>
          <p className="text-gray-700 text-sm font-medium flex items-center gap-1.5">
            Development with <FaHeart className="text-red-500 animate-pulse" />{" "}
            by
            <span className="font-semibold text-purple-600">
              Kingshukhajong
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminNavbar;
