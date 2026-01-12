import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaFilter,
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaBriefcase,
  FaTimes,
  FaEye,
  FaTrash,
} from "react-icons/fa";

const ManageFaculty = () => {
  const [faculties, setFaculties] = useState([]);
  const [filteredFaculties, setFilteredFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);

  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    filterFaculties();
  }, [searchTerm, statusFilter, faculties]);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const facultyQuery = query(
        collection(db, "users"),
        where("role", "==", "faculty")
      );
      const querySnapshot = await getDocs(facultyQuery);
      const facultyList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFaculties(facultyList);
      setFilteredFaculties(facultyList);
    } catch (error) {
      console.error("Error fetching faculties:", error);
      alert("Failed to fetch faculty data");
    } finally {
      setLoading(false);
    }
  };

  const filterFaculties = () => {
    let filtered = [...faculties];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((faculty) => faculty.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (faculty) =>
          faculty.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faculty.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faculty.expertise?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFaculties(filtered);
  };

  const handleStatusUpdate = async (facultyId, newStatus) => {
    try {
      setActionLoading(facultyId);
      const facultyRef = doc(db, "users", facultyId);
      await updateDoc(facultyRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      // Update local state
      setFaculties((prev) =>
        prev.map((faculty) =>
          faculty.id === facultyId ? { ...faculty, status: newStatus } : faculty
        )
      );

      alert(`Faculty ${newStatus} successfully!`);
    } catch (error) {
      console.error("Error updating faculty status:", error);
      alert("Failed to update faculty status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteFaculty = async () => {
    if (!facultyToDelete) return;

    try {
      setActionLoading(facultyToDelete.id);
      const facultyRef = doc(db, "users", facultyToDelete.id);
      await deleteDoc(facultyRef);

      // Update local state
      setFaculties((prev) =>
        prev.filter((faculty) => faculty.id !== facultyToDelete.id)
      );

      alert("Faculty deleted successfully!");
      setDeleteConfirmModal(false);
      setFacultyToDelete(null);
    } catch (error) {
      console.error("Error deleting faculty:", error);
      alert("Failed to delete faculty");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <FaCheckCircle /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            <FaTimesCircle /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
            <FaClock /> Pending
          </span>
        );
    }
  };

  const stats = {
    total: faculties.length,
    pending: faculties.filter((f) => f.status === "pending").length,
    approved: faculties.filter((f) => f.status === "approved").length,
    rejected: faculties.filter((f) => f.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading faculty data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Manage Faculty
        </h1>
        <p className="text-gray-600">
          Review and approve faculty registrations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Faculty</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <FaUserTie className="text-4xl text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
            <FaClock className="text-4xl text-yellow-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Approved</p>
              <p className="text-3xl font-bold">{stats.approved}</p>
            </div>
            <FaCheckCircle className="text-4xl text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Rejected</p>
              <p className="text-3xl font-bold">{stats.rejected}</p>
            </div>
            <FaTimesCircle className="text-4xl text-red-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredFaculties.length === 0 ? (
          <div className="text-center py-12">
            <FaUserTie className="text-gray-300 text-5xl mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No faculty members found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Faculty Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Qualification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFaculties.map((faculty) => (
                  <tr
                    key={faculty.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {faculty.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p
                            className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
                            onClick={() => {
                              setSelectedFaculty(faculty);
                              setIsModalOpen(true);
                            }}
                          >
                            {faculty.fullName}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <FaBriefcase className="text-xs" />
                            {faculty.expertise || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <FaEnvelope className="text-gray-400" />
                          {faculty.email}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <FaPhone className="text-gray-400" />
                          {faculty.phone || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <FaGraduationCap className="text-indigo-500" />
                          {faculty.qualification || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {faculty.experience} years experience
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(faculty.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {faculty.status !== "approved" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(faculty.id, "approved")
                            }
                            disabled={actionLoading === faculty.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaCheckCircle />
                            Approve
                          </button>
                        )}
                        {faculty.status !== "rejected" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(faculty.id, "rejected")
                            }
                            disabled={actionLoading === faculty.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaTimesCircle />
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setFacultyToDelete(faculty);
                            setDeleteConfirmModal(true);
                          }}
                          disabled={actionLoading === faculty.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaTrash />
                          Delete
                        </button>
                        {actionLoading === faculty.id && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Faculty Details Modal */}
      {isModalOpen && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-2xl font-bold">Faculty Details</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedFaculty(null);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Profile Section */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b">
                {selectedFaculty.photoURL ? (
                  <img
                    src={selectedFaculty.photoURL}
                    alt={selectedFaculty.fullName}
                    className="h-24 w-24 rounded-full object-cover border-4 border-indigo-100"
                  />
                ) : (
                  <div className="h-24 w-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {selectedFaculty.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedFaculty.fullName}
                  </h3>
                  <p className="text-gray-600 mb-2">{selectedFaculty.email}</p>
                  {getStatusBadge(selectedFaculty.status)}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaEnvelope className="text-indigo-600" />
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        Email
                      </p>
                      <p className="text-gray-900">{selectedFaculty.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        Phone
                      </p>
                      <p className="text-gray-900">
                        {selectedFaculty.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaGraduationCap className="text-indigo-600" />
                    Professional Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        Qualification
                      </p>
                      <p className="text-gray-900">
                        {selectedFaculty.qualification || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                        Experience
                      </p>
                      <p className="text-gray-900">
                        {selectedFaculty.experience
                          ? `${selectedFaculty.experience} years`
                          : "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expertise */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaBriefcase className="text-indigo-600" />
                    Expertise
                  </h4>
                  <p className="text-gray-900">
                    {selectedFaculty.expertise || "Not provided"}
                  </p>
                </div>

                {/* Registration Date */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaClock className="text-indigo-600" />
                    Registration Date
                  </h4>
                  <p className="text-gray-900">
                    {selectedFaculty.createdAt?.toDate
                      ? new Date(
                          selectedFaculty.createdAt.toDate()
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not available"}
                  </p>
                </div>
              </div>

              {/* Bio */}
              {selectedFaculty.bio && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Bio
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedFaculty.bio}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-6 border-t">
                {selectedFaculty.status !== "approved" && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedFaculty.id, "approved");
                      setIsModalOpen(false);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <FaCheckCircle />
                    Approve Faculty
                  </button>
                )}
                {selectedFaculty.status !== "rejected" && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedFaculty.id, "rejected");
                      setIsModalOpen(false);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    <FaTimesCircle />
                    Reject Faculty
                  </button>
                )}
                <button
                  onClick={() => {
                    setFacultyToDelete(selectedFaculty);
                    setDeleteConfirmModal(true);
                    setIsModalOpen(false);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  <FaTrash />
                  Delete Faculty
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedFaculty(null);
                  }}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && facultyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-red-600 text-white px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaTrash />
                Delete Faculty
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete{" "}
                <strong>{facultyToDelete.fullName}</strong>?
              </p>
              <p className="text-sm text-red-600 mb-6">
                This action cannot be undone. All faculty data will be
                permanently removed.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteConfirmModal(false);
                    setFacultyToDelete(null);
                  }}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFaculty}
                  disabled={actionLoading === facultyToDelete.id}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === facultyToDelete.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFaculty;
