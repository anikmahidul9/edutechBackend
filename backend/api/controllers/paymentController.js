const axios = require("axios");
const admin = require("../../config/firebase");

const initiatePayment = async (req, res) => {
  const { courseId, userId, amount } = req.body;

  if (!courseId || !userId || !amount) {
    return res.status(400).json({
      message: "Please provide all the required fields",
    });
  }

  try {
    // Validate environment variables
    if (!process.env.STORE_ID || !process.env.STORE_PASSWORD) {
      console.error("Missing SSL Commerz credentials in environment variables");
      return res.status(500).json({
        message: "Payment gateway not configured",
      });
    }

    const transactionId = `${userId}_${courseId}_${Date.now()}`;
    
    const paymentData = {
      store_id: process.env.STORE_ID,
      store_passwd: process.env.STORE_PASSWORD,
      total_amount: amount,
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${process.env.ROOT_URL}/api/payment/success`,
      fail_url: `${process.env.ROOT_URL}/api/payment/fail`,
      cancel_url: `${process.env.ROOT_URL}/api/payment/cancel`,
      ipn_url: `${process.env.ROOT_URL}/api/payment/ipn`,
      shipping_method: "NO",
      product_name: "Course Enrollment",
      product_category: "Education",
      product_profile: "general",
      cus_name: "Student",
      cus_email: "student@example.com",
      cus_add1: "Dhaka",
      cus_add2: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: "01700000000",
      cus_fax: "01700000000",
      ship_name: "Student",
      ship_add1: "Dhaka",
      ship_add2: "Dhaka",
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: "1000",
      ship_country: "Bangladesh",
      value_a: userId,
      value_b: courseId,
      value_c: amount, // Store amount as custom value
      value_d: new Date().toISOString(), // Store timestamp
    };

    // Make request to SSL Commerz API
    const response = await axios.post(
      "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
      paymentData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("SSL Commerz API Response:", response.data);

    if (response.data && response.data.GatewayPageURL) {
      res.json({ url: response.data.GatewayPageURL });
    } else if (response.data && response.data.status === "FAILED") {
      res.status(400).json({
        message: response.data.failedreason || "Payment gateway error",
        response: response.data,
      });
    } else {
      res.status(400).json({
        message: "Failed to get payment gateway URL",
        response: response.data,
      });
    }
  } catch (error) {
    console.error("Payment initiation error:", error.message);
    console.error("Error details:", error.response?.data || error);
    res.status(500).json({
      message: "Error initiating payment",
      error: error.message,
      details: error.response?.data || null,
    });
  }
};

const paymentSuccess = async (req, res) => {
  const { tran_id, value_a, value_b, value_c } = req.body;
  const userId = value_a;
  const courseId = value_b;
  const amount = value_c || req.body.amount || req.body.total_amount || 0;

  try {
    if (!userId || !courseId || !tran_id) {
      return res.status(400).json({
        message: "Missing required payment information",
      });
    }

    const db = admin.firestore();
    
    // Create enrollment record with amount
    const enrollmentsRef = db.collection("enrollments");
    await enrollmentsRef.add({
      userId,
      courseId,
      transactionId: tran_id,
      amount: parseFloat(amount) || 0,
      status: "paid",
      paymentDate: new Date(),
      createdAt: new Date(),
    });

    // Update user's my_courses subcollection
    await db.collection("users").doc(userId).collection("my_courses").doc(courseId).set({
      courseId,
      enrolledAt: new Date(),
      status: "enrolled",
      paymentAmount: parseFloat(amount) || 0,
    });

    console.log(`Payment successful: User ${userId} enrolled in course ${courseId} for amount ${amount}`);
    return res.redirect(`${process.env.CLIENT_URL}/payment/success`);
  } catch (error) {
    console.error("Payment success error:", error);
    res.status(500).json({
      message: "Error processing payment success",
      error: error.message,
    });
  }
};

const paymentFail = (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/payment/fail`);
};

const paymentCancel = (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/payment/cancel`);
};

const paymentIpn = (req, res) => {
    console.log("IPN received:", req.body);
    res.status(200).send("IPN received");
};

module.exports = {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIpn,
};
