import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaShieldAlt,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-gray-300 border-t border-slate-800 w-full">
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo/eduLogo.png"
                alt="EduTech Logo"
                className="h-10 w-10 object-contain bg-white rounded-lg p-1"
              />
              <div>
                <h3 className="text-lg font-bold text-white">EduTech Admin</h3>
                <p className="text-xs text-indigo-400">Management Portal</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Comprehensive administrative platform for managing educational
              operations, student enrollment, faculty coordination, and course
              administration.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="bg-slate-800 p-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200"
              >
                <FaFacebook className="text-gray-300" />
              </a>
              <a
                href="#"
                className="bg-slate-800 p-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200"
              >
                <FaTwitter className="text-gray-300" />
              </a>
              <a
                href="#"
                className="bg-slate-800 p-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200"
              >
                <FaLinkedin className="text-gray-300" />
              </a>
              <a
                href="#"
                className="bg-slate-800 p-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200"
              >
                <FaInstagram className="text-gray-300" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-4 flex items-center gap-2 text-white">
              <FaShieldAlt className="text-indigo-500" />
              Quick Access
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/admin/dashboard"
                  className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200"
                >
                  Dashboard Overview
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/manage-students"
                  className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200"
                >
                  Student Management
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/manage-faculty"
                  className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200"
                >
                  Faculty Management
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/manage-courses"
                  className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200"
                >
                  Course Management
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/reports"
                  className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200"
                >
                  Reports & Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="text-base font-semibold mb-4 text-white">Support</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FaEnvelope className="text-indigo-500" />
                <a
                  href="mailto:admin@edutech.com"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  admin@edutech.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaPhone className="text-indigo-500" />
                <a
                  href="tel:+1234567890"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  +1 (234) 567-8900
                </a>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/support"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Get Support
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} EduTech Admin Panel. All rights reserved. Version
            2.0
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link
              to="/privacy"
              className="hover:text-indigo-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-indigo-400 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/security"
              className="hover:text-indigo-400 transition-colors"
            >
              Security
            </Link>
            <Link
              to="/docs"
              className="hover:text-indigo-400 transition-colors"
            >
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
