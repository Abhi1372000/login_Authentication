const jwt = require("jsonwebtoken");
const userModel = require("../models/userDetails");
const secretKey = process.env.JWT_SECRET_KEY;

const checkUserAuth = async (request, response, next) => {
  console.log("This is auth middle ware");
  // getting the token from user, from user side headers
  const { authorization } = request.headers;

  // checking the token is there or not
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      const token = authorization.split(" ")[1]; //getting the user id fro the token

      //vefication of token
      //getting the user id from the token
      const { userid, isLogged, userRole } = jwt.verify(token, secretKey);
      console.log(userRole)
      if(!(isLogged)){
        return response.status(400).json({status: "Failed", message: "user is not valid",})
      }
      if(userRole !== "user"){
        return response.status(400).json({status: "Failed", message: "user is not valid",}) 
      }
      //now cheking is it present in the DB and getting it
      request.user = await userModel.findById(userid, "email password role firstName").exec();
      next();
    } catch (error) {
      return response
        .status(400)
        .json({
          status: "Failed",
          message: "user is not valid",
        });
    }
  } else {
    return response.status(400).json({status:"Failed", message: "The token is not there" });
  }
};

const checkAdminAuth = async (request, response, next) => {
  console.log(" this is admin auth")
  //getting the token from user, from user side headers
  const { authorization } = request.headers;
  console.log(authorization)
  // checking the token is there or not
  if (authorization && authorization.startsWith("Bearer")) {
    const token = authorization.split(" ")[1];
    

    try {
      const { userid, isLogged, userRole } = jwt.verify(token, secretKey);

      if(!(isLogged)){
        return response.status(400).json({status: "Failed", message: "user is not valid",})
      }
      console.log(userRole)
      if(userRole !== "adminUser"){
        return response.status(400).json({status: "Failed", message: "user is not valid",}) 
      }
      request.user = await userModel.findById(userid, "email password role firstName").exec();
      next();
    } catch (error) {
      return response
        .status(403)
        .json({
          status: "Failed",
          message: "user is not valid",
        });
    }
  } else {
    return response
      .status(403)
      .json({ status: "error occured", message: "not a valid token" });
  }
  console.log("auth compeleted")
};

module.exports = {
  checkUserAuth,
  checkAdminAuth,
};
