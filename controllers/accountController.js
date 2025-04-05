const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function buildAccountHome(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname } = res.locals.accountData;
  res.render("account/home", {
    title: "Welcome",
    nav,
    account_firstname,
  });
}

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  // Call the model to register the account
  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword // Pass the hashed password
    );

    if (regResult.rowCount) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      );
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(501).render("account/register", {
        title: "Registration",
        nav,
      });
    }
  } catch (error) {
    console.error("Error during registration:", error.message);
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  console.log("Email:", account_email);
  console.log("Password:", account_password);

  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash(
        "message notice",
        "Please check your credentials and try again."
      );
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

/* ****************************************
 * Deliver the account update view
 **************************************** */
async function buildUpdateView(req, res) {
  let nav = await utilities.getNav();
  const accountData = await accountModel.getAccountById(req.params.account_id);
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id,
  });
}

/* ****************************************
 * Process account updates
 **************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
      account_id: req.body.account_id,
    });
  }

  const updateResult = await accountModel.updateAccount(
    req.body.account_id,
    req.body.account_firstname,
    req.body.account_lastname,
    req.body.account_email
  );

  if (updateResult) {
    req.flash("notice", "Account updated successfully.");
    return res.redirect("/account");
  } else {
    req.flash("notice", "Account update failed.");
    return res.redirect("/account/update/" + req.body.account_id);
  }
}

/* ****************************************
 * Process password changes
 **************************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors,
      account_id: req.body.account_id,
    });
  }

  const hashedPassword = await bcrypt.hash(req.body.account_password, 10);
  const updateResult = await accountModel.updatePassword(
    req.body.account_id,
    hashedPassword
  );

  if (updateResult) {
    req.flash("notice", "Password updated successfully.");
    return res.redirect("/account");
  } else {
    req.flash("notice", "Password update failed.");
    return res.redirect("/account/update/" + req.body.account_id);
  }
}

/* ****************************************
 * Logout Process
 **************************************** */
function logout(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
}

module.exports = {
  buildAccountHome,
  buildRegister,
  registerAccount,
  buildLogin,
  accountLogin,
  buildUpdateView,
  updateAccount,
  updatePassword,
  logout,
};
