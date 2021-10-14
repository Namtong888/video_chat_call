const express = require("express");
const { v4: uuidV4 } = require('uuid');

const router = express.Router();

// Routes
router.get("/", (req, res) => {
    res.redirect(`${req.originalUrl}/${uuidV4()}`);
});

router.get("/create", (req, res) => {
    res.render("create");
});

router.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});
  
module.exports = router;