const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require("../utilities/account-validation");
const { body } = require("express-validator");

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountHome)
);

router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post("/login", utilities.handleErrors(accountController.accountLogin));

// Route to deliver the account update view
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateView)
);

// Route to process account updates
router.post(
  "/update",
  [
    body("account_firstname").notEmpty().withMessage("First name is required."),
    body("account_lastname").notEmpty().withMessage("Last name is required."),
    body("account_email")
      .isEmail()
      .withMessage("A valid email is required.")
      .normalizeEmail(),
  ],
  utilities.handleErrors(accountController.updateAccount)
);

// Route to process password changes
router.post(
  "/update-password",
  [
    body("account_password")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ],
  utilities.handleErrors(accountController.updatePassword)
);

// Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
});

module.exports = router;
