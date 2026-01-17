const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

const getStats = async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const coursesSnapshot = await db.collection("courses").get();

    let studentCount = 0;
    let instructorCount = 0;

    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      if (user.role === "student") {
        studentCount++;
      } else if (user.role === "faculty") {
        instructorCount++;
      }
    });

    const courseCount = coursesSnapshot.size;

    res.status(200).json({
      students: studentCount,
      instructors: instructorCount,
      courses: courseCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getStats };
