import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import {
  FaUserGraduate,
  FaSearch,
  FaEye,
  FaTrash,
  FaSpinner,
  FaFilter,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaBook,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaIdCard,
} from "react-icons/fa";

const ManageStudent = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    totalEnrollments: 0,
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, statusFilter, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const studentsQuery = query(
        collection(db, "users"),
        where("role", "==", "student")
      );
      const querySnapshot = await getDocs(studentsQuery);
      const studentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setStudents(studentsList);
      setFilteredStudents(studentsList);

      // Calculate stats
      const activeCount = studentsList.filter(
        (s) => s.status?.toLowerCase() === "active" || !s.status
      ).length;

      setStats({
        totalStudents: studentsList.length,
        activeStudents: activeCount,
        inactiveStudents: studentsList.length - activeCount,
        totalEnrollments: studentsList.reduce(
          (sum, s) => sum + (s.enrolledCourses?.length || 0),
          0
        ),
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Failed to fetch students data");
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((student) => {
        const studentStatus = (student.status || "active").toLowerCase();
        return studentStatus === statusFilter.toLowerCase();
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    try {
      setDeleting(true);
      await deleteDoc(doc(db, "users", studentToDelete.id));
      setStudents(
        students.filter((student) => student.id !== studentToDelete.id)
      );
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-lg">
            <FaUserGraduate className="text-white text-2xl" />
          </div>
          Student Management
        </h1>
        <p className="text-gray-600">
          Manage all students, view profiles, and monitor enrollments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">
                Total Students
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalStudents}
              </p>
            </div>
            <FaUserGraduate className="text-4xl text-indigo-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">
                Active Students
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.activeStudents}
              </p>
            </div>
            <FaCheckCircle className="text-4xl text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">
                Inactive Students
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.inactiveStudents}
              </p>
            </div>
            <FaTimesCircle className="text-4xl text-red-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1">
                Total Enrollments
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalEnrollments}
              </p>
            </div>
            <FaBook className="text-4xl text-blue-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name, email, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <FaFilter className="text-indigo-600" />
          <span>
            Showing {filteredStudents.length} of {students.length} students
          </span>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <FaUserGraduate className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Student ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Enrolled Courses
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {student.photoURL ? (
                          <img
                            src={student.photoURL}
                            alt={student.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {student.fullName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {student.dateOfBirth || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-indigo-600 text-sm" />
                        <span className="text-sm text-gray-700">
                          {student.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-indigo-600 text-sm" />
                        <span className="text-sm text-gray-700">
                          {student.phone || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-700">
                        {student.studentId || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaBook className="text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          {student.enrolledCourses?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          (student.status || "active").toLowerCase() ===
                          "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {student.status
                          ? student.status.charAt(0).toUpperCase() +
                            student.status.slice(1).toLowerCase()
                          : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(student)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(student)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Student"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between sticky top-0">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaUserGraduate />
                Student Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Profile Section */}
              <div className="flex items-center gap-6 mb-8">
                {selectedStudent.photoURL ? (
                  <img
                    src={selectedStudent.photoURL}
                    alt={selectedStudent.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-indigo-200">
                    <span className="text-white font-bold text-3xl">
                      {selectedStudent.fullName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedStudent.fullName}
                  </h4>
                  <p className="text-indigo-600 font-semibold mb-2">
                    Student ID: {selectedStudent.studentId || "N/A"}
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      (selectedStudent.status || "active").toLowerCase() ===
                      "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedStudent.status
                      ? selectedStudent.status.charAt(0).toUpperCase() +
                        selectedStudent.status.slice(1).toLowerCase()
                      : "Active"}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FaEnvelope className="text-indigo-600 text-xl" />
                      <div>
                        <p className="text-xs text-gray-500">Email Address</p>
                        <p className="font-semibold text-gray-900 break-all">
                          {selectedStudent.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FaPhone className="text-indigo-600 text-xl" />
                      <div>
                        <p className="text-xs text-gray-500">Phone Number</p>
                        <p className="font-semibold text-gray-900">
                          {selectedStudent.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FaCalendarAlt className="text-indigo-600 text-xl" />
                      <div>
                        <p className="text-xs text-gray-500">Date of Birth</p>
                        <p className="font-semibold text-gray-900">
                          {selectedStudent.dateOfBirth || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FaMapMarkerAlt className="text-indigo-600 text-xl" />
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="font-semibold text-gray-900">
                          {selectedStudent.address || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FaIdCard className="text-indigo-600 text-xl" />
                      <div>
                        <p className="text-xs text-gray-500">Gender</p>
                        <p className="font-semibold text-gray-900">
                          {selectedStudent.gender || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex items-center gap-3">
                      <FaBook className="text-2xl text-blue-600" />
                      <div>
                        <p className="text-xs text-blue-600 font-semibold">
                          Enrolled Courses
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {selectedStudent.enrolledCourses?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {selectedStudent.bio && (
                <div className="mb-6">
                  <h5 className="font-bold text-gray-900 mb-2">About</h5>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
                    {selectedStudent.bio}
                  </p>
                </div>
              )}

              {/* Account Info */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-100">
                <h5 className="font-bold text-gray-900 mb-3">
                  Account Information
                </h5>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">User ID</p>
                    <p className="font-mono text-xs text-gray-900">
                      {selectedStudent.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Role</p>
                    <p className="font-semibold text-gray-900">
                      {selectedStudent.role || "Student"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Joined Date</p>
                    <p className="font-semibold text-gray-900">
                      {selectedStudent.createdAt
                        ?.toDate?.()
                        .toLocaleDateString() || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Last Updated</p>
                    <p className="font-semibold text-gray-900">
                      {selectedStudent.updatedAt
                        ?.toDate?.()
                        .toLocaleDateString() || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end sticky bottom-0">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-red-600 text-white px-6 py-4 rounded-t-xl flex items-center gap-3">
              <FaExclamationTriangle className="text-2xl" />
              <h3 className="text-xl font-bold">Delete Student</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete{" "}
                <strong>{studentToDelete.fullName}</strong>? This action cannot
                be undone.
              </p>
              <p className="text-sm text-gray-600 bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                <FaExclamationTriangle className="inline mr-2 text-yellow-600" />
                This will permanently remove the student's account and all
                associated data.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash />
                    Delete Student
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudent;
