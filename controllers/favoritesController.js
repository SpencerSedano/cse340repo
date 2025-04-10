const favoritesModel = require("../models/favoritesModel");

module.exports = {
  async toggleFavorite(req, res) {
    try {
      console.log("toggleFavorite called with body:", req.body);
      console.log("Session data:", req.session);

      const { inv_id } = req.body;
      const account_id = req.session.account_id;
      console.log("Session data in toggleFavorite:", req.session);

      // if (!account_id) {
      //   console.warn("Unauthorized access: No account_id in session");
      //   return res.status(401).json({
      //     success: false,
      //     message: "Unauthorized: User not logged in",
      //   });
      // }

      const isFavorite = await favoritesModel.isFavorite(account_id, inv_id);
      console.log(`isFavorite result: ${isFavorite}`);

      if (isFavorite) {
        await favoritesModel.removeFavorite(account_id, inv_id);
        console.log("Favorite removed");
        return res.json({ success: true, favorited: false });
      } else {
        await favoritesModel.addFavorite(account_id, inv_id);
        console.log("Favorite added");
        return res.json({ success: true, favorited: true });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};
