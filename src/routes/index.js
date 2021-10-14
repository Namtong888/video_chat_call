const express = require("express");
const homeRoute = require('./home.route');
const roomRoute = require('./room.route');

const router = express.Router();

// bind route with path
const routes = [
    {
        path: '/',
        route: homeRoute,
    },
    {
        path: '/room',
        route: roomRoute,
    },
];

// register routes list
routes.forEach((route) => {
    router.use(route.path, route.route);
});
  
module.exports = router;