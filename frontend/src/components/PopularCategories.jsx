import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";

const PopularCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category images mapping
  const categoryImages = {
    "Web Development":
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop",
    "Mobile Development":
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
    "Data Science":
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    "Machine Learning":
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop",
    "Artificial Intelligence":
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
    "Cloud Computing":
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
    Cybersecurity:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop",
    DevOps:
      "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&h=300&fit=crop",
    "UI/UX Design":
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
    "Graphic Design":
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop",
    "Digital Marketing":
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
    Business:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
    Photography:
      "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=300&fit=crop",
    "Video Editing":
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop",
    "Music Production":
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop",
    "Content Writing":
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop",
    Finance:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop",
    "Database Management":
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=300&fit=crop",
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Fetch approved courses
      const coursesSnapshot = await getDocs(collection(db, "courses"));
      const coursesList = coursesSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((course) => {
          return (
            course.status === "approved" ||
            course.status === "active" ||
            !course.status
          );
        });

      // Group courses by category and count them
      const categoryMap = {};
      coursesList.forEach((course) => {
        const category = course.category || "Other";
        if (!categoryMap[category]) {
          categoryMap[category] = {
            name: category,
            count: 0,
            image:
              categoryImages[category] ||
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
          };
        }
        categoryMap[category].count++;
      });

      // Convert to array and sort by course count
      const categoriesArray = Object.values(categoryMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8); // Show top 8 categories

      setCategories(categoriesArray);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = () => {
    navigate("/courses");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <FaSpinner
            className="animate-spin text-5xl mx-auto mb-4"
            style={{ color: "#FF630E" }}
          />
          <p className="text-gray-600 text-lg">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-12 pb-8 px-6">
      <div className="container mx-auto">
        {/* Heading Section */}
        <div className="text-center mb-16">
          <p
            className="text-lg font-semibold mb-3"
            style={{ color: "#FF630E" }}
          >
            CATEGORIES
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold"
            style={{ color: "#130F40" }}
          >
            Popular Categories
          </h1>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
              {categories.map((category, index) => (
                <div
                  key={index}
                  onClick={handleCategoryClick}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden group"
                >
                  {/* Category Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Category Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 font-medium">
                      {category.count}{" "}
                      {category.count === 1 ? "Course" : "Courses"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* All Categories Button */}
            <div className="text-center">
              <button
                onClick={handleCategoryClick}
                className="px-16 py-5 rounded-xl font-bold text-white text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: "#FF630E" }}
              >
                All Categories
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-500 text-lg">No categories available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularCategories;
