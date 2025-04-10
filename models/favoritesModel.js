const pool = require("../database/");

module.exports = {
  async addFavorite(account_id, inv_id) {
    const sql = `INSERT INTO favorites (account_id, inv_id) VALUES ($1, $2) RETURNING *;`;
    const result = await pool.query(sql, [account_id, inv_id]);
    return result.rows[0];
  },

  async removeFavorite(account_id, inv_id) {
    const sql = `DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2;`;
    await pool.query(sql, [account_id, inv_id]);
  },

  async isFavorite(account_id, inv_id) {
    const sql = `SELECT * FROM favorites WHERE account_id = $1 AND inv_id = $2;`;
    const result = await pool.query(sql, [account_id, inv_id]);
    return result.rows.length > 0;
  },

  async getFavoritesByAccountId(account_id) {
    const sql = `SELECT inv_id FROM favorites WHERE account_id = $1;`;
    const result = await pool.query(sql, [account_id]);
    return result.rows;
  },
};
