const { findReservas, insertReservaCompleta } = require('../models/reservaModel');

async function getReserves(req, res) {
  try {
    const { uuid, clienteId, quartoId, hotelId } = req.query;
    const reservas = await findReservas({ uuid, clienteId, quartoId, hotelId });
    res.json({ reservas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao consultar reservas' });
  }
}

async function postReserve(req, res) {
  try {
    const body = req.body;
    await insertReservaCompleta(body);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Erro ao criar reserva' });
  }
}

module.exports = { getReserves, postReserve };
