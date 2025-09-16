const express = require('express');
const { Payment } = require('../models');

const store = new Map();
const router = express.Router();

router.get('/', (_req, res) => {
  res.json(Array.from(store.values()).map((p) => p.toJSON()));
});

router.get('/:transaction_id', (req, res) => {
  const item = store.get(req.params.transaction_id);
  if (!item) return res.status(404).json({ message: 'Payment not found' });
  res.json(item.toJSON());
});

router.post('/', (req, res) => {
  const payment = Payment.fromPayload(req.body || {});
  if (!payment.transaction_id) return res.status(400).json({ message: 'transaction_id is required' });
  if (store.has(payment.transaction_id)) return res.status(409).json({ message: 'Payment already exists' });
  const validation = payment.validate();
  if (!validation.isValid) return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
  store.set(payment.transaction_id, payment);
  res.status(201).json(payment.toJSON());
});

router.put('/:transaction_id', (req, res) => {
  const id = req.params.transaction_id;
  if (!store.has(id)) return res.status(404).json({ message: 'Payment not found' });
  const payment = Payment.fromPayload({ ...req.body, transaction_id: id });
  const validation = payment.validate();
  if (!validation.isValid) return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
  store.set(id, payment);
  res.json(payment.toJSON());
});

router.delete('/:transaction_id', (req, res) => {
  const id = req.params.transaction_id;
  if (!store.has(id)) return res.status(404).json({ message: 'Payment not found' });
  store.delete(id);
  res.status(204).send();
});

module.exports = router;
