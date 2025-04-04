const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getAllClassifications() {
  try {
    console.log("Executing query to fetch classifications...");
    const result = await pool.query(
      "SELECT classification_id, classification_name FROM public.classification ORDER BY classification_name"
    );
    console.log("Query result:", result.rows);
    return result;
  } catch (error) {
    console.error("Error in getAllClassifications:", error.message);
    throw error;
  }
}

async function insertClassification(classification_name) {
  try {
    const sql = `INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *`;
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0]; // Return the inserted row
  } catch (error) {
    console.error("Error inserting classification:", error);
    throw error;
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
    throw error;
  }
}

async function getInventoryById(inv_id) {
  try {
    const sql = "SELECT * FROM public.inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id]);
    return data.rows[0];
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

async function insertInventory(vehicle) {
  try {
    const sql = `
      INSERT INTO public.inventory (classification_id, inv_make, inv_model, inv_year, inv_price, inv_description, inv_image, inv_thumbnail, inv_miles, inv_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;

    const result = await pool.query(sql, [
      vehicle.classification_id,
      vehicle.inv_make,
      vehicle.inv_model,
      vehicle.inv_year,
      vehicle.inv_price,
      vehicle.inv_description,
      vehicle.inv_image,
      vehicle.inv_thumbnail,
      vehicle.inv_miles,
      vehicle.inv_color,
    ]);

    return result.rows[0];
  } catch (error) {
    console.error("Error inserting inventory:", error);
    throw error;
  }
}

/* ***************************
 *  Update inventory item by ID
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_year,
  inv_price,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql = `
      UPDATE public.inventory
      SET 
        inv_make = $1,
        inv_model = $2,
        inv_year = $3,
        inv_price = $4,
        inv_description = $5,
        inv_image = $6,
        inv_thumbnail = $7,
        inv_miles = $8,
        inv_color = $9,
        classification_id = $10
      WHERE inv_id = $11
      RETURNING *`;

    const result = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_miles,
      inv_color,
      classification_id,
      inv_id,
    ]);

    return result.rows[0];
  } catch (error) {
    console.error("Error updating inventory:", error);
    throw error;
  }
}

module.exports = {
  getAllClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  insertClassification,
  insertInventory,
  updateInventory,
};
