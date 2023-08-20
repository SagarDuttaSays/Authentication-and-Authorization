const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    name:String,
    age:{type:Number, min:18},
    email:{type:String, required:true, unique:true},
    password:String,
    loginDate: {type:Date, default:Date.now}
})
const model = mongoose.model("details", schema);
module.exports = model;