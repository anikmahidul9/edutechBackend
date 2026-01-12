const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIpn,
} = require("../controllers/paymentController");
const verifyToken = require("../middlewares/authMiddleware");

router.post("/initiate", verifyToken, initiatePayment);
router.post("/success", paymentSuccess);
router.post("/fail", paymentFail);
router.post("/cancel", paymentCancel);
router.post("/ipn", paymentIpn);

module.exports = router;
