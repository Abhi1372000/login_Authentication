const express = require("express"); // importing express
const app = express(); // assiginig all the express function to app
const dotenv = require("dotenv"); // importing the dotenv
dotenv.config(); //this is the configraton of dotenv file
const cors = require("cors");
const PORT = process.env.PORT;
const DB_URI = process.env.DB_CONNECTION_URI; //this is the connection string comming from .env
require("./config/dbConnection").connectDB(DB_URI); // here we connecting the with the DB
app.use(cors({ origin: "*", methods: "POST" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// this is the listening at the given port
app.listen(PORT, () => {
  console.log(`server is listening at localhost:${PORT}`);
});
