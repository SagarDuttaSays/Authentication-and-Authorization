const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()
PORT = 8000;

//database connection and database model
require('./database/connection')
const userDb = require('./models/userSchema');

const app = express();

//in-built middleware
app.use(cors())
app.use(bodyParser.json())

//user defined middleware
async function authenticateToken (req, res, next){
    //Extrating token from header
    const token = req.header('Authorization').split(' ')[1];
    //extracting _id from body
    const {id} = req.body;
    if(!token) return res.status(401).json({message:"Auth Error"});
    try{
        //extracting payload part from the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(id && id!==decoded.id){
            return res.status(401).json({message:"Auth0 error"})            
        }
        next(); 
    } catch(err) {
        res.status(500).json({message:`Invalid token ${err}`})
    }

}
//routes
app.post('/getMyProfile', authenticateToken, async (req, res)=>{
        const { _id } = req.body;
        const user = await userDb.findOne({_id});
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
})
app.get('/', async (req, res)=>{
    const allUsers = await userDb.find();
    res.json(allUsers);
})
app.post('/login', async (req, res)=>{
    try{
        const {email, password} = req.body;
        //check whether email exists or not
        const userExists = await userDb.findOne({email});
        if(!userExists){
            return res.status(401).json({message:"User does not exist"})
        }
        //check if the password entered is valid
        const isPasswordValid = await bcryptjs.compare(password, userExists.password);
        if(!isPasswordValid){
            return res.status(401).json({message:"Password do not match"})
        }
        //creating a token for the current user
        const token = jwt.sign({_id:userExists._id}, process.env.JWT_SECRET_KEY, {expiresIn:'1h'});  
        res.json({token:token, message:"User logged in successfully"}) 
    } catch(err){
        res.status(500).json({message:err.message})
    }
})
app.post('/register', async (req, res)=>{
    try{
        const {name, email, password} = req.body;
        const userExists = await userDb.findOne({email});
        
        if(userExists){
            console.log('name = ',userExists.name)
            return res.status(409).json({message: "User already exists"})
        }
        //securing password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt)
        //creating document for the new user
        const newUser = new userDb({name, email, password:hashedPassword});
        const newUserSaved = await newUser.save();
        res.json({
        message:"user registered successfully", 
        newUser: newUserSaved 
    })
    } catch(err){
        res.status(500).json({message: err.message})
    }
})

//server
app.listen(PORT, ()=>console.log(`servering on port ${PORT}`))
