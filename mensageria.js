require('dotenv').config();
const { PubSub } = require('@google-cloud/pubsub');

const topicNameOrId = 'serjava-demo';
const subscriptionNameOrId = 'grupo-f-sub';

const pubSubClient = new PubSub({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

async function listenForMessages(subscriptionNameOrId) {
  const subscription = pubSubClient.subscription(subscriptionNameOrId);

  const messageHandler = message => {
    console.log('--- Mensagem recebida ---');
    console.log(`ID: ${message.id}`);
    console.log(`Data: ${message.data.toString()}`);
    console.log(`Atributos:`, message.attributes);
    message.ack();
  };

  subscription.on('message', messageHandler);

  subscription.on('error', error => {
    console.error('Erro na subscription:', error);
  });

  console.log(`Escutando mensagens em: ${subscriptionNameOrId}`);
}

(async () => {
  await listenForMessages(subscriptionNameOrId);
})();
