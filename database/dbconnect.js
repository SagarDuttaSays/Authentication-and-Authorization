const mongoose = require('mongoose')
require('dotenv').config()
mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log('connected to databases');
}).catch((err)=>{
    console.log("error connecting to db "+ err)
})