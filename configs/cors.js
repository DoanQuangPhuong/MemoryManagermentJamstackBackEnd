// configs/cors.js
const corsOptions = {
  origin: 'https://memory-managerment-jamstack-front-end.vercel.app', // Thay thế bằng URL thực tế của bạn
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

module.exports = { corsOptions };
