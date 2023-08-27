const mongoose = require('mongoose');

const dataSchema =new mongoose.Schema(
    {
        id:String, 
        todoText: String,
        checkbox: Boolean,
        priority: String,
    }
)

const Data = mongoose.model("Data", dataSchema);
module.exports = Data;