/**
 * npm init -y   # se ainda não tiver package.json
 * npm install dotenv @google-cloud/pubsub
 */

require('dotenv').config();
const { PubSub } = require('@google-cloud/pubsub');

/**
 * TODO(developer): Ajustar conforme necessário
 */
const topicNameOrId = 'serjava-demo';
const subscriptionNameOrId = 'grupo-f-sub';

// Cria o cliente Pub/Sub (usando .env)
const pubSubClient = new PubSub({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

/**
 * Cria uma subscription (caso ainda não exista (opcional), veja ativação no final do arquivo #Executa)
 */
async function createSubscription(topicNameOrId, subscriptionNameOrId) {
  try {
    await pubSubClient.topic(topicNameOrId).createSubscription(subscriptionNameOrId);
    console.log(`Subscription ${subscriptionNameOrId} criada.`);
  } catch (error) {
    if (error.code === 6) {
      console.log(`Subscription ${subscriptionNameOrId} já existe.`);
    } else {
      console.error('Erro ao criar subscription:', error);
    }
  }
}

/**
 * Escuta mensagens da subscription
 */
async function listenForMessages(subscriptionNameOrId) {
  const subscription = pubSubClient.subscription(subscriptionNameOrId);

  // Handler de mensagens
  const messageHandler = message => {
    console.log('--- Mensagem recebida ---');
    console.log(`ID: ${message.id}`);
    console.log(`Data: ${message.data.toString()}`);
    console.log(`Atributos:`, message.attributes);
    message.ack(); // Confirma recebimento
  };

  // Listener
  subscription.on('message', messageHandler);

  // Erros
  subscription.on('error', error => {
    console.error('Erro na subscription:', error);
  });

  console.log(`Escutando mensagens em: ${subscriptionNameOrId}`);
}

// Executa
(async () => {
//  await createSubscription(topicNameOrId, subscriptionNameOrId); // Descomente se precisar criar a subscription
  await listenForMessages(subscriptionNameOrId);
})();
