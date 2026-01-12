import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FaPhone,
  FaShoppingCart,
  FaSearch,
  FaFacebook,
  FaYoutube,
  FaLinkedin,
  FaWhatsapp,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="w-full fixed top-0 left-0 right-0 z-50">
      {/* Top Bar */}
      <div className="bg-[#0E0A38] text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-auto md:max-w-xs">
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-1.5 px-4 pr-10 rounded-lg bg-[#0F0B38] border border-white/30 text-white text-sm font-bold placeholder:font-normal placeholder:text-gray-300 focus:outline-none focus:bg-[#0E0A38] focus:border-purple-400 focus:shadow-[0_0_15px_rgba(168,85,247,0.6)] transition-all duration-300"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-sm font-bold" />
          </div>

          {/* Contact Info & Social Media */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm font-semibold">
            {/* Email */}
            <div className="flex items-center gap-2">
              <MdEmail className="text-lg font-bold" />
              <span className="hidden sm:inline">eduTeach@gmail.com</span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2">
              <FaPhone className="text-sm font-bold" />
              <span className="hidden sm:inline">+1 234 567 8900</span>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3 border-l border-purple-400 pl-4">
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-300 transition-colors duration-200 font-bold"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="text-lg font-bold" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-300 transition-colors duration-200 font-bold"
                aria-label="Facebook"
              >
                <FaFacebook className="text-lg font-bold" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-300 transition-colors duration-200 font-bold"
                aria-label="YouTube"
              >
                <FaYoutube className="text-lg font-bold" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-200 transition-colors duration-200 font-bold"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="text-lg font-bold" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-2 sm:py-3 lg:py-1.5">
          <div className="flex justify-between items-center">
            {/* Logo & Brand Name */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo/eduLogo.png"
                alt="EduTech Logo"
                className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-20 lg:w-20 object-contain"
              />
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl font-bold text-[#0e0c6e]">
                eduTech
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-lg font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-[#FF630E]"
                      : "text-gray-700 hover:text-[#FF630E]"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/courses"
                className={({ isActive }) =>
                  `text-lg font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-[#FF630E]"
                      : "text-gray-700 hover:text-[#FF630E]"
                  }`
                }
              >
                Courses
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `text-lg font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-[#FF630E]"
                      : "text-gray-700 hover:text-[#FF630E]"
                  }`
                }
              >
                About Us
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `text-lg font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-[#FF630E]"
                      : "text-gray-700 hover:text-[#FF630E]"
                  }`
                }
              >
                Contact Us
              </NavLink>
              <NavLink
                to="/testimonial"
                className={({ isActive }) =>
                  `text-lg font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-[#FF630E]"
                      : "text-gray-700 hover:text-[#FF630E]"
                  }`
                }
              >
                Testimonial
              </NavLink>
            </div>

            {/* Cart & Login */}
            <div className="flex items-center gap-4">
              <button
                className="relative text-gray-700 hover:text-[#FF630E] transition-colors duration-200"
                aria-label="Shopping Cart"
              >
                <FaShoppingCart className="text-2xl" />
                <span className="absolute -top-2 -right-2 bg-[#FF630E] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </button>

              <Link
                to="/student/login"
                className="hidden sm:block bg-[#FF630E] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#E5590D] transition-colors duration-200 shadow-md"
              >
                Login
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMenu}
                className="lg:hidden text-gray-700 text-2xl"
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col gap-3 mt-4">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `text-base font-medium py-2 px-2 rounded transition-all duration-200 ${
                      isActive
                        ? "text-[#FF630E] bg-orange-50"
                        : "text-gray-700 hover:text-[#FF630E] hover:bg-gray-50"
                    }`
                  }
                  onClick={toggleMenu}
                >
                  Home
                </NavLink>
                <NavLink
                  to="/courses"
                  className={({ isActive }) =>
                    `text-base font-medium py-2 px-2 rounded transition-all duration-200 ${
                      isActive
                        ? "text-[#FF630E] bg-orange-50"
                        : "text-gray-700 hover:text-[#FF630E] hover:bg-gray-50"
                    }`
                  }
                  onClick={toggleMenu}
                >
                  Courses
                </NavLink>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `text-base font-medium py-2 px-2 rounded transition-all duration-200 ${
                      isActive
                        ? "text-[#FF630E] bg-orange-50"
                        : "text-gray-700 hover:text-[#FF630E] hover:bg-gray-50"
                    }`
                  }
                  onClick={toggleMenu}
                >
                  About Us
                </NavLink>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `font-medium py-2 px-2 rounded transition-all duration-200 ${
                      isActive
                        ? "text-[#FF630E] bg-orange-50"
                        : "text-gray-700 hover:text-[#FF630E] hover:bg-gray-50"
                    }`
                  }
                  onClick={toggleMenu}
                >
                  Contact Us
                </NavLink>
                <NavLink
                  to="/testimonial"
                  className={({ isActive }) =>
                    `text-base font-medium py-2 px-2 rounded transition-all duration-200 ${
                      isActive
                        ? "text-[#FF630E] bg-orange-50"
                        : "text-gray-700 hover:text-[#FF630E] hover:bg-gray-50"
                    }`
                  }
                  onClick={toggleMenu}
                >
                  Testimonial
                </NavLink>
                <Link
                  to="/student/login"
                  className="bg-[#FF630E] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#E5590D] transition-colors duration-200 text-center mt-2"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
