const express = require('express');
const { Hotel } = require('../models');

const store = new Map();
const router = express.Router();

router.get('/', (_req, res) => {
  res.json(Array.from(store.values()).map((c) => c.toJSON()));
});

router.get('/:id', (req, res) => {
  const item = store.get(req.params.id);
  if (!item) return res.status(404).json({ message: 'Hotel not found' });
  res.json(item.toJSON());
});

router.post('/', (req, res) => {
  const hotel = Hotel.fromPayload(req.body || {});
  if (!hotel.id) return res.status(400).json({ message: 'id is required' });
  if (store.has(String(hotel.id))) return res.status(409).json({ message: 'Hotel already exists' });
  const validation = hotel.validate();
  if (!validation.isValid) return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
  store.set(String(hotel.id), hotel);
  res.status(201).json(hotel.toJSON());
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  if (!store.has(id)) return res.status(404).json({ message: 'Hotel not found' });
  const hotel = Hotel.fromPayload({ ...req.body, id });
  const validation = hotel.validate();
  if (!validation.isValid) return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
  store.set(id, hotel);
  res.json(hotel.toJSON());
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  if (!store.has(id)) return res.status(404).json({ message: 'Hotel not found' });
  store.delete(id);
  res.status(204).send();
});

module.exports = router;
