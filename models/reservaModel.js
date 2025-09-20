const supabase = require("../config/supabase");

async function findReservas(filters) {
  const { uuid, customerId, roomId, hotelId } = filters;

  let query = supabase
    .from("reservations")
    .select("*, rooms(*), customer:customer_id(*), hotel:hotel_id(*)")
    .order("created_at", { ascending: false });

  if (uuid) query = query.eq("uuid", uuid);
  if (customerId) query = query.eq("customer_id", Number(customerId));
  if (hotelId) query = query.eq("hotel_id", Number(hotelId));

  if (roomId) {
    const { data: idsRows, error: idsErr } = await supabase
      .from("rooms")
      .select("reservation_id")
      .eq("id", Number(roomId));

    if (idsErr) throw idsErr;
    const ids = [...new Set((idsRows || []).map((r) => r.reservation_id))];
    if (ids.length === 0) return [];
    query = query.in("id", ids);
  }

  let roomsQuery = supabase.from("rooms").select("*");
 const { data: allRooms, error: roomsErr } = await roomsQuery;
 console.log('All Rooms:', allRooms);
 
  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((r) => ({
    id: r.id,
    uuid: r.uuid,
    customer_id: r.customer_id,
    hotel_id: r.hotel_id,
    created_at: r.created_at,
    updated_at: r.updated_at,
    type: r.type,
    status: r.status,
    currency: r.currency,
    total_amount: r.total_amount,
    rooms: r.rooms,
    total_reservation: (r.rooms || []).reduce(
      (acc, q) =>
        acc + Number(q.daily_rate || 0) * Number(q.number_of_days || 0),
      0
    ),
    customer: r.customer,
  }));
}

async function upsertCustomer(cust) {
  if (!cust || !cust.id) throw new Error("Cliente inválido");

  try {
    const { data, error } = await supabase
      .from("customers")
      .upsert({
        id: cust.id,
        name: cust.name || null,
        document: cust.document || null,
        email: cust.email || null,
        phone: cust.phone || null,
        country: cust.country || null,
        loyalty_tier: cust.loyalty_tier || null,
      })
      .select();

    if (error) throw error;
    return cust.id;
  } catch (e) {
    console.error("❌ Erro real no upsertCustomer:", e);
    throw e;
  }
}

const upsertRoom = async (room, reservationId) => {
  console.log("Upsert Room:", room, reservationId);

  if (!room || !reservationId) throw new Error("Quarto ou reserva inválidos");
  try {
    const { data, error } = await supabase
      .from("rooms")
      .upsert({
        id: room.id,
        reservation_id: reservationId,
        room_number: room.room_number || null,
        daily_rate: room.daily_rate || null,
        number_of_days: room.number_of_days || null,
        checkin_date: room.checkin_date || null,
        checkout_date: room.checkout_date || null,
        status: room.status || null,
        guests: room.guests || null,
        breakfast_included: room.breakfast_included || null,
        category_id: null,
        sub_category_id: null,
      })
      .select();

    console.log("Upsert Room Data:", data);

    if (error) throw error;
    return room.id;
  } catch (e) {
    console.error("❌ Erro real no upsertRoom:", e);
    throw e;
  }
};

async function insertReservaCompleta(reservation) {
  try {
    const now = new Date().toISOString();

    if (reservation.customer) {
      await upsertCustomer(reservation.customer);
      reservation.customer_id = reservation.customer.id;
    }

    const { data: resIns, error: resErr } = await supabase
      .from("reservations")
      .upsert({
        id: reservation.id,
        uuid: reservation.uuid,
        customer_id: reservation.customer_id,
        hotel_id: reservation.hotel_id,
        type: reservation.type || null,
        status: reservation.status || null,
        total_amount: reservation.total_amount || null,
        currency: reservation.currency || null,
        updated_at: now,
        created_at: reservation.created_at || now,
      })
      .select();

    if (resErr) throw resErr;
    const reservationId =
      (resIns && resIns[0] && resIns[0].id) || reservation.id;

    await supabase.from("rooms").delete().eq("reservation_id", reservationId);

    for (const room of reservation.rooms || []) {
      console.log("Salvando quarto:", room);

      await upsertRoom(room, reservationId);
    }
  } catch (error) {
    console.error("❌ Erro ao salvar reserva completa:", error);
  }
}

async function cleanDatabase() {
  await supabase.from("rooms").delete().neq("id", 0);
  await supabase.from("reservations").delete().neq("id", 0);
  await supabase.from("customers").delete().neq("id", 0);
}

module.exports = { findReservas, insertReservaCompleta, cleanDatabase };
