const mongoose = require("mongoose") //importing the moongoose for connection


function connectDB(DB_connection_uri){       //this function connects with the Databse
    mongoose.connect(DB_connection_uri).then(
        console.log("DBconnection is sucessful")
    )
    .catch((error)=>{         // this block will catch the error
        console.log(`The error is occuring in DBconnection`) 
        console.log(`error is - ${error}`)
    })
}

module.exports = {connectDB}