const express = require('express');
const app = express();
const fs = require('fs');

app.use(express.json());

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/todoViews/index.html');
});
app.post('/todo', function (req, res) {
    saveTodoInFile(req.body, function(err){
        if(err){
            res.status(500).send("error");
            return;
        }
        res.status(200).send("Add Todo");
    });
});
app.post('/deleteTodo', function (req, res) {
    deleteTodoFromFile(req.body.id, function(err){
        if(err){
            res.status(500).send("error");
            return;
        }
        res.status(200).send("Delete Todo");
    });
});
app.get('/getalltodo', function (req, res) { 
    // const dataReturn=null;
    console.log('enter');
    getAllTodo(function(err, data){
        if(err){
            res.status(500).send("error");
            console.log("error")
            return;
        }
        res.status(200).send(data);
        return;
    });
    
});
app.post('/updatetodo', function (req, res) { 
    updateTodo(req.body.id, function(err){
        if(err){
            res.status(500).send("error");
            console.log("Error in Updating todo");
            return;
        }
        res.status(200).send('Update Todo');
        return;
    });
    
});


app.get('/conversion', function (req, res) {
    res.sendFile(__dirname + '/todoViews/conversion.html');
});
app.get('/style.css', function (req, res) {
    res.sendFile(__dirname + '/todoViews/style.css');
});
app.get('/todoScript.js', function (req, res) {
    res.sendFile(__dirname + '/todoViews/scripts/todoScript.js')
});
app.get('/delete.png', function (req, res) {
    res.sendFile(__dirname + '/todoViews/images/delete.png')
});


app.listen(3000, () => {
    console.log('Server running at port 3000');
})


// functions for save todo in file
function readAllTodos(callback) {
    fs.readFile('./treasure.mp4', "utf-8", function (err, data) {
        if (err) {
            callback(err);
            return;
        }

        if (data.length === 0) {
            data = "{}";
        }

        try {
            data = JSON.parse(data);
            callback(null, data);
        } catch (err) {
            callback(err);
            return;
        }
    });
}

function saveTodoInFile(todo, callback) {
    readAllTodos(function (err, data) {
        if (err) {
            callback(err);
            return;
        }

        data[todo.id] = todo;
        fs.writeFile("./treasure.mp4", JSON.stringify(data), function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null);
        });

    });
    
}




// function for delete tofo from file and save 
function deleteTodoFromFile(id, callback){
    readTodoAndDelete(function(err, data){
        if(err){
            callback(err);
            return;
        }

        delete data[id];
        fs.writeFile('./treasure.mp4', JSON.stringify(data), function(err){
            if(err){
                callback(err);
                return;
            }
            callback(null);
        });
    });
}
function readTodoAndDelete(callback){
    fs.readFile('treasure.mp4', 'utf-8', function(err, data){
        if(err){
            callback(err);
            return;
        }
        if (data.length === 0) {
            callback('File is empty');
            return;
        }

        try {
            data = JSON.parse(data);
            callback(null, data);
        } catch (err) {
            callback(err);
            return;
        }

    });
}
 

// function for getting all Todo
function getAllTodo(callback){
    fs.readFile('./treasure.mp4', 'utf-8', function(err, data){
        if(err){
            callback(err);
            return;
        }
        if(data.length === 0){
            data= '{}';
        }
        try {
            data = JSON.parse(data);
            // console.log(data);
            callback(null, data);
        }catch (err) {
            callback(err);
            return;
        }
    })
}



// update Todod function
function updateTodo(id, callback){
    readTodoAndDelete(function(err, data){
        if(err){
            callback(err);
            return;
        }

        data[id].checkbox = !data[id].checkbox;
        fs.writeFile('./treasure.mp4', JSON.stringify(data), function(err){
            if(err){
                callback(err);
                return;
            }
            callback(null);
        });
    });
}
function readTodoAndDelete(callback){
    fs.readFile('treasure.mp4', 'utf-8', function(err, data){
        if(err){
            callback(err);
            return;
        }
        if (data.length === 0) {
            callback('File is empty');
            return;
        }

        try {
            data = JSON.parse(data);
            callback(null, data);
        } catch (err) {
            callback(err);
            return;
        }

    });
}