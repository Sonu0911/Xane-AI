const express = require('express');
const mongoose = require("mongoose")
const router = express.Router();
const UserModel = require("../model/user.js")
const UserController = require("../controller/userController")

router.post("/register", UserController.createUser)
router.post("/login", UserController.loginUser)
router.get("/user/:userId", UserController.getUser)
router.put("/user/:userId", UserController.updateUser)
router.delete("/user/:userId", UserController.userDeleted)




module.exports = router;