const express = require('express');
const { getReserves, postReserve } = require('../controllers/reservaController');

const router = express.Router();

router.get('/reserves', getReserves);
router.post('/reserves', postReserve); // opcional para inserir via API

module.exports = router;
