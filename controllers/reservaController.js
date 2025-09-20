const {
  findReservas,
  insertReservaCompleta,
  cleanDatabase,
} = require("../models/reservaModel");

async function getReserves(req, res) {
  try {
    const { uuid, customerId, roomId, hotelId } = req.query;
    const reservas = await findReservas({ uuid, customerId, roomId, hotelId });
    res.json({ reservas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao consultar reservas" });
  }
}

async function postReserve(req, res) {
  try {
    const body = req.body;
    await insertReservaCompleta(body);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Erro ao criar reserva" });
  }
}

async function deleteAll(req, res) {
  try {
    await cleanDatabase();
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao limpar o banco de dados" });
  }
}

module.exports = { getReserves, postReserve, deleteAll };
