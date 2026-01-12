import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#0E0A38] text-white pt-12 pb-6 mt-16">
      <div className="container mx-auto px-6 flex flex-col md:flex-row md:justify-between gap-10">
        {/* Logo & Description */}
        <div className="flex-1 mb-8 md:mb-0">
          <div className="flex items-center mb-4">
            <img
              src="/logo/eduLogo.png"
              alt="EduTech Logo"
              className="w-12 h-12 rounded-lg mr-3 bg-white p-1"
            />
            <span className="text-2xl font-bold tracking-wide">EduTech</span>
          </div>
          <p className="text-indigo-100 max-w-xs">
            Empowering learners and educators with modern, accessible, and
            innovative online education solutions.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex-1 mb-8 md:mb-0">
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="/"
                className="hover:underline hover:text-pink-200 transition"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="hover:underline hover:text-pink-200 transition"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="/courses"
                className="hover:underline hover:text-pink-200 transition"
              >
                Courses
              </a>
            </li>
            <li>
              <a
                href="/instructors"
                className="hover:underline hover:text-pink-200 transition"
              >
                Instructors
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="hover:underline hover:text-pink-200 transition"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <p className="mb-2 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-pink-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 12a4 4 0 01-8 0 4 4 0 018 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>
            info@edutech.com
          </p>
          <p className="mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-pink-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5"
              />
            </svg>
            123 Learning Ave, City, Country
          </p>
          <div className="flex space-x-4 mt-6">
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-400 transition"
              title="WhatsApp"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.63A11.93 11.93 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.68-.5-5.26-1.44l-.38-.22-3.69.97.99-3.59-.25-.37A9.94 9.94 0 012 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.43-2.25-1.37-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.36-.26.29-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3 .15.19 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-300 transition"
              title="LinkedIn"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.28h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.89v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.59z" />
              </svg>
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition"
              title="GitHub"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.399 3-.404 1.02.005 2.04.137 3 .404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.625-5.475 5.92.43.37.823 1.096.823 2.21 0 1.595-.015 2.88-.015 3.27 0 .32.218.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://yourportfolio.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-300 transition"
              title="Portfolio"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 6h-4V4a4 4 0 0 0-8 0v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zM10 4a2 2 0 1 1 4 0v2h-4V4zm10 14H4V8h16v10z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-purple-400 mt-10 pt-6 text-center text-gray-300 text-sm">
        &copy; {new Date().getFullYear()} EduTech. All rights reserved.
        <br />
        <span className="inline-flex items-center gap-1 mt-2">
          developed with
          <svg
            className="w-4 h-4 text-red-500 inline-block"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
          by <span className="font-semibold">srArif</span>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
