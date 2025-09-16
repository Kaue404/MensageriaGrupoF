require('dotenv').config();
const express = require('express');
const { PubSub } = require('@google-cloud/pubsub');
const fs = require('fs');
const bookingsRouter = require('./routes/bookings');
const customersRouter = require('./routes/customers');
const hotelsRouter = require('./routes/hotels');
const roomsRouter = require('./routes/rooms');
const categoriesRouter = require('./routes/categories');
const paymentsRouter = require('./routes/payments');
const metadataRouter = require('./routes/metadata');

const topicNameOrId = 'serjava-demo';
const subscriptionNameOrId = 'grupo-f-sub';

const pubSubClient = new PubSub({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// ---- API HTTP ----
const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Rotas
app.use('/bookings', bookingsRouter);
app.use('/customers', customersRouter);
app.use('/hotels', hotelsRouter);
app.use('/rooms', roomsRouter);
app.use('/categories', categoriesRouter);
app.use('/payments', paymentsRouter);
app.use('/metadata', metadataRouter);

const PORT = process.env.PORT || 3000;

// ---- Subscriber Pub/Sub ----
async function listenForMessages(subscriptionNameOrId) {
  const subscription = pubSubClient.subscription(subscriptionNameOrId);

  const messageHandler = (message) => {
    console.log('--- Mensagem recebida ---');
    console.log(`ID: ${message.id}`);
    console.log(`Data: ${message.data.toString()}`);
    console.log(`Atributos:`, message.attributes);
    message.ack();
  };

  subscription.on('message', messageHandler);

  subscription.on('error', (error) => {
    console.error('Erro na subscription:', error);
  });

  console.log(`Escutando mensagens em: ${subscriptionNameOrId}`);
}

(async () => {
  // Inicia API
  app.listen(PORT, () => {
    console.log(`API escutando em http://localhost:${PORT}`);
  });

  // Inicia Pub/Sub listener somente se credenciais estiverem válidas
  const hasProject = !!process.env.GOOGLE_PROJECT_ID;
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const hasCredsFile = credsPath && fs.existsSync(credsPath);
  if (hasProject && hasCredsFile) {
    await listenForMessages(subscriptionNameOrId);
  } else {
    console.warn('Pub/Sub desabilitado: defina GOOGLE_PROJECT_ID e GOOGLE_APPLICATION_CREDENTIALS (arquivo existente).');
  }
})();
