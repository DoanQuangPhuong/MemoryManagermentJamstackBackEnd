// configs/cors.js
const corsOptions = {
  origin: 'https://memory-managerment-jamstack-front-end.vercel.app', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

module.exports = { corsOptions };
