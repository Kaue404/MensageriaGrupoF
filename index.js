const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
require('dotenv').config();
const app = express();

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.json());

const bookingsRouter = require('./routes/bookings');
const categoriesRouter = require('./routes/categories');
const customersRouter = require('./routes/customers');
const hotelsRouter = require('./routes/hotels');
const metadataRouter = require('./routes/metadata');
const paymentsRouter = require('./routes/payments');
const roomsRouter = require('./routes/rooms');

app.use('/bookings', bookingsRouter);
app.use('/categories', categoriesRouter);
app.use('/customers', customersRouter);
app.use('/hotels', hotelsRouter);
app.use('/metadata', metadataRouter);
app.use('/payments', paymentsRouter);
app.use('/rooms', roomsRouter);

app.listen(process.env.PORT, () => {
    console.log('_____Start_____')
    console.log(`http://localhost:${process.env.PORT}`)
});