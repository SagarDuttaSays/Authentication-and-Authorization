const mongoose = require('mongoose')
require('dotenv').config()
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log('databases connected'))
.catch(()=>console.log('failed to connect with the database', err));

