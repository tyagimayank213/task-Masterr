const mongoose = require('mongoose')

module.exports.init = async function(){
    await mongoose.connect(
       "mongodb+srv://tyagimayank213:heavy3214@cluster0.r69kpve.mongodb.net/superCoderTodo?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
}   