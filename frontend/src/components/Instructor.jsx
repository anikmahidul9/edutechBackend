import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";

const Instructor = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  // Fetch instructors from database
  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      setLoading(true);

      // Fetch faculty data from Firebase Firestore users collection
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);

      // Filter only faculty members who are approved (isActive can be true or false)
      const facultyList = usersSnapshot.docs
        .filter(
          (doc) =>
            doc.data().role === "faculty" && doc.data().status === "approved"
        )
        .map((doc) => {
          const data = doc.data();
          // Handle expertise as string or array
          let expertiseArr = [];
          if (Array.isArray(data.expertise)) {
            expertiseArr = data.expertise;
          } else if (
            typeof data.expertise === "string" &&
            data.expertise.trim() !== ""
          ) {
            expertiseArr = [data.expertise];
          }
          return {
            id: doc.id,
            ...data,
            name:
              (data.fullName && data.fullName.trim()) ||
              (
                (data.firstName || "").trim() +
                " " +
                (data.lastName || "").trim()
              ).trim() ||
              "Unknown Name",
            title: data.highestQualification || "Instructor",
            specialty:
              data.specialization ||
              data.department ||
              data.expertise ||
              "General",
            image:
              data.photoURL ||
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
            rating: data.rating || 4.5,
            students: data.students || data.totalStudents || 0,
            courses: data.courses || data.totalCourses || 0,
            bio: data.bio || "Experienced educator",
            expertise: expertiseArr,
          };
        });

      setInstructors(facultyList);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching instructors:", error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Meet Our Expert Instructors
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
              Learn from industry professionals and experienced educators
              passionate about your success
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Instructors Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {instructors.map((instructor) => (
                <div
                  key={instructor.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer relative"
                  onClick={() => setSelectedInstructor(instructor)}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-64">
                    <img
                      src={instructor.image}
                      alt={instructor.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    {/* Specialty Badge */}
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {instructor.specialty}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors text-center">
                      {instructor.name}
                    </h3>
                    <p className="text-indigo-600 font-semibold mb-3 text-center">
                      {instructor.title}
                    </p>
                  </div>
                  {/* Social Media Bar (hidden by default, slides up on hover) */}
                  <div className="absolute left-0 right-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white bg-opacity-95 px-6 py-3 flex justify-center gap-4 border-t border-gray-200 z-10">
                    {instructor.whatsapp && (
                      <a
                        href={instructor.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="WhatsApp"
                      >
                        <svg
                          className="w-6 h-6 text-green-500 hover:text-green-700"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.22-1.63A11.93 11.93 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.68-.5-5.26-1.44l-.38-.22-3.69.97.99-3.59-.25-.37A9.94 9.94 0 012 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.43-2.25-1.37-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.36-.26.29-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3 .15.19 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z" />
                        </svg>
                      </a>
                    )}
                    {instructor.linkedin && (
                      <a
                        href={instructor.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="LinkedIn"
                      >
                        <svg
                          className="w-6 h-6 text-blue-700 hover:text-blue-900"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 11.28h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.89v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.59z" />
                        </svg>
                      </a>
                    )}
                    {instructor.github && (
                      <a
                        href={instructor.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="GitHub"
                      >
                        <svg
                          className="w-6 h-6 text-gray-800 hover:text-black"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.399 3-.404 1.02.005 2.04.137 3 .404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.625-5.475 5.92.43.37.823 1.096.823 2.21 0 1.595-.015 2.88-.015 3.27 0 .32.218.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                      </a>
                    )}
                    {instructor.portfolio && (
                      <a
                        href={instructor.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Portfolio"
                      >
                        <svg
                          className="w-6 h-6 text-purple-600 hover:text-purple-800"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6h-4V4a4 4 0 0 0-8 0v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zM10 4a2 2 0 1 1 4 0v2h-4V4zm10 14H4V8h16v10z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for instructor details - rendered once, outside the grid */}
            {selectedInstructor && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fadeIn">
                  <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                    onClick={() => setSelectedInstructor(null)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <div className="flex flex-col items-center">
                    <img
                      src={selectedInstructor.image}
                      alt={selectedInstructor.name}
                      className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-indigo-200"
                    />
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                      {selectedInstructor.name}
                    </h2>
                    <p className="text-indigo-600 font-semibold mb-2 text-center">
                      {selectedInstructor.title}
                    </p>
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow mb-4">
                      {selectedInstructor.specialty}
                    </div>
                    <p className="text-gray-700 text-base mb-4 text-center">
                      {selectedInstructor.bio}
                    </p>
                    {/* Show more details if available */}
                    {selectedInstructor.email && (
                      <p className="text-gray-500 text-sm mb-1">
                        <span className="font-semibold">Email:</span>{" "}
                        {selectedInstructor.email}
                      </p>
                    )}
                    {selectedInstructor.phone && (
                      <p className="text-gray-500 text-sm mb-1">
                        <span className="font-semibold">Phone:</span>{" "}
                        {selectedInstructor.phone}
                      </p>
                    )}
                    {selectedInstructor.expertise &&
                      selectedInstructor.expertise.length > 0 && (
                        <div className="mt-4 w-full">
                          <h4 className="font-semibold text-gray-800 mb-2 text-center">
                            Expertise
                          </h4>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {selectedInstructor.expertise.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}

            {/* No Results */}
            {instructors.length === 0 && (
              <div className="text-center py-20">
                <svg
                  className="w-24 h-24 mx-auto text-gray-300 mb-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No instructors found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Instructor;
