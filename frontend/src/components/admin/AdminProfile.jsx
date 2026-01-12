import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../../config/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  FaUserShield,
  FaCamera,
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaInfoCircle,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaChalkboardTeacher,
  FaBook,
  FaChartLine,
  FaEdit,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    photoURL: "",
    joinedDate: "",
  });

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    activeUsers: 0,
  });

  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchAdminData(user.uid);
      } else {
        navigate("/admin/login");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchAdminData = async (uid) => {
    try {
      setLoading(true);

      // Get current user from Auth
      const currentUser = auth.currentUser;

      // Try to fetch from Firestore
      const adminDoc = await getDoc(doc(db, "users", uid));

      let firestoreData = {};
      if (adminDoc.exists()) {
        firestoreData = adminDoc.data();
      }

      // Merge Auth and Firestore data, with fallbacks
      setProfileData({
        fullName:
          firestoreData.fullName ||
          firestoreData.displayName ||
          currentUser?.displayName ||
          "Admin User",
        email: firestoreData.email || currentUser?.email || "admin@edutech.com",
        phone: firestoreData.phone || "",
        address: firestoreData.address || "",
        bio: firestoreData.bio || "",
        photoURL: firestoreData.photoURL || currentUser?.photoURL || "",
        joinedDate:
          firestoreData.createdAt?.toDate?.().toLocaleDateString() ||
          currentUser?.metadata?.creationTime ||
          "N/A",
      });

      // Fetch stats (you can expand this with real queries)
      setStats({
        totalStudents: 245,
        totalFaculty: 48,
        totalCourses: 127,
        activeUsers: 189,
      });
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Failed to load profile data");

      // Even on error, show Auth data if available
      const currentUser = auth.currentUser;
      if (currentUser) {
        setProfileData({
          fullName: currentUser.displayName || "Admin User",
          email: currentUser.email || "admin@edutech.com",
          phone: "",
          address: "",
          bio: "",
          photoURL: currentUser.photoURL || "",
          joinedDate: currentUser.metadata?.creationTime || "N/A",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    try {
      setPhotoUploading(true);
      setError("");

      // Upload to Firebase Storage
      const storageRef = ref(storage, `admin-profiles/${userId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      // Update profile with new photo URL
      setProfileData({ ...profileData, photoURL });

      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL });
      }

      // Update Firestore
      await updateDoc(doc(db, "users", userId), {
        photoURL,
        updatedAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error uploading photo:", err);
      setError("Failed to upload photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileData.fullName || !profileData.email) {
      setError("Name and email are required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Update Firestore
      await updateDoc(doc(db, "users", userId), {
        fullName: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio,
        updatedAt: serverTimestamp(),
      });

      // Update Firebase Auth display name
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.fullName,
        });
      }

      setSuccess(true);
      setEditMode(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg flex items-center gap-3 animate-fade-in">
          <FaCheckCircle className="text-2xl" />
          <div>
            <p className="font-semibold">Profile updated successfully!</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center gap-3">
          <FaInfoCircle className="text-2xl" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-semibold mb-1">
                Total Students
              </p>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
            </div>
            <FaUsers className="text-5xl text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-semibold mb-1">
                Total Faculty
              </p>
              <p className="text-3xl font-bold">{stats.totalFaculty}</p>
            </div>
            <FaChalkboardTeacher className="text-5xl text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-semibold mb-1">
                Total Courses
              </p>
              <p className="text-3xl font-bold">{stats.totalCourses}</p>
            </div>
            <FaBook className="text-5xl text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-semibold mb-1">
                Active Users
              </p>
              <p className="text-3xl font-bold">{stats.activeUsers}</p>
            </div>
            <FaChartLine className="text-5xl text-white/30" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32"></div>

            {/* Profile Photo */}
            <div className="relative px-6 pb-6">
              <div className="flex justify-center -mt-16 mb-4">
                <div className="relative">
                  {profileData.photoURL ? (
                    <img
                      src={profileData.photoURL}
                      alt="Admin"
                      className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <FaUserShield className="text-5xl text-white" />
                    </div>
                  )}

                  {/* Upload Photo Button */}
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 bg-indigo-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors"
                  >
                    {photoUploading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaCamera />
                    )}
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {profileData.fullName}
                </h2>
                <p className="text-indigo-600 font-semibold flex items-center justify-center gap-2">
                  <FaUserShield />
                  System Administrator
                </p>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <FaEnvelope className="text-indigo-600 flex-shrink-0" />
                  <span className="text-sm break-all">{profileData.email}</span>
                </div>

                {profileData.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaPhone className="text-indigo-600" />
                    <span className="text-sm">{profileData.phone}</span>
                  </div>
                )}

                {profileData.address && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaMapMarkerAlt className="text-indigo-600" />
                    <span className="text-sm">{profileData.address}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-gray-600">
                  <FaCalendarAlt className="text-indigo-600" />
                  <span className="text-sm">
                    Joined {profileData.joinedDate}
                  </span>
                </div>
              </div>

              {/* Bio */}
              {profileData.bio && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">
                    About
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {profileData.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FaUserShield className="text-indigo-600" />
                Profile Settings
              </h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  <FaEdit />
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleChange}
                  disabled={!editMode}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="123 Admin Street, City, Country"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio / About
                </label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  disabled={!editMode}
                  rows="4"
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              {/* Action Buttons */}
              {editMode && (
                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      fetchAdminData(userId);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
