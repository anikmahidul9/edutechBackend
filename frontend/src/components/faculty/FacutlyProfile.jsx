import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
  FaBook,
  FaUsers,
  FaStar,
  FaCalendar,
  FaBriefcase,
  FaAward,
  FaCertificate,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaSpinner,
  FaWhatsapp,
} from "react-icons/fa";

const FacultyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    officeLocation: "",
    education: "",
    specialization: "",
    experience: "",
    bio: "",
    linkedin: "",
    github: "",
    website: "",
    whatsapp: "",
    photoURL: "",
  });
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  // Fetch faculty profile data from database
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          // Fetch from users collection where registration data is stored
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            const fullName =
              data.fullName ||
              `${data.firstName || ""} ${data.lastName || ""}`.trim();

            setProfileData({
              name: fullName || "",
              email: data.email || user.email || "",
              phone: data.phone || "",
              department: data.expertise || data.department || "",
              designation: data.designation || "Faculty Member",
              officeLocation: data.officeLocation || "",
              education: data.highestQualification || data.education || "",
              specialization: data.expertise || data.specialization || "",
              experience: data.yearsOfExperience
                ? `${data.yearsOfExperience} Years`
                : data.experience || "",
              bio: data.bio || "",
              linkedin: data.linkedin || "",
              github: data.github || "",
              website: data.website || "",
              whatsapp: data.whatsapp || data.phone || "",
              photoURL: data.photoURL || user.photoURL || "",
            });

            // Set photo preview if exists
            if (data.photoURL || user.photoURL) {
              setPhotoPreview(data.photoURL || user.photoURL);
            }
          } else {
            // If no profile exists, set basic info from auth
            setProfileData((prev) => ({
              ...prev,
              email: user.email || "",
              name: user.displayName || "",
              photoURL: user.photoURL || "",
            }));
            if (user.photoURL) {
              setPhotoPreview(user.photoURL);
            }
          }
        } catch (err) {
          console.error("Error fetching faculty profile:", err);
          setError("Failed to load profile data. Please try again.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError("Please log in to view your profile.");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let photoURL = profileData.photoURL;

      // Upload new photo if selected
      if (selectedPhoto) {
        console.log("Uploading photo to Firebase Storage...");
        try {
          const storageRef = ref(storage, `faculty/${userId}/profile.jpg`);
          console.log("Storage ref created:", storageRef.fullPath);

          const snapshot = await uploadBytes(storageRef, selectedPhoto);
          console.log("Upload successful:", snapshot);

          photoURL = await getDownloadURL(storageRef);
          console.log("Photo URL obtained:", photoURL);
        } catch (uploadError) {
          console.error("Photo upload error:", uploadError);
          throw new Error(`Failed to upload photo: ${uploadError.message}`);
        }
      }

      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        fullName: profileData.name,
        phone: profileData.phone,
        department: profileData.department,
        expertise: profileData.specialization,
        designation: profileData.designation,
        officeLocation: profileData.officeLocation,
        highestQualification: profileData.education,
        specialization: profileData.specialization,
        yearsOfExperience: profileData.experience,
        bio: profileData.bio,
        linkedin: profileData.linkedin,
        github: profileData.github,
        website: profileData.website,
        whatsapp: profileData.whatsapp,
        photoURL: photoURL,
        updatedAt: new Date().toISOString(),
      });

      // Update local state with new photo URL
      setProfileData((prev) => ({ ...prev, photoURL }));
      setPhotoPreview(photoURL);
      setSelectedPhoto(null);

      setIsEditing(false);
      console.log("Profile saved successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        setError("Photo size should be less than 5MB");
        return;
      }

      console.log("Photo selected:", file.name, file.size, file.type);
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const stats = [
    {
      icon: <FaBook className="text-2xl" />,
      label: "Courses Teaching",
      value: "5",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <FaUsers className="text-2xl" />,
      label: "Total Students",
      value: "150",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: <FaStar className="text-2xl" />,
      label: "Average Rating",
      value: "4.8",
      color: "from-amber-500 to-amber-600",
    },
    {
      icon: <FaAward className="text-2xl" />,
      label: "Publications",
      value: "23",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const achievements = [
    {
      title: "Best Faculty Award 2025",
      organization: "EduTech University",
      year: "2025",
    },
    {
      title: "Research Excellence Award",
      organization: "IEEE Conference",
      year: "2024",
    },
    {
      title: "Outstanding Educator",
      organization: "Computer Science Department",
      year: "2023",
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Error
          </h2>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white p-8 rounded-lg shadow-xl mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Profile Picture */}
          <div className="relative group">
            {photoPreview || profileData.photoURL ? (
              <img
                src={photoPreview || profileData.photoURL}
                alt="Profile"
                className="h-32 w-32 rounded-full object-cover shadow-2xl ring-4 ring-white"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-white to-emerald-100 flex items-center justify-center text-emerald-700 text-5xl font-bold shadow-2xl ring-4 ring-white">
                {profileData.name
                  ? profileData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "FA"}
              </div>
            )}
            {isEditing && (
              <label
                htmlFor="photoUpload"
                className="absolute bottom-0 right-0 bg-white text-emerald-600 p-3 rounded-full shadow-lg hover:bg-emerald-50 transition-all group-hover:scale-110 cursor-pointer"
              >
                <FaCamera className="text-lg" />
                <input
                  id="photoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold mb-2">
              {profileData.name || "Faculty Member"}
            </h1>
            <p className="text-emerald-100 text-lg font-semibold mb-1">
              {profileData.designation || "Faculty Member"}
            </p>
            <p className="text-emerald-200 flex items-center justify-center md:justify-start gap-2 mb-3">
              <FaGraduationCap />
              {profileData.department || "Department"}
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {profileData.whatsapp && (
                <a
                  href={`https://wa.me/${profileData.whatsapp.replace(
                    /[^0-9]/g,
                    ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition-all flex items-center gap-2"
                >
                  <FaWhatsapp />
                  WhatsApp
                </a>
              )}
              {profileData.linkedin && (
                <a
                  href={
                    profileData.linkedin.startsWith("http")
                      ? profileData.linkedin
                      : `https://${profileData.linkedin}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition-all flex items-center gap-2"
                >
                  <FaLinkedin />
                  LinkedIn
                </a>
              )}
              {profileData.github && (
                <a
                  href={
                    profileData.github.startsWith("http")
                      ? profileData.github
                      : `https://${profileData.github}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition-all flex items-center gap-2"
                >
                  <FaGithub />
                  GitHub
                </a>
              )}
              {profileData.website && (
                <a
                  href={
                    profileData.website.startsWith("http")
                      ? profileData.website
                      : `https://${profileData.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition-all flex items-center gap-2"
                >
                  <FaGlobe />
                  Portfolio
                </a>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <div>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2"
              >
                <FaEdit />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleEdit}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all shadow-lg flex items-center gap-2"
                >
                  <FaTimes />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <div
              className={`bg-gradient-to-r ${stat.color} text-white w-14 h-14 rounded-lg flex items-center justify-center mb-4 shadow-md`}
            >
              {stat.icon}
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <FaUser className="text-emerald-600" />
              </div>
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                ) : (
                  <div className="flex items-center gap-3 text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                    <FaEnvelope className="text-emerald-600" />
                    <span>{profileData.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                ) : (
                  <div className="flex items-center gap-3 text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                    <FaPhone className="text-emerald-600" />
                    <span>{profileData.phone || "Not provided"}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  WhatsApp Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="whatsapp"
                    value={profileData.whatsapp}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                ) : (
                  <div className="flex items-center gap-3 text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                    <FaWhatsapp className="text-emerald-600" />
                    <span>{profileData.whatsapp || "Not provided"}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Office Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="officeLocation"
                    value={profileData.officeLocation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                ) : (
                  <div className="flex items-center gap-3 text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                    <FaMapMarkerAlt className="text-emerald-600" />
                    <span>{profileData.officeLocation || "Not provided"}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Experience
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="experience"
                    value={profileData.experience}
                    onChange={handleChange}
                    placeholder="e.g., 5 Years"
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                ) : (
                  <div className="flex items-center gap-3 text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                    <FaBriefcase className="text-emerald-600" />
                    <span>{profileData.experience || "Not provided"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FaGraduationCap className="text-blue-600" />
              </div>
              Academic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Education
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="education"
                    value={profileData.education}
                    onChange={handleChange}
                    placeholder="e.g., Ph.D. in Computer Science"
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                ) : (
                  <div className="text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                    {profileData.education || "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Specialization
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="specialization"
                    value={profileData.specialization}
                    onChange={handleChange}
                    placeholder="e.g., Machine Learning, AI"
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                ) : (
                  <div className="text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                    {profileData.specialization || "Not provided"}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600 mb-2 block">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                  />
                ) : (
                  <div className="text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                    {profileData.bio || "Not provided"}
                  </div>
                )}
              </div>

              {/* Social Media Links - Only show in edit mode */}
              {isEditing && (
                <>
                  <div className="col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FaGlobe className="text-emerald-600" />
                      Social Media Links
                    </h3>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">
                      LinkedIn Profile
                    </label>
                    <input
                      type="text"
                      name="linkedin"
                      value={profileData.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">
                      GitHub Profile
                    </label>
                    <input
                      type="text"
                      name="github"
                      value={profileData.github}
                      onChange={handleChange}
                      placeholder="https://github.com/yourusername"
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">
                      Portfolio Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={profileData.website}
                      onChange={handleChange}
                      placeholder="https://yourportfolio.com"
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600 mb-2 block">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      name="whatsapp"
                      value={profileData.whatsapp}
                      onChange={handleChange}
                      placeholder="+1234567890"
                      className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <FaAward className="text-amber-600" />
              </div>
              Achievements
            </h2>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-transparent pl-4 py-3 rounded-r-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <FaCertificate className="text-emerald-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {achievement.organization}
                      </p>
                      <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                        <FaCalendar className="text-xs" />
                        {achievement.year}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-3 rounded-lg transition-all font-medium text-left flex items-center gap-3">
                <FaBook />
                View My Courses
              </button>
              <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-3 rounded-lg transition-all font-medium text-left flex items-center gap-3">
                <FaUsers />
                View Students
              </button>
              <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-3 rounded-lg transition-all font-medium text-left flex items-center gap-3">
                <FaCalendar />
                View Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;
