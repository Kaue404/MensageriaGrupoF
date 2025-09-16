const express = require('express');
const { Customer } = require('../models');

const store = new Map();
const router = express.Router();

router.get('/', (_req, res) => {
  res.json(Array.from(store.values()).map((c) => c.toJSON()));
});

router.get('/:id', (req, res) => {
  const item = store.get(req.params.id);
  if (!item) return res.status(404).json({ message: 'Customer not found' });
  res.json(item.toJSON());
});

router.post('/', (req, res) => {
  const customer = Customer.fromPayload(req.body || {});
  if (!customer.id) return res.status(400).json({ message: 'id is required' });
  if (store.has(String(customer.id))) return res.status(409).json({ message: 'Customer already exists' });
  const validation = customer.validate();
  if (!validation.isValid) return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
  store.set(String(customer.id), customer);
  res.status(201).json(customer.toJSON());
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  if (!store.has(id)) return res.status(404).json({ message: 'Customer not found' });
  const customer = Customer.fromPayload({ ...req.body, id });
  const validation = customer.validate();
  if (!validation.isValid) return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
  store.set(id, customer);
  res.json(customer.toJSON());
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  if (!store.has(id)) return res.status(404).json({ message: 'Customer not found' });
  store.delete(id);
  res.status(204).send();
});

module.exports = router;
