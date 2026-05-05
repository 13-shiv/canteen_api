const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken= (user) =>{
    return jwt.sign(
        {
            id : user.id,
            email: user.email,
            role : user.role,
        },
        process.env.JWT_SECRET || 'canteen_mgnt_1234',  
        {expiresIn : '7d'}
    )
}

exports.register= async (req, res)=>{
    try{
        const {name, email, role, password } = req.body;

        const existingUser = await User.findOne({where:{email}})
        if(existingUser){
           return res.status(400).json({
                sucess:false,
                message :"User Already Exist"
                
            })
        }
        // If Not create a user 
        const user = await User.create({name, email, role, password })
        const token = generateToken(user);
           return res.status(201).json({
            sucess : true,
            message : "User Registered Successfully",
            data:{ user, token}
           })
        }catch(error){
          return res.status(500).json({
                sucess:false,
                message :error.message
            })
        }
}

exports.login = async(req,res)=>{
    try{
        const {email, password} = req.body;
        const user = await User.findOne({where:{email}});
        if(!user){
            return res.status(404).json({
                sucess:false,
                message :"User Not Found"
            })
        }
        const isMatch =await user.comparePassword(password);
        if(!isMatch){
            return res.status(400).json({
                sucess:false,
                message :"Invalid Credentials"
            })
        }
        const token = generateToken(user);
         return res.status(200).json({
            sucess:true,
            message :"Login Successfully",
            token : token,
            data:{ user, token}
        })
    }catch(error){
        return res.status(500).json({
            sucess:false,
            message :error.message
        })
    }
}

exports.profile = async(req,res)=>{

    try{
        const user = await User.findByPk(req.user.id);
        if(!user){
            return res.status(404).json({
                sucess:false,
                message :"User Not Found"
            })
        }
        return res.status(200).json({
            sucess:true,
            message :"User Profile",
            data:{ user}
        })
    }catch(error){
     return res.status(500).json({

            sucess:false,
            message :error.message
        })
    }
}

