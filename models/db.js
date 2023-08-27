const mongoose = require('mongoose')

module.exports.init = async function(){
    await mongoose.connect(
       "mongodb+srv://tyagimayank213:<password>@cluster0.r69kpve.mongodb.net/superCoderTodo?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
}   