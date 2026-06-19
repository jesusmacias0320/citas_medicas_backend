const express = require('express');
const router = express.Router();
const { registerDoctor, getActiveDoctors } = require('../controllers/doctorController');

router.post('/register', registerDoctor);

router.get('/lista', getActiveDoctors)

module.exports = router;