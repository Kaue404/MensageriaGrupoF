const { insertReservaCompleta } = require('./models/reservaModel');
require('./config/supabase');

const exemplo = {
  id: 1,
  uuid: '33333333-3333-3333-3333-333333333333',
  cliente: { id: 5001, nome: 'Cliente Seed', documento: 'SEED123', email: 'seed@example.com' },
  hotel_id: 700,
  data_checkin: '2025-12-20',
  data_checkout: '2025-12-22',
  quartos: [
    { quarto_id: 9001, preco_noite: 150.5, noites: 2 },
    { quarto_id: 9002, preco_noite: 120, noites: 2 }
  ]
};

insertReservaCompleta(exemplo).then(() => {
  console.log('Seed inserido com sucesso');
}).catch((e) => {
  console.error('Falha no seed:', e.message);
  process.exit(1);
});
