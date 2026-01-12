import React, { useState, useEffect } from "react";
import {
  FaUserEdit,
  FaEnvelope,
  FaPhone,
  FaUniversity,
  FaTransgender,
  FaCheckCircle,
  FaCamera,
  FaUser,
} from "react-icons/fa";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoURL, setPhotoURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribe;
    setLoading(true);
    setError("");
    // Listen for auth state changes
    unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        setProfile(null);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
          setFormData({
            ...userDoc.data(),
            aboutMe: userDoc.data().aboutMe || "",
          });
          setPhotoURL(userDoc.data().photoURL || "");
        }
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
    setSuccess("");
    setError("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      setPhotoURL(URL.createObjectURL(e.target.files[0]));
    }
  };

  const uploadPhotoToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "edutech_student_photos");
      formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Photo upload failed");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return null;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const user = auth.currentUser;
      let updatedData = { ...formData };
      if (photoFile) {
        const photoURL = await uploadPhotoToCloudinary(photoFile);
        if (photoURL) {
          updatedData.photoURL = photoURL;
          setPhotoURL(photoURL);
        }
      }
      await updateDoc(doc(db, "users", user.uid), updatedData);
      setProfile(updatedData);
      setEditMode(false);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        No profile found.
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">


      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section with Profile Photo and Basic Info */}
        <div className="bg-white rounded-3xl shadow-lg p-8 sm:p-12 mb-8">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Profile Photo */}
            <div className="flex flex-col items-center sm:items-start flex-shrink-0">
              <div className="relative group">
                <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-purple-200 to-indigo-200 p-1 shadow-xl">
                  <img
                    src={photoURL || "/public/homeImage/default-profile.png"}
                    alt="Profile"
                    className="w-full h-full rounded-2xl object-cover"
                  />
                </div>
                {editMode && (
                  <label className="absolute bottom-2 right-2 bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-full cursor-pointer hover:scale-110 shadow-lg transition-all duration-300">
                    <FaCamera className="text-white text-xl" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Profile Basic Info */}
            <div className="flex-1">
              <div className="mb-2">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                  {profile.fullName ||
                    `${profile.firstName} ${profile.lastName}`}
                </h1>
              </div>
              <div className="mb-6">
                <p className="text-xl text-purple-600 font-semibold">Student</p>
              </div>

              {!editMode && (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-lg hover:scale-105"
                >
                  <FaUserEdit /> Edit Profile
                </button>
              )}

              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 font-medium">Email</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {profile.email}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 font-medium">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {profile.phone || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg text-sm flex items-center gap-3 shadow-sm">
            <FaCheckCircle className="text-xl flex-shrink-0" /> {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Contact Information Section */}
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                {editMode ? (
                  <input
                    name="firstName"
                    type="text"
                    value={formData.firstName || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-base transition-all"
                    required
                  />
                ) : (
                  <p className="text-gray-700 text-base font-medium py-3">
                    {profile.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                {editMode ? (
                  <input
                    name="lastName"
                    type="text"
                    value={formData.lastName || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-base transition-all"
                    required
                  />
                ) : (
                  <p className="text-gray-700 text-base font-medium py-3">
                    {profile.lastName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                {editMode ? (
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-base transition-all"
                  />
                ) : (
                  <p className="text-gray-700 text-base font-medium py-3">
                    {profile.phone || "-"}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                {editMode ? (
                  <select
                    name="gender"
                    value={formData.gender || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 bg-white text-base transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-gray-700 text-base font-medium py-3 capitalize">
                    {profile.gender || "-"}
                  </p>
                )}
              </div>

              {/* Institution */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Institution/School/College
                </label>
                {editMode ? (
                  <input
                    name="institution"
                    type="text"
                    value={formData.institution || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-base transition-all"
                  />
                ) : (
                  <p className="text-gray-700 text-base font-medium py-3">
                    {profile.institution || "-"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* About Me Section */}
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About Me</h2>
            {editMode ? (
              <textarea
                name="aboutMe"
                value={formData.aboutMe || ""}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-base resize-none transition-all"
                placeholder="Tell us about yourself, your interests, and your academic goals..."
              />
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-gray-700 text-base min-h-[150px] leading-relaxed">
                {profile.aboutMe || "No information provided yet."}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {editMode && (
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-base disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="bg-gray-100 text-gray-700 font-bold py-3 px-8 rounded-lg hover:bg-gray-200 transition-all duration-200 text-base"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
