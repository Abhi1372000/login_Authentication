// here we importing the functions from userController onnecting with the api end points
const express = require("express")
const router = express.Router()
  const multer = require("multer")

  const storage  = multer.diskStorage({
    destination: function(requset, file, cb){
      return cb(null, "./uploads")
    },
    filename:function(requset, file, cb){
      return cb(null, `${Date.now()}-${file.originalname}`)
    }
  })

  const upload = multer({storage:storage})

const { checkAdminAuth, } = require("../middleware/authMiddleware")

const { 
    deleteUser,
    registerXls,
    RegisterUsers } = require("../controllers/adminController") 

    const {
        getUserDetals,
        userRegister,
        updateUserDetails
      } = require("../controllers/userController");


//PROTECTED APIs
router.post("/user/create/user", checkAdminAuth, userRegister)
router.post("/user/register/users", checkAdminAuth, RegisterUsers)
router.post("/user/register/xls/users", upload.single("choose file"), registerXls)
router.get("/user/get/allusers", checkAdminAuth, getUserDetals)
router.put("/user/update/user/:id", checkAdminAuth, updateUserDetails)
router.delete("/user/delete/user/:id", checkAdminAuth, deleteUser)






 module.exports = router