const { model } = require("mongoose");
const userModel = require("../models/userDetails");
const bcyrpt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY;

//Genrating JWT
const genratingJWT = (user) => {
  const token = jwt.sign(
    {
      userid: user._id,
      userEmail: user.email,
      userRole: user.role,
      isLogged: true,
    },
    secretKey,
    { expiresIn: "120m" }
  );
  if (!token) {
    throw new Error("token is not genrated");
  }
  return token;
};

//encrypting Function
// const encrypt = async (textToEncrypt, salt = 10)=>{
//   const encryptedText = await bcyrpt.hash(textToEncrypt, salt);
//   console.log(encryptedText)
// }

//@desc Registration of user
//@route  POST/api/user/registration
//@access public
const userRegister = async (request, response) => {
  console.log("This user registration set");
  //getting the details form the body
  const { email, firstName, lastName, password, confirmPassword } =
    request.body;

  // here we checking the all required prameters are there or not
  if (!(email && firstName && lastName && password && confirmPassword)) {
    response
      .status(400)
      .json({ status: "Failed", message: "All fields are required" });
  }

  if (firstName.length > 25 && lastName.length > 25) {
    response.status(400).json({
      status: "Failed",
      message: "firstname and lastname should contain only 25 letters",
    });
  }

  try {
    //Here we are checking the user already exist or not
    const currentUser = await userModel.findOne({ email: email });
    if (currentUser) {
      throw new Error("Email already exists");
    }
  } catch (error) {
    return response
      .status(400)
      .json({ status: "Failed", message: error.message });
  }

  // validating the eamil given from the user
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(400).json({
      status: "Failed",
      message: "Invalid email, Please enter a valid email",
    });
  }
  // validating the password given from the user and
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()]/.test(password);
  if (!(hasUppercase && hasLowercase && hasNumber && hasSpecialChar)) {
    return response.status(400).json({
      status: "Failed",
      message:
        "the password should be contain atleast one upercase and lowercase and number and special character",
    });
  }

  //checking the password and confirm password is same or not
  if (password !== confirmPassword) {
    return response.status(400).json({
      status: "Failed",
      message: "password and confirm password should be same",
    });
  }

  // using the try catch block to handel the errors
  try {
    const encryptedPassword = await bcyrpt.hash(password, 10);
    const currentUserDoc = new userModel({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: encryptedPassword,
    });
    const saved = await currentUserDoc.save();

    // Genrating JWT Token in registration
    const registrationToken = genratingJWT(saved);

    if (saved) {
      return response.status(201).json({
        status: "success",
        message: `${saved.firstName} you are registerd successfully`,
        Token: registrationToken,
      });
    } else {
      return response.status(400).json({
        status: "Failed",
        message: "User Not Registered",
      });
    }
  } catch (error) {
    return response.json({
      status: "Failed",
      message: "Cannot able to save the data into DB",
    });
  }
};

//@desc   login for user
//@route  POST/api/user/login
//@access public
const userLogin = async (request, response) => {
  //getting the details form the body
  const { email, password } = request.body;

  //all details are ther or not for login
  if (!(email && password)) {
    return response
      .status(400)
      .json({ status: "Failed", message: "All fields are required" });
  }
  try {
    const user = await userModel.findOne({ email }); // fetch what you want?

    if (!user) {
      return response
        .status(400)
        .json({ status: "Failed", message: "User Not Registered" });
    }

    // Genrating JWT Token in login
    const loginToken = genratingJWT(user);

    if (
      (await bcyrpt.compare(password, user.password)) && user.role === "user") {
      return response.status(200).json({
        status: "success",
        message: `${user.firstName} you logged_in as a Normal User`,
        yourTokenIs: loginToken,
      });
    } else if (
      (await bcyrpt.compare(password, user.password)) &&
      user.role === "adminUser"
    ) {
      return response.status(200).json({
        status: "success",
        message: `${user.firstName} you logged_in as a Admin User`,
        Token: loginToken,
      });
    } else {
      return response.status(400).json({
        status: "Failed",
        message: "Unautharized user",
      });
    }
  } catch (error) {
    return response.json({
      status: "Failed",
      message: "ErrorinLogin",
    });
  }
};

//@desc   getting user details and displaying it to user
//@route  POST/api/user/details
//@access protected
const getUserDetals = async (request, response) => {
  try {
    if (!request.user) {
      throw new Error("your data is not fetched");
    }
    const currentUser = request.user;
    if (currentUser.role === "user") {
      response.status(200).json({
        status: "success",
        message: "Data Fetched",
        Email: currentUser.email,
        FirstName: currentUser.firstName,
        Role: currentUser.role,
      });
    }
    if (currentUser.role === "adminUser") {
      const users = await userModel.find({}, "email firstName lastName role");
      return response.json({
        status: "success",
        message: "Data fetched",
        allUsers: users,
      });
    }
  } catch (error) {
    response.status(400).json({ status: "Failed", Message: error.message });
  }
};

//@desc   Update user Details
//@route  PUT/api/user/change/password, PUT/api/admin/user/update/user
//@access protected
const updateUserDetails = async (request, response) => {
  const user = request.user;
  if (user.role === "user") {
    //getting the some details from user
    const { oldPassword, newPassword, confirmPassword } = request.body;
    //checking all fields are there or not
    if (!(oldPassword && newPassword && confirmPassword)) {
      return response
        .status(400)
        .json({ status: "Failed", message: "All Fields are required" });
    }
    //comparing the old password is in DB or not
    if (!(await bcyrpt.compare(oldPassword, user.password))) {
      return response.status(400).json({
        status: "Failed",
        message: "You should enter correct old password",
      });
    }

    //checking confirmpassword and password is same or not
    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        status: "Failed",
        message: "password and confirmPassword should be same",
      });
    }
    //Encrypting the new password
    const encryptedPassword = await bcyrpt.hash(newPassword, 10);

    //Saving the new password into DB
    try {
      await userModel.findByIdAndUpdate(request.user._id, {
        $set: { password: encryptedPassword },
      });
      return response
        .status(200)
        .json({ status: "success", message: `your password got updated` });
    } catch (error) {
      return response
        .status(400)
        .json({ status: "Failed", message: "Error in password updating" });
    }
  }
  if (user.role === "adminUser") {
    const detailsToUpdate = request.body
    if(detailsToUpdate.password){
      const password = await bcyrpt.hash(detailsToUpdate.password, 10)
      detailsToUpdate.password = password
    }
    try{
      await userModel.findByIdAndUpdate(request.params.id, detailsToUpdate)
      response.status(200).json({status:"success", message:"Data got updated"});
    }
    catch(error){
      response.status(200).json({status:"Failed", message:"Error occured"})
    }
    
  }
};

module.exports = {
  userRegister,
  userLogin,
  updateUserDetails,
  getUserDetals,
};
