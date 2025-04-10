const express = require("express");
const router = express.Router();
const favoritesController = require("../controllers/favoritesController");

router.post(
  "/toggle",
  (req, res, next) => {
    console.log("POST /favorites/toggle hit");
    next();
  },
  favoritesController.toggleFavorite
);

module.exports = router;
