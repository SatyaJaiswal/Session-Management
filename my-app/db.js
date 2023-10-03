const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/sessions');

const db = mongoose.connection;
db.on('err',()=>{
    console.log("err");
});
db.once('open',()=>{
    console.log("connected");
})