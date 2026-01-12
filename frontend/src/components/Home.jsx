import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaPlay } from "react-icons/fa";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/homeImage/homeImage1.webp",
      title: "Quality Online Learning Starts Here",
      subtitle: "Trusted courses that make education enjoyable and effective.",
    },
    {
      image: "/homeImage/homeImage2.webp",
      title: "Online Courses That Make Learning Fun",
      subtitle:
        "Interactive video lessons designed to keep young learners engaged.",
    },
    {
      image: "/homeImage/homeImage3.png",
      title: "Learn Anytime, Anywhere",
      subtitle: "Purchase online courses and learn at your own pace.",
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full">
      {/* Hero Slider */}
      <div className="relative h-[450px] md:h-[600px] lg:h-[680px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
              <div className="max-w-3xl text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight animate-fade-in">
                  {slide.title}
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 md:mb-8 leading-relaxed animate-fade-in-delay">
                  {slide.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-2 justify-center">
                  <button
                    className="text-white font-semibold px-6 md:px-8 py-3 md:py-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#E5590D" }}
                  >
                    <FaPlay className="text-sm" />
                    <span>Start Learning</span>
                  </button>
                  <button
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 font-semibold px-6 md:px-8 py-3 md:py-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                    style={{ color: "#E5590D" }}
                  >
                    Browse Courses
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 backdrop-blur-md text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
          style={{ backgroundColor: "#E5590D" }}
          aria-label="Previous slide"
        >
          <FaChevronLeft className="text-lg sm:text-xl" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 backdrop-blur-md text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
          style={{ backgroundColor: "#E5590D" }}
          aria-label="Next slide"
        >
          <FaChevronRight className="text-lg sm:text-xl" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 sm:w-12"
                  : "bg-white/50 w-1.5 sm:w-2 hover:bg-white/80"
              }`}
              style={
                index === currentSlide ? { backgroundColor: "#E5590D" } : {}
              }
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
