const { model } = require("mongoose");
const { response } = require("express");
const bcyrpt = require("bcrypt");
const xlsx = require("xlsx")
//models
const userModel = require("../models/userDetails");
//helpers
const {helperhashed} = require('../utils/helper');
const secretKey = process.env.JWT_SECRET_KEY;



//@desc     Admin to insert multiple users at time
//@route    POST/api/admin/user/register/users
//@access   protected
const RegisterUsers = async (request, response) => {
    const users = request.body
    try{
        const data = await helperhashed(users)
        console.log(data);
        if(data){
            return response.status(200).json({status:data.status, message: data.message})
        }
        else{
            return response.status(400).json({status:"Failed", message:"Users not Registred"})
        }
    }
    catch(error){
        return response.status(200).json({status:"Failed", message:error.message})
    }
    
}




//@desc     Admin to insert xls file of users to register
//@route    POST/api/admin/user/register/xls/users
//@access   protected
const registerXls = async (request,response)=>{
    console.log("this upload xls")
    
    // Load the workbook using xlsx
    const filePath = request.file.path; 
     // Load the workbook using xlsx
    const workbook = xlsx.readFile(filePath);

    // Assuming the first sheet is the one you want to read
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Convert the sheet data to JSON format
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    try{
        const data = await helperhashed(jsonData)
        console.log(data);
        if(data){
            return response.status(200).json({status:data.status, message: data.message})
        }
        else{
            return response.status(400).json({status:"Failed", message:"Users not Registred"})
        }
    }
    catch(error){
        return response.status(200).json({status:"Failed", message:error.message})
    }
}








//@desc     Deleting the user
//@route    DELETE/api/admin/user/delete/user
//@access   protected
const deleteUser = async (request, response) => {
    try{
        const user = await userModel.findById(request.params.id)
        user.deleteOne()
        return response.status(200).json({status:"success", message: "user is successfully deleted"})
    }
    catch(error){
        return response.status(405).json({status:"Failed", message:"Not able to delete the user"})
    }
};

module.exports = {
  deleteUser,
  RegisterUsers,
  registerXls
};
