const Sequelize = require('sequelize');

// const sequelize = new Sequelize(
//     process.env.DB_NAME,
//     process.env.DB_USER,
//     process.env.DB_PASS,
//     {
//       host: process.env.DB_HOST,
//       port: process.env.DB_PORT,
//       dialect: process.env.DB_DIALECT,
//     //   logging: (...msg) => console.log(msg)
//     },
//   );

const sequelize = new Sequelize('postgres://lab2021:lab2021@localhost:5432/chatapp') // Example for postgres

console.log(process.env.DB_NAME);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });