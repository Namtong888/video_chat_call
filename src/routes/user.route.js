const express = require("express");
const userController = require('../controllers/user.controller');
const router = express.Router();

// Routes
router
    .get('/', userController.getUsers);

module.exports = router;