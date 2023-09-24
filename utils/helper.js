//all imports to hash passwords and to store
const bcyrpt = require("bcrypt");
const userModel = require("../models/userDetails");

const helperhashed = async (users) => {
console.log(users);
    try{
        let i = 0
        while(i<users.length){
            encryptedPassword = await bcyrpt.hash(users[i].password, 10)
            users[i].password = encryptedPassword
            i++
        }
        if(!(users)){
            throw new Error("Data required")
        }
        const insertingUsers = await userModel.insertMany(users)
        console.log(insertingUsers);
        const responsemesage = {}
        responsemesage.message = "Users registered";
        responsemesage.status = 200;
        return responsemesage

    }catch(error){
        return error
    } 

}

module.exports = {helperhashed}