const utilities = require("../utilities");
const inventoryModel = require("../models/inventory-model");

async function buildInventoryDetail(req, res) {
  const vehicle = await inventoryModel.getVehicleById(req.params.inv_id);
  const nav = await utilities.getNav();
  const favorites = req.session.favorites || [];

  res.render("inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    vehicle,
    favorites,
  });
}

module.exports = {
  buildInventoryDetail,
};
