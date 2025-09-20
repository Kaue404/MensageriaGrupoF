const { PubSub } = require("@google-cloud/pubsub");
const { insertReservaCompleta } = require("./models/reservaModel");

const pubsub = new PubSub({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: "./config/pchave.json",
});

const subscriptionName = process.env.PUBSUB_SUBSCRIPTION;

function normalizeMessage(msg) {
  return {
    uuid: msg.uuid,
    created_at: msg.created_at,
    updated_at: msg.updated_at,
    type: msg.type,
    status: msg.reservation_status,
    total_amount: msg.total_amount,
    currency: msg.currency,
    customer: {
      id: msg.customer.id,
      name: msg.customer.name,
      document: msg.customer.document,
      email: msg.customer.email,
      phone: msg.customer.phone,
      country: msg.customer.country,
      loyalty_tier: msg.customer.loyalty_tier,
    },
    hotel_id: null,
    rooms: (msg.rooms || []).map((r) => ({
      room_number: r.room_number,
      daily_rate: r.daily_rate,
      number_of_days: r.number_of_days,
      checkin_date: r.checkin_date,
      checkout_date: r.checkout_date,
      status: r.status,
      guests: r.guests,
      breakfast_included: r.breakfast_included,
      category_id: null,
      sub_category_id: null,
    })),
  };
}

async function listenForMessages() {
  const subscription = pubsub.subscription(subscriptionName);

  subscription.on("message", async (message) => {
    try {
      const raw = JSON.parse(message.data.toString());

      const payload = normalizeMessage(raw);
        
      await insertReservaCompleta(payload);

      message.ack();
    } catch (err) {
      message.nack();
    }
  });

  subscription.on("error", (err) => {
    console.error("Erro no subscriber:", err);
  });
}

listenForMessages();
