const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */

Util.getNav = async function () {
  try {
    let data = await invModel.getAllClassifications();
    if (!data || data.rows.length === 0) {
      console.error("No classifications found.");
      return "<ul class='nav-ul'><li>No classifications available</li></ul>";
    }

    let list = "<ul class='nav-ul'>";
    list += '<li id="tools"><a href="/" title="Home page">Home</a></li>';
    data.rows.forEach((row) => {
      list += "<li>";
      list +=
        '<a href="/inv/type/' +
        row.classification_id +
        '" title="See our inventory of ' +
        row.classification_name +
        ' vehicles">' +
        row.classification_name +
        "</a>";
      list += "</li>";
    });
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("Error building navigation:", error.message);
    return "<ul class='nav-ul'><li>Error loading navigation</li></ul>";
  }
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};
/* ****************************************
 * Build the vehicle detail view HTML
 **************************************** */
Util.buildVehicleDetailView = function (vehicle) {
  if (!vehicle) {
    return '<p class="notice">Vehicle not found.</p>';
  }

  return `
    <div class="vehicle-detail-container">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${
    vehicle.inv_model
  }">
        <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Price:</strong> ${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(vehicle.inv_price)}</p>
        <p><strong>Year:</strong> ${vehicle.inv_year}</p>
        <p><strong>Mileage:</strong> ${new Intl.NumberFormat("en-US").format(
          vehicle.inv_miles
        )} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
    </div>
  `;
};

Util.buildClassificationList = async function (selectedId = null) {
  try {
    console.log("Fetching classifications from the database...");
    const classifications = await invModel.getAllClassifications();
    console.log("Classifications fetched:", classifications.rows);

    if (!classifications || classifications.rows.length === 0) {
      console.error("No classifications found.");
      return "<p>No classifications available.</p>";
    }

    let list = `<select id="classificationList" name="classification_id" required>`; // Updated ID
    list += `<option value="">Select a Classification</option>`;
    classifications.rows.forEach((c) => {
      let selected = selectedId == c.classification_id ? "selected" : "";
      list += `<option value="${c.classification_id}" ${selected}>${c.classification_name}</option>`;
    });
    list += `</select>`;

    return list;
  } catch (error) {
    console.error("Error in buildClassificationList:", error.message);
    return "<p>Error loading classifications.</p>";
  }
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 * Middleware to check account type
 **************************************** */
Util.checkAccountType = (req, res, next) => {
  const { account_type } = res.locals.accountData || {};
  if (account_type === "Employee" || account_type === "Admin") {
    return next();
  }
  req.flash("notice", "You do not have permission to access this page.");
  return res.redirect("/account/login");
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  console.log("Session Account ID:", req.session.account_id);
  if (req.session.account_id) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

module.exports = Util;
