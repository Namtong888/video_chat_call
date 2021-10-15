const express = require("express");
const homeRoute = require('../home.route');
const roomRoute = require('../room.route');
const userRoute = require('../user.route');

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
    {
        path: '/user',
        route: userRoute,
    },
];

// register routes list
routes.forEach((route) => {
    router.use(route.path, route.route);
});
  
module.exports = router;