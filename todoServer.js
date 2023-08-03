const express = require('express');
var session = require('express-session')
const app = express();
const fs = require('fs');

app.set("view engine", "ejs");



// middlewares
app.use(session({
    secret: 'meinnhibatayunga',
    resave: false,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));







// routes
app.get('/todoview', function (req, res) {    //todoview
    if (!req.session.isLoggedIn) {
        res.redirect('/');
        return;
    }
    console.log('todo')
    res.render("todoIndex", {pageName: null, username :
         req.session.fullname});
         return;
});

app.post('/addtodo', function (req, res) {     //addTodo
    if (!req.session.isLoggedIn) {
        res.status(401).send("error");
        return;
    }
    req.body.email = req.session.email;
    saveTodoInFile(req.body, 'treasure.mp4', function (err) {
        if (err) {
            res.status(500).send("error");
            return;
        }
        res.status(200).send("Add Todo");
    });
});

app.post('/deleteTodo', function (req, res) {      //deleteTodo
    if (!req.session.isLoggedIn) {
        res.status(401).send("error");
        return;
    }
    let temp = {
        id: req.body.id,
        email: req.session.email
    }
    deleteTodoFromFile(temp, function (err) {
        if (err) {
            res.status(500).send("error");
            return;
        }
        res.status(200).send("Delete Todo");
    });
});

app.get('/getalltodo', function (req, res) {       // getTodoOnLoad
    if (!req.session.isLoggedIn) {
        res.status(401).send("error");
        return;
    }
    getAllTodo(function (err, data) {
        if (err) {
            res.status(500).send("error");
            console.log("error")
            return;
        }
        const initialData = {
            fullname: req.session.fullname,
            data: data[req.session.email]
        }
        console.log(initialData);
        res.status(200).send(initialData);
        return;
    });
});

app.post('/updatetodo', function (req, res) {          //updateTodo on checkbox click
    if (!req.session.isLoggedIn) {
        res.status(401).send("error");
        return;
    }
    req.body.email = req.session.email;
    updateTodo(req.body, function (err) {
        if (err) {
            res.status(500).send("error");
            console.log("Error in Updating todo");
            return;
        }
        res.status(200).send('Update Todo');
        return;
    });

});

app.get('/signup', function (req, res) {                  //signup page
    // res.sendFile(__dirname + '/todoViews/signup.html'); 
    res.render("signup", {pageName: 'signup'});
    
});

app.post('/signup', function (req, res) {                //signup add details of user
    saveTodoInFile(req.body, 'user.json', function (err, data) {
        if (err) {
            res.status(500).send({ err });
            return;
        }
        req.session.isLoggedIn = true;
        req.session.fullname = req.body.fullname;
        req.session.email = req.body.email;
        console.log("signup");
        res.status(200).send("User signup");
        return;
    });
    return;
    
});

app.get('/', function (req, res) {                 //loginPage render
    // res.sendFile(__dirname + '/todoViews/index.html');
    res.render("index", {pageName: 'login'});
});

app.post('/login', function (req, res) {                //loginpage checking credentials
    const username = req.body.username;
    const password = req.body.password;

    // user exist or not
    checkUserExistence(username, password, function (err, data) {
        if (err) {
            if (err === 'username') {
                res.status(409).send({ err: 'Username not exist' });
            }
            else if (err === 'password') {
                res.status(409).send({ err: 'Wrong password' });
            }
            else {
                console.log(err);
            }
            return;
        }
        req.session.isLoggedIn = true;
        req.session.fullname = data.fullname;
        req.session.email = data.email;
        res.status(200).send('login');
        return;
    });
});

app.get('/logout', function (req, res) {                // logout function
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(400).send('Unable to log out');
                return;
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.end();
    }
})


app.get('/conversion', function (req, res) {                //extra functionality function
    res.sendFile(__dirname + '/todoViews/conversion.html');
});

app.get('/style.css', function (req, res) {                 //style.css
    res.sendFile(__dirname + '/todoViews/style.css');
});

app.get('/todoScript.js', function (req, res) {             //script.js
    res.sendFile(__dirname + '/todoViews/scripts/todoScript.js')
});

app.get('/delete.png', function (req, res) {                //deleteimage request
    res.sendFile(__dirname + '/todoViews/images/delete.png')
});


// server running
app.listen(3000, () => {
    console.log('Server running at port 3000');
})











// all functions 


// functions for save todo in file
function readAllTodos(file, callback) {
    fs.readFile(file, "utf-8", function (err, data) {
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

function saveTodoInFile(inputData, file, callback) {
    readAllTodos(file, function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        if (file === 'treasure.mp4') {
            const saveData = {
                id: inputData.id,
                todoText: inputData.todoText,
                checkbox: inputData.checkbox,
                priority: inputData.priority
            };
            let tempObj = { ...data[inputData.email] };
            tempObj[inputData.id] = saveData;
            data[inputData.email] = tempObj;
        }
        else if (file === 'user.json') {
            if (Object.keys(data).includes(inputData.email)) {
                callback('User Already Exist');
                return;
            }

            data[inputData.email] = inputData;
            callback(null);
        }
        fs.writeFile(file, JSON.stringify(data), function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, inputData.fullname);
        });
    });
}


// function for delete tofo from file and save 
function deleteTodoFromFile(obj, callback) {
    readTodoAndDelete(function (err, data) {
        if (err) {
            callback(err);
            return;
        }

        delete data[obj.email][obj.id];
        fs.writeFile('./treasure.mp4', JSON.stringify(data), function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null);
        });
    });
}
function readTodoAndDelete(callback) {
    fs.readFile('treasure.mp4', 'utf-8', function (err, data) {
        if (err) {
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
function getAllTodo(callback) {
    fs.readFile('./treasure.mp4', 'utf-8', function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        if (data.length === 0) {
            data = '{}';
        }
        try {
            data = JSON.parse(data);
            // console.log(data);
            callback(null, data);
        } catch (err) {
            callback(err);
            return;
        }
    })
}


// update Todod function
function updateTodo(obj, callback) {
    readTodoAndDelete(function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        data[obj.email][obj.id].checkbox = !data[obj.email][obj.id].checkbox;
        fs.writeFile('./treasure.mp4', JSON.stringify(data), function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null);
        });
    });
}
function readTodoAndDelete(callback) {
    fs.readFile('treasure.mp4', 'utf-8', function (err, data) {
        if (err) {
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


// check user existnce function
function checkUserExistence(username, password, callback) {
    fs.readFile('./user.json', 'utf-8', function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        if (data.length === 0) {
            callback('username');
            return;
        }
        try {
            data = JSON.parse(data);
            if (Object.keys(data).includes(username)) {
                let userData = data[username];
                if (userData.password === password) {
                    callback(null, { fullname: userData.fullname, email: userData.email });
                    return;
                }
                callback('password');
            }
            callback('username');
        } catch (err) {
            callback(err);
            return;
        }
    })
}