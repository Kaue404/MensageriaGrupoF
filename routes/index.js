const express = require('express');
const router = express.Router();

const reservasRoutes = require('./reservas');

router.use(reservasRoutes);

module.exports = router;
