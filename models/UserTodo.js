const mongoose = require('mongoose');

const userTodoSchema =new mongoose.Schema(
    {
        email: String,
        todoData: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Data',
        }],
    }
)

const UserTodo = mongoose.model("UserTodo", userTodoSchema);
module.exports = UserTodo;