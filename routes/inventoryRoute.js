// Needed Resources
const utilities = require("../utilities/");
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");

const { body } = require("express-validator");
const { newInventoryRules } = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildInventoryDetail)
);

router.get("/", utilities.handleErrors(invController.renderManagementView));

router.get(
  "/add-classification",
  utilities.handleErrors(invController.renderAddClassification)
);

router.get(
  "/add-inventory",
  utilities.handleErrors(invController.renderAddInventory)
);

router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView)
);

router.post(
  "/add-classification",
  body("classification_name")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Classification name is required.")
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage(
      "Classification name must not contain spaces or special characters."
    ),
  utilities.handleErrors(invController.addClassification)
);

router.post(
  "/add-inventory",
  [
    body("classification_id")
      .notEmpty()
      .withMessage("Classification is required."),
    body("inv_make").notEmpty().withMessage("Make is required."),
    body("inv_model").notEmpty().withMessage("Model is required."),
    body("inv_year")
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Year must be valid."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Price must be valid."),
    body("inv_description").notEmpty().withMessage("Description is required."),
    body("inv_image").notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").notEmpty().withMessage("Thumbnail path is required."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be valid."),
    body("inv_color").notEmpty().withMessage("Color is required."),
  ],
  utilities.handleErrors(invController.addNewInventory)
);

router.post(
  "/update/",
  newInventoryRules(),
  // utilities.handleErrors(invController.checkUpdateData),
  utilities.handleErrors(invController.updateInventory)
);

module.exports = router;
