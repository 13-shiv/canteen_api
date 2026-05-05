const jwt = require('jsonwebtoken');
const User = require('../models/User');
 
exports.authenticate =async (req,res,next )=>{
    try{
        const authHeader = req.headers.authorization;
        console.log("authHeader", authHeader);
        if(!authHeader || !authHeader.startsWith('Bearer')){
            return res.status(401).json({
                sucess:false,
                message :"Do login First"
            })
 }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token , process.env.JWT_SECRET || 'canteen_mgnt_1234'); //   process.env.JWT_SECRET =canteen_secret_123
        
        const user = await User.findByPk(decoded.id);
        if(!user){

           return res.status(401).json({
                sucess:false,
                message :"Invalid Token"
            })
        }
        req.user = user;
        next();
        
    }catch(error){
       return res.status(500).json({
            sucess:false,
            message :"Internal Server Error"
        })
    }
}

exports.authorize =(roles)=>(req,res,next)=>{
    if(!roles.includes(req.user.role)){
        return res.status(403).json({
            sucess:false,
           message: `You are not authorized... required role: ${roles.join(', ')}`
        });
    }
    next();
};