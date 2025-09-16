const { Booking } = require("../models");
const pool = require("../config/db");

async function getReserves(req, res) {
  try {
    const { uuid, customerId, roomId, hotelId } = req.query;

    const conditions = [];
    const values = [];
    let idx = 1;

    if (uuid) {
      conditions.push(`r.uuid = $${idx++}`);
      values.push(uuid);
    }
    if (customerId) {
      conditions.push(`c.id = $${idx++}`);
      values.push(customerId);
    }
    if (roomId) {
      conditions.push(`ro.id = $${idx++}`);
      values.push(roomId);
    }
    if (hotelId) {
      conditions.push(`h.id = $${idx++}`);
      values.push(hotelId);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT
        r.id as reservation_id,
        r.uuid,
        r.created_at,
        r.updated_at,
        r.type,
        r.status,
        r.total_amount,
        r.currency,
        -- customer
        c.id as customer_id,
        c.name as customer_name,
        c.email as customer_email,
        c.document as customer_document,
        c.phone as customer_phone,
        c.country as customer_country,
        c.loyalty_tier,
        -- hotel
        h.id as hotel_id,
        h.name as hotel_name,
        h.city as hotel_city,
        h.state as hotel_state,
        -- room
        ro.id as room_id,
        ro.room_number,
        ro.daily_rate,
        ro.number_of_days,
        ro.checkin_date,
        ro.checkout_date,
        ro.status as room_status,
        ro.guests,
        ro.breakfast_included,
        ro.category_id,
        ro.sub_category_id,
        -- payment
        p.id as payment_id,
        p.method as payment_method,
        p.status as payment_status,
        p.transaction_id,
        p.amount as payment_amount,
        -- metadata
        m.id as metadata_id,
        m.source,
        m.user_agent,
        m.ip_address,
        m.version
      FROM reservations r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN hotels h ON r.hotel_id = h.id
      LEFT JOIN rooms ro ON ro.reservation_id = r.id
      LEFT JOIN payments p ON p.reservation_id = r.id
      LEFT JOIN metadata m ON m.reservation_id = r.id
      ${whereClause};
    `;

    const { rows } = await pool.query(query, values);

    const reservas = {};

    for (const row of rows) {
      if (!reservas[row.reservation_id]) {
        reservas[row.reservation_id] = {
          id: row.reservation_id,
          uuid: row.uuid,
          created_at: row.created_at,
          updated_at: row.updated_at,
          type: row.type,
          status: row.status,
          total_amount: row.total_amount,
          currency: row.currency,
          customer: {
            id: row.customer_id,
            name: row.customer_name,
            email: row.customer_email,
            document: row.customer_document,
            phone: row.customer_phone,
            country: row.customer_country,
            loyalty_tier: row.loyalty_tier,
          },
          hotel: {
            id: row.hotel_id,
            name: row.hotel_name,
            city: row.hotel_city,
            state: row.hotel_state,
          },
          rooms: [],
          payments: [],
          metadata: [],
        };
      }

      if (row.room_id) {
        reservas[row.reservation_id].rooms.push({
          id: row.room_id,
          room_number: row.room_number,
          daily_rate: row.daily_rate,
          number_of_days: row.number_of_days,
          checkin_date: row.checkin_date,
          checkout_date: row.checkout_date,
          status: row.room_status,
          guests: row.guests,
          breakfast_included: row.breakfast_included,
          category_id: row.category_id,
          sub_category_id: row.sub_category_id,
          total_cost: row.daily_rate * row.number_of_days,
        });
      }

      if (row.payment_id) {
        reservas[row.reservation_id].payments.push({
          id: row.payment_id,
          method: row.payment_method,
          status: row.payment_status,
          transaction_id: row.transaction_id,
          amount: row.payment_amount,
        });
      }

      if (row.metadata_id) {
        reservas[row.reservation_id].metadata.push({
          id: row.metadata_id,
          source: row.source,
          user_agent: row.user_agent,
          ip_address: row.ip_address,
          version: row.version,
        });
      }
    }

    return res.status(200).json(Object.values(reservas));
  } catch (err) {
    console.error("Erro ao buscar reservas:", err);
    return res.status(500).json({ error: "Erro ao buscar reservas" });
  }
}

module.exports = {
  getReserves,
};
