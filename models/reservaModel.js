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

  // Se filtrar por quarto
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
    rooms: (r.rooms || []).map((q) => ({
      id: q.id,
      room_number: q.room_number,
      daily_rate: q.daily_rate,
      number_of_days: q.number_of_days,
      checkin_date: q.checkin_date,
      checkout_date: q.checkout_date,
      status: q.status,
      guests: q.guests,
      breakfast_included: q.breakfast_included,
      category_id: q.category_id,
      sub_category_id: q.sub_category_id,
      total_room: Number(q.daily_rate) * Number(q.number_of_days),
    })),
    total_reservation: (r.rooms || []).reduce(
      (acc, q) =>
        acc + Number(q.daily_rate || 0) * Number(q.number_of_days || 0),
      0
    ),
  }));
}

async function upsertCustomer(cust) {
  if (!cust || !cust.id) throw new Error("Cliente inválido");
  const { error } = await supabase.from("customers").upsert({
    id: cust.id,
    name: cust.name || null,
    document: cust.document || null,
    email: cust.email || null,
    phone: cust.phone || null,
    country: cust.country || null,
    loyalty_tier: cust.loyalty_tier || null,
  });
  if (error) throw error;
  return cust.id;
}

async function insertReservaCompleta(reservation) {
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
  const reservationId = (resIns && resIns[0] && resIns[0].id) || reservation.id;

  // Zera rooms antigos
  await supabase.from("rooms").delete().eq("reservation_id", reservationId);

  // Insere novos rooms
  const rooms = (reservation.rooms || []).map((r) => ({
    reservation_id: reservationId,
    room_number: r.room_number,
    daily_rate: r.daily_rate,
    number_of_days: r.number_of_days,
    checkin_date: r.checkin_date,
    checkout_date: r.checkout_date,
    status: r.status,
    guests: r.guests,
    breakfast_included: r.breakfast_included,
    category_id: r.category_id,
    sub_category_id: r.sub_category_id,
  }));

  if (rooms.length) {
    const { error: roomErr } = await supabase.from("rooms").insert(rooms);
    if (roomErr) throw roomErr;
  }
}

module.exports = { findReservas, insertReservaCompleta };
