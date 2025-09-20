const express = require('express');
const { getReserves, postReserve, deleteAll } = require('../controllers/reservaController');

const router = express.Router();

router.get('/reserves', getReserves);
router.post('/reserves', postReserve);
router.delete('/reserves', deleteAll);

module.exports = router;
