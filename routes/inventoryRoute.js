// Needed Resources
const utilities = require("../utilities/");
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildInventoryDetail)
);

module.exports = router;
