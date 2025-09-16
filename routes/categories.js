const express = require('express');
const { Category, SubCategory } = require('../models');

const store = new Map();
const router = express.Router();

router.get('/', (_req, res) => {
  res.json(Array.from(store.values()).map((c) => c.toJSON()));
});

router.get('/:id', (req, res) => {
  const item = store.get(req.params.id);
  if (!item) return res.status(404).json({ message: 'Category not found' });
  res.json(item.toJSON());
});

router.post('/', (req, res) => {
  const category = Category.fromPayload(req.body || {});
  if (!category.id) return res.status(400).json({ message: 'id is required' });
  if (store.has(String(category.id))) return res.status(409).json({ message: 'Category already exists' });

  if (category.sub_category) {
    const subVal = category.sub_category.validate();
    if (!subVal.isValid) return res.status(400).json({ message: 'Validation failed', errors: subVal.errors });
  }

  const validation = category.validate();
  if (!validation.isValid) return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
  store.set(String(category.id), category);
  res.status(201).json(category.toJSON());
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  if (!store.has(id)) return res.status(404).json({ message: 'Category not found' });
  const payload = { ...req.body, id };
  if (payload.sub_category && !(payload.sub_category instanceof SubCategory)) {
    payload.sub_category = SubCategory.fromPayload(payload.sub_category);
  }
  const category = Category.fromPayload(payload);
  const validation = category.validate();
  if (!validation.isValid) return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
  store.set(id, category);
  res.json(category.toJSON());
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  if (!store.has(id)) return res.status(404).json({ message: 'Category not found' });
  store.delete(id);
  res.status(204).send();
});

module.exports = router;
