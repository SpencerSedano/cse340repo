const { body, validationResult } = require("express-validator");
const utilities = require("../utilities/");

async function checkInventoryData(req, res, next) {}

/**
 * Validation rules for adding or updating inventory
 */
function newInventoryRules() {
  return [
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
  ];
}

async function checkUpdateData(req, res, next) {
  const {
    inv_id,
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_miles,
    inv_color,
  } = req.body;

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    res.status(400).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors,
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_miles,
      inv_color,
    });
    return;
  }
  next();
}

module.exports = {
  checkInventoryData,
  checkUpdateData,
  newInventoryRules,
};
