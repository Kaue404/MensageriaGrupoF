const express = require('express');
const { Room } = require('../models');

const store = new Map();
const router = express.Router();

router.get('/', (_req, res) => {
  res.json(Array.from(store.values()).map((c) => c.toJSON()));
});

router.get('/:id', (req, res) => {
  const item = store.get(req.params.id);
  if (!item) return res.status(404).json({ message: 'Room not found' });
  res.json(item.toJSON());
});

router.post('/', (req, res) => {
  const room = Room.fromPayload(req.body || {});
  if (!room.id) return res.status(400).json({ message: 'id is required' });
  if (store.has(String(room.id))) return res.status(409).json({ message: 'Room already exists' });
  const validation = room.validate();
  if (!validation.isValid) return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
  store.set(String(room.id), room);
  res.status(201).json(room.toJSON());
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  if (!store.has(id)) return res.status(404).json({ message: 'Room not found' });
  const room = Room.fromPayload({ ...req.body, id });
  const validation = room.validate();
  if (!validation.isValid) return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
  store.set(id, room);
  res.json(room.toJSON());
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  if (!store.has(id)) return res.status(404).json({ message: 'Room not found' });
  store.delete(id);
  res.status(204).send();
});

module.exports = router;
