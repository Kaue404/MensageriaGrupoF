const express = require('express');
const { Booking } = require('../models');

const bookingsStore = new Map();

function buildBooking(payload) {
  const booking = Booking.fromPayload(payload || {});
  return booking;
}

function validateAndSend(res, booking, statusOnSuccess = 200) {
  const result = booking.validate();
  if (!result.isValid) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: result.errors,
    });
  }
  return res.status(statusOnSuccess).json(booking.toJSON());
}

const router = express.Router();

router.get('/', (req, res) => {
  const list = Array.from(bookingsStore.values()).map((b) => b.toJSON());
  res.json(list);
});

router.get('/:uuid', (req, res) => {
  const { uuid } = req.params;
  const booking = bookingsStore.get(uuid);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json(booking.toJSON());
});

router.post('/', (req, res) => {
  try {
    const payload = req.body || {};
    const booking = buildBooking(payload);

    if (!booking.uuid) {
      return res.status(400).json({ message: 'uuid is required' });
    }

    if (bookingsStore.has(booking.uuid)) {
      return res.status(409).json({ message: 'Booking already exists' });
    }

    const validation = booking.validate();
    if (!validation.isValid) {
      return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
    }

    bookingsStore.set(booking.uuid, booking);
    return res.status(201).json(booking.toJSON());
  } catch (err) {
    console.error('POST /bookings error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:uuid', (req, res) => {
  try {
    const { uuid } = req.params;
    if (!bookingsStore.has(uuid)) {
      return res.status(404).json({ message: 'Booking not found' });
    }

  const payload = { ...req.body, uuid };
    const booking = buildBooking(payload);

    const validation = booking.validate();
    if (!validation.isValid) {
      return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
    }

    bookingsStore.set(uuid, booking);
    return res.json(booking.toJSON());
  } catch (err) {
    console.error('PUT /bookings/:uuid error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:uuid', (req, res) => {
  try {
    const { uuid } = req.params;
    if (!bookingsStore.has(uuid)) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    bookingsStore.delete(uuid);
    return res.status(204).send();
  } catch (err) {
    console.error('DELETE /bookings/:uuid error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
