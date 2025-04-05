const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Render Add Inventory View
 * ************************** */

invCont.renderManagementView = async function (req, res) {
  try {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash("info"),
      classificationList, // Pass the HTML string to the view
    });
  } catch (error) {
    console.error("Error rendering management view:", error.message);
    res.status(500).render("errors/error", {
      title: "Server Error",
      message: "There was an error loading the Inventory Management page.",
      nav: "",
    });
  }
};

invCont.renderAddClassification = async function (req, res) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    });
  } catch (error) {
    console.error("Error rendering Add Classification view:", error.message);
    res.status(500).render("errors/error", {
      title: "Server Error",
      message: "There was an error loading the Add Classification page.",
      nav: "",
    });
  }
};

invCont.renderAddInventory = async function (req, res) {
  try {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    let inv_classification_id = null;
    let inv_make = "";
    let inv_model = "";
    let inv_year = "";
    let inv_price = "";
    let inv_description = "";
    let inv_image = "/images/no-image.png";
    let inv_thumbnail = "/images/no-image-thumb.png";
    let inv_miles = "";
    let inv_color = "";

    if (req.query.id) {
      const inventoryItem = await invModel.getInventoryById(req.query.id);
      inv_classification_id = inventoryItem.classification_id;
      inv_make = inventoryItem.make || "";
      inv_model = inventoryItem.model || "";
      inv_year = inventoryItem.year || "";
      inv_price = inventoryItem.price || "";
      inv_description = inventoryItem.description || "";
      inv_image = inventoryItem.image || "/images/no-image.png";
      inv_thumbnail = inventoryItem.thumbnail || "/images/no-image-thumb.png";
      inv_miles = inventoryItem.miles || "";
      inv_color = inventoryItem.color || "";
    }

    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: null,
      classificationList,
      inv_classification_id,
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
  } catch (error) {
    console.error("Error rendering Add Inventory view:", error.message);
    res.status(500).render("errors/error", {
      title: "Server Error",
      message: "There was an error loading the Add Inventory page.",
      nav: "",
    });
  }
};

invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;
  let nav = await utilities.getNav();

  try {
    const result = await invModel.insertClassification(classification_name);
    if (result) {
      req.flash("info", "Classification added successfully.");
      nav = await utilities.getNav();
      res.redirect("/inv");
    } else {
      req.flash("error", "Failed to add classification.");
      res.status(500).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
      });
    }
  } catch (error) {
    req.flash("error", "Error adding classification: " + error.message);
    res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    });
  }
};

invCont.addNewInventory = async function (req, res) {
  const {
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

  let nav = await utilities.getNav();

  try {
    const vehicle = {
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
    };

    const result = await invModel.insertInventory(vehicle);
    if (result) {
      req.flash("info", "Inventory item added successfully.");
      res.redirect("/inv");
    } else {
      req.flash("error", "Failed to add inventory item.");
      res.status(500).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList: await utilities.buildClassificationList(
          classification_id
        ),
        ...vehicle,
      });
    }
  } catch (error) {
    req.flash("error", "Error adding inventory item: " + error.message);
    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList: await utilities.buildClassificationList(
        classification_id
      ),
      ...req.body,
    });
  }
};

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildInventoryDetail = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  const vehicle = await invModel.getInventoryById(inv_id);
  let nav = await utilities.getNav();

  if (!vehicle) {
    return res.status(404).send("Vehicle not found");
  }

  res.render("./inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    vehicle,
  });
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  console.log("Classification ID:", classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  console.log("Parsed inv_id:", inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryById(inv_id);
  const classificationList = await utilities.buildClassificationList(
    itemData.classification_id
  );
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  });
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  console.log("Form data received:", req.body); // Debugging log

  try {
    // Parse numeric fields to ensure they are valid
    const updatedVehicle = {
      inv_id: parseInt(inv_id),
      classification_id: parseInt(classification_id),
      inv_make,
      inv_model,
      inv_year: parseInt(inv_year),
      inv_price: parseFloat(inv_price),
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_miles: parseInt(inv_miles),
      inv_color,
    };

    console.log("Parsed data for update:", updatedVehicle); // Debugging log

    const result = await invModel.updateInventory(
      updatedVehicle.inv_id,
      updatedVehicle.inv_make,
      updatedVehicle.inv_model,
      updatedVehicle.inv_year,
      updatedVehicle.inv_price,
      updatedVehicle.inv_description,
      updatedVehicle.inv_image,
      updatedVehicle.inv_thumbnail,
      updatedVehicle.inv_miles,
      updatedVehicle.inv_color,
      updatedVehicle.classification_id
    );

    if (result) {
      req.flash("info", "Inventory item updated successfully.");
      res.redirect("/inv");
    } else {
      req.flash("error", "Failed to update inventory item.");
      res.redirect(`/inv/edit/${inv_id}`);
    }
  } catch (error) {
    console.error("Error updating inventory item:", error.message);
    req.flash("error", "Error updating inventory item.");
    res.redirect(`/inv/edit/${inv_id}`);
  }
};

/* ***************************
 *  Delete Confirmation View
 * ************************** */
invCont.deleteView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryById(inv_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  const classificationList = await utilities.buildClassificationList(
    itemData.classification_id
  );
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    erros: null,
    classificationList,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
  });
};

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteItem = async function (req, res, next) {
  let nav = await utilities.getNav();
  const inv_id = parseInt(req.body.inv_id);

  const deleteResult = await invModel.deleteInventoryItem(inv_id);

  if (deleteResult) {
    req.flash("notice", "The deletion was successful");
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, the delete failed.");
    res.redirect("/inv/delete/inv_id");
  }
};

module.exports = invCont;
