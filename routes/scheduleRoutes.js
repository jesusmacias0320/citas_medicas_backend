const express = require('express');
const router = express.Router();
const { createSchedule } = require('../controllers/scheduleController');

router.post('/add' ,createSchedule);

module.exports = router;