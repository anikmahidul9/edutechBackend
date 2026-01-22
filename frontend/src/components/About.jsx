import React from "react";
import Instructor from "./Instructor";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Section with Banner */}
      <div
        className="relative h-[500px] overflow-hidden"
        style={{ backgroundColor: "#150F20" }}
      >
        <img
          src="/aboutImage/about.jpg"
          alt="About EduTech"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <div className="max-w-4xl text-center space-y-6">
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              About EduTech
            </h1>
            <p className="text-2xl md:text-3xl font-light tracking-wide">
              Empowering learners through accessible and quality online
              education.
            </p>
            <div className="flex items-center justify-center space-x-3 mt-8">
              <div className="h-1 w-20 bg-white/50 rounded-full"></div>
              <div className="h-2 w-2 bg-white rounded-full"></div>
              <div className="h-1 w-20 bg-white/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Mission Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
          <div className="space-y-6 order-2 lg:order-1">
            <div className="inline-block">
              <span className="text-sm font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 px-4 py-2 rounded-full">
                Our Mission
              </span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 leading-tight">
              Transforming Lives Through{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Quality Education
              </span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              At EduTech, we believe that education is the key to unlocking
              potential. Our mission is to provide accessible, high-quality
              online learning experiences that empower individuals to achieve
              their goals and transform their lives.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We strive to break down barriers to education by offering
              flexible, engaging, and affordable courses that cater to diverse
              learning needs and schedules.
            </p>
            {/* <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">
                  Accessible Learning
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">
                  Expert Instructors
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">
                  Affordable Courses
                </span>
              </div>
            </div> */}
          </div>
          {/* <div className="order-1 lg:order-2">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <img
                src="/aboutImage/AboutLef.jpg"
                alt="Our Mission"
                className="relative w-full rounded-3xl shadow-2xl transform transition duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-6 max-w-xs">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">10K+</p>
                    <p className="text-sm text-gray-600">Active Students</p>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        {/* Our Vision Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <img
              src="/aboutImage/AboutLef2.webp"
              alt="Our Vision"
              className="relative w-full rounded-3xl shadow-2xl transform transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 max-w-xs">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                {/* <div>
                  <p className="text-3xl font-bold text-gray-900">1000+</p>
                  <p className="text-sm text-gray-600">Courses Available</p>
                </div> */}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="inline-block">
              <span className="text-sm font-semibold tracking-wider text-purple-600 uppercase bg-purple-50 px-4 py-2 rounded-full">
                Our Vision
              </span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 leading-tight">
              Building a Global{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Learning Community
              </span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We envision a world where everyone has access to quality
              education, regardless of their location, background, or
              circumstances. Through innovative technology and dedicated
              educators, we aim to create a global learning community.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our vision is to become the leading platform for online education,
              transforming lives and communities through the power of learning
              and continuous growth.
            </p>
            {/* <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  500+
                </div>
                <div className="text-sm text-gray-600">Expert Instructors</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl">
                <div className="text-3xl font-bold text-blue-600 mb-1">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Who We Are Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 lg:p-16 mb-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="text-center mb-12">
              <span className="text-sm font-semibold tracking-wider text-blue-400 uppercase bg-blue-500/10 px-4 py-2 rounded-full">
                Who We Are
              </span>
              <h2 className="text-5xl font-bold text-white mt-6 mb-6">
                Passionate Educators &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Tech Innovators
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                A dynamic team committed to revolutionizing online education
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Expert Team
                </h3>
                <p className="text-gray-400">
                  Industry professionals and academic experts with years of
                  teaching experience.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Innovation First
                </h3>
                <p className="text-gray-400">
                  Leveraging cutting-edge technology to create engaging learning
                  experiences.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/10 transition duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Student Focused
                </h3>
                <p className="text-gray-400">
                  Dedicated to helping every student succeed in their
                  educational journey.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold tracking-wider text-orange-600 uppercase bg-orange-50 px-4 py-2 rounded-full">
              Why Choose Us
            </span>
            <h2 className="text-5xl font-bold text-gray-900 mt-6 mb-6">
              What Makes Us{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                Different
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the EduTech advantage with our comprehensive learning
              platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Learn Anytime
              </h3>
              <p className="text-gray-600">
                Study at your own pace with 24/7 access to all course materials
                and resources.
              </p>
            </div>
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Expert Content
              </h3>
              <p className="text-gray-600">
                Learn from industry leaders with real-world experience and
                proven track records.
              </p>
            </div>
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-green-200">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Certification
              </h3>
              <p className="text-gray-600">
                Earn recognized certificates to showcase your skills and advance
                your career.
              </p>
            </div>
            <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Community
              </h3>
              <p className="text-gray-600">
                Join a vibrant community of learners and connect with peers
                worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* Meet Our Team Section */}
      <Instructor />
      </div>
    </div>
  );
};

export default About;
