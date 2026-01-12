import React from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaQuoteLeft } from "react-icons/fa";

const Testimonial = () => {
  const navigate = useNavigate();

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Web Developer",
      image: "https://i.pravatar.cc/150?img=5",
      rating: 5,
      text: "EduTech completely transformed my career! The courses are well-structured, and the instructors are incredibly knowledgeable. I landed my dream job as a web developer within 3 months of completing the program.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Data Scientist",
      image: "https://i.pravatar.cc/150?img=12",
      rating: 5,
      text: "The Data Science course at EduTech exceeded all my expectations. The hands-on projects and real-world applications helped me build a strong portfolio. Highly recommend to anyone looking to break into tech!",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "UI/UX Designer",
      image: "https://i.pravatar.cc/150?img=9",
      rating: 5,
      text: "I've tried many online learning platforms, but EduTech stands out. The design courses are comprehensive, and the community support is amazing. I've grown so much as a designer thanks to this platform!",
      color: "from-green-500 to-teal-500",
    },
    {
      id: 4,
      name: "David Thompson",
      role: "Full Stack Developer",
      image: "https://i.pravatar.cc/150?img=13",
      rating: 5,
      text: "EduTech's curriculum is top-notch! The instructors break down complex concepts into easy-to-understand lessons. The practical assignments helped me gain confidence in my coding skills.",
      color: "from-orange-500 to-red-500",
    },
    {
      id: 5,
      name: "Priya Patel",
      role: "Marketing Specialist",
      image: "https://i.pravatar.cc/150?img=20",
      rating: 5,
      text: "The digital marketing course at EduTech was a game-changer for me. I learned strategies that I immediately applied to my business, and the results were incredible. Worth every penny!",
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: 6,
      name: "James Wilson",
      role: "Mobile App Developer",
      image: "https://i.pravatar.cc/150?img=14",
      rating: 5,
      text: "Best investment I've made in my professional development. The mobile development course was comprehensive, and the instructor support was exceptional. I built my first app within weeks!",
      color: "from-pink-500 to-rose-500",
    },
    {
      id: 7,
      name: "Lisa Anderson",
      role: "Project Manager",
      image: "https://i.pravatar.cc/150?img=10",
      rating: 5,
      text: "EduTech helped me transition from a technical role to project management. The courses are well-paced, and the certifications are recognized by employers. Couldn't be happier with my decision!",
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: 8,
      name: "Alex Kumar",
      role: "Cybersecurity Analyst",
      image: "https://i.pravatar.cc/150?img=15",
      rating: 5,
      text: "The cybersecurity program at EduTech is world-class. The instructors are industry experts, and the labs provide real-world experience. I feel confident and prepared for my new role!",
      color: "from-cyan-500 to-blue-500",
    },
    {
      id: 9,
      name: "Rachel Martinez",
      role: "Content Creator",
      image: "https://i.pravatar.cc/150?img=25",
      rating: 5,
      text: "EduTech's creative courses opened up a whole new world for me! The video editing and content creation modules were fantastic. I now run my own successful YouTube channel with over 100k subscribers!",
      color: "from-rose-500 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Banner Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src="/testimonialImage/tesitmonial.jpg"
          alt="Testimonials"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/85 to-pink-900/90 hidden items-center justify-center">
          <div className="text-center text-white px-4">
            <FaQuoteLeft className="text-6xl mx-auto mb-4 opacity-30" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 via-purple-900/70 to-pink-900/80 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-2xl">
              What Our Students Say
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 font-light">
              Real stories from learners who transformed their skills with
              EduTech
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden border border-gray-100"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Decorative Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <div
                  className={`w-full h-full bg-gradient-to-br ${testimonial.color} rounded-full blur-3xl`}
                ></div>
              </div>

              {/* Card Content */}
              <div className="relative p-8">
                {/* Profile Section at Top */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${testimonial.color} rounded-full blur-md opacity-40`}
                    ></div>
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="relative w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r ${testimonial.color} rounded-full border-3 border-white flex items-center justify-center shadow-lg`}
                    >
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg mb-1">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 font-medium">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-lg" />
                  ))}
                </div>

                {/* Quote Icon Background */}
                <div className="relative mb-4">
                  <FaQuoteLeft
                    className={`text-5xl bg-gradient-to-r ${testimonial.color} bg-clip-text text-transparent opacity-20 absolute -top-2 -left-2`}
                  />
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 text-base leading-relaxed relative z-10">
                  {testimonial.text}
                </p>
              </div>

              {/* Hover Glow Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${testimonial.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none rounded-3xl`}
              ></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have transformed their careers with
            EduTech
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl"
          >
            Explore Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
