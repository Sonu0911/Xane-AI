const UserModel = require("../model/user")
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const createUser = async function(req, res) {
    try {
        let data = req.body
        if (Object.keys(data) == 0) return res.status(400).send({ status: false, msg: "No input provided" })

        const { fname, lname, phone, email, password } = data

        if (!fname) {
            return res.status(400).send({ status: false, msg: "fname is required" })
        }

        if (!lname) {
            return res.status(400).send({ status: false, msg: "lname is required" })
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).send({ status: false, msg: "valid phone number is required" })
        }

        if (!/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, msg: "valid email is required" })
        }

        if (!password) {
            return res.status(400).send({ status: false, msg: "Plz enter valid password" })
        }
        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, msg: "passowrd min length is 8 and max len is 15" })
        }
    

        let dupliPhone = await UserModel.find({ phone: phone })
        if (dupliPhone.length > 0) {
            return res.status(400).send({ status: false, msg: "phone number already exits" })
        }

        let dupliEmail = await UserModel.find({ email: email })
        if (dupliEmail.length > 0) {
            return res.status(400).send({ status: false, msg: "email is already exists" })
        }


        let savedData = await UserModel.create(data)
        return res.status(201).send({
            status: true,
            msg: "user created successfully",
            data: savedData
        })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}


const loginUser = async function(req, res) {
    try {
        let user = req.body

        const {userName, password} = user
        
        if (Object.keys(user) == 0) {
            return res.status(400).send({ status: false, msg: "please provide data" })
        }

        if (!userName) return res.status(400).send({ status: false, msg: "userName is required" }) 

      //  if(!userName) return res.status(400).send({status: false, "msg":"user name not found"})

        if (!password) {
            return res.status(400).send({ status: false, msg: "password is required" })
        }

        let userDetailsFind = await UserModel.findOne({ email: userName, password: password })
        if (!userDetailsFind) {
            return res.status(400).send({ status: false, msg: "userName or password is not correct" })
        };

        let token = jwt.sign({
            userId: userDetailsFind._id,
           
        }, "rushi-159");

        res.status(200).send({
            status: true,
            msg: "user login successfully",
            data: token
        })
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }

}



const getUser = async function(req, res) {
    try {
        let userId = req.params.userId.trim()

        if (!isValidObjectId(userId)) {
            return res.status(400).send({
                status: false,
                msg: "path param is invalid"
            })
        }

        const findUser = await UserModel.findOne({ _id: userId, isDeleted: false })
        if (!findUser) {
            return res.status(404).send({
                status: false,
                msg: "could not found"
            })
        }

        return res.status(200).send({
            status: true,
            msg: "user found",
            data: findUser
        })


    } catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}

const updateUser = async function(req, res) {
    try {
        userId = req.params.userId

        if (Object.keys(userId).length == 0) {
            return res.status(400).send({ status: false, msg: "please provide input" })
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "please provide a valid userId" })
        }

        const userAvailable = await UserModel.findOne({ _id: userId, isDeleted: false })
        if (!userAvailable) {
            return res.status(400).send({ status: false, msg: "no user found" })
        }

        let obj = {}
        data = req.body
        const { fname,lname,phone, email, password} = data

        if (fname) {
            if (!(fname)) {
                return res.status.send({ status: false, msg: "enter valid Id" })
            }
          
            obj.fname = fname.trim()
        }


        if (lname) {
            if (!(lname)) {
                return res.status(400).send({ status: false, msg: "enter valid lname " })
            }
            obj.lname = lname.trim()
        }

        if (phone) {
            if (!(phone)) {
                return res.status(400).send({ status: false, msg: "enter valid phone" })
            }
            obj.phone = phone
        }

        if (email) {
            if (!(email)) {
                return res.status(400).send({ status: false, msg: "enter valid email" })
            }
            obj.email = email.trim()
            
        }if (password) {
            if (!(password)) {
                return res.status(400).send({ status: false, msg: "enter valid password" })
            }
            obj.password = password.trim()
        }

        const updatedUser = await UserModel.findByIdAndUpdate({ _id: userId }, { $set: obj }, { new: true })

        return res.status(200).send({ status: true, msg: "Updated user", data: updatedUser })


    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const userDeleted = async function(req, res) {
    try {
        let userId = req.params.userId.trim()

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "Invalid userId" })
        }

        const userFind = await UserModel.findOne({ _id: userId, isDeleted: false })
        if (!userFind) {
            return res.status(404).send({ status: false, msg: "userId is already deleted" })
        }

        const userDeleted = await UserModel.findOneAndUpdate({ _id: userId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })
        return res.status(200).send({ status: true, msg: "user is deleted", data: userDeleted })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}


module.exports.createUser = createUser
module.exports.loginUser = loginUser
module.exports.getUser=getUser
module.exports.updateUser=updateUser
module.exports.userDeleted=userDeleted