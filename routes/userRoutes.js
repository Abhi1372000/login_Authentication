// here we importing the functions from userController onnecting with the api end points
const express = require("express");
const router = express.Router();

// here we importing the functions from userController
const {
  userRegister,
  userLogin,
  updateUserDetails,
  getUserDetals,
} = require("../controllers/userController");

const { checkUserAuth } = require("../middleware/authMiddleware");

//Asigning the functions to routes

//PUBLIC APIs
router.post("/registration", userRegister);
router.post("/login", userLogin);

//PROTECTED APIs
router.put("/change/password", checkUserAuth, updateUserDetails);
router.get("/details", checkUserAuth, getUserDetals);

module.exports = router;
