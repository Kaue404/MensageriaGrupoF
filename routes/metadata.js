const express = require('express');
const { Metadata } = require('../models');

const store = new Map();
const router = express.Router();

function keyOf(m) {
  return `${m.source}|${m.ip_address}`;
}

router.get('/', (_req, res) => {
  res.json(Array.from(store.values()).map((m) => m.toJSON()));
});

router.get('/:source/:ip', (req, res) => {
  const item = store.get(`${req.params.source}|${req.params.ip}`);
  if (!item) return res.status(404).json({ message: 'Metadata not found' });
  res.json(item.toJSON());
});

router.post('/', (req, res) => {
  const meta = Metadata.fromPayload(req.body || {});
  const validation = meta.validate();
  if (!validation.isValid) return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
  const k = keyOf(meta);
  if (store.has(k)) return res.status(409).json({ message: 'Metadata already exists' });
  store.set(k, meta);
  res.status(201).json(meta.toJSON());
});

router.put('/:source/:ip', (req, res) => {
  const source = req.params.source;
  const ip = req.params.ip;
  const k = `${source}|${ip}`;
  if (!store.has(k)) return res.status(404).json({ message: 'Metadata not found' });
  const meta = Metadata.fromPayload({ ...req.body, source, ip_address: ip });
  const validation = meta.validate();
  if (!validation.isValid) return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
  store.set(k, meta);
  res.json(meta.toJSON());
});

router.delete('/:source/:ip', (req, res) => {
  const k = `${req.params.source}|${req.params.ip}`;
  if (!store.has(k)) return res.status(404).json({ message: 'Metadata not found' });
  store.delete(k);
  res.status(204).send();
});

module.exports = router;
