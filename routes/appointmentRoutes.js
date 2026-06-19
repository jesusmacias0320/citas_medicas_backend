const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getDoctorAgenda,
  updateAppointmentStatus,
  getAvailableSlots,
  getMyAppointments,
  cancelAppointment,
  getDoctorAppointments
} = require("../controllers/appointmenController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/book", verifyToken, createAppointment);

router.get('/my-appointments', verifyToken, getMyAppointments)


router.get("/agenda/:doctorId", getDoctorAgenda);
router.patch("/:id/status", updateAppointmentStatus);
router.get("/available/:doctorId/:fecha", getAvailableSlots);


router.put('/cancel/:id', verifyToken, cancelAppointment);


router.get('/doctor-appointments', verifyToken, getDoctorAppointments);

module.exports = router;
