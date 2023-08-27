const express = require('express');
var session = require('express-session')
const app = express();
const fs = require('fs');

app.set("view engine", "ejs");
const db = require('./models/db')
const UserModel = require('./models/User')
const DataModel = require('./models/Data')
const UserTodoModel = require('./models/UserTodo');
const { ObjectId } = require('mongodb');
const Data = require('./models/Data');



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
    res.render("todoIndex", {
        pageName: null, username:
            req.session.fullname
    });
    return;

});

app.post('/addtodo', async function (req, res) {     //addTodo
    if (!req.session.isLoggedIn) {
        res.status(401).send("error");
        return;
    }
    try {
        const data = await DataModel.create(req.body);

        const user = await UserTodoModel.findOne({ email: req.session.email });
        if (user) {
            await UserTodoModel.findOneAndUpdate({ email: req.session.email },
                { $push: { todoData: data._id } })
        }
        else {
            const userData = {
                email: req.session.email,
                todoData: [data._id],
            }
            await UserTodoModel.create(userData);
        }
        return res.status(200).send({ id: data._id });
    }
    catch (err) {
        console.log(err);
    }

    // saveTodoInFile(req.body, 'treasure.mp4', function (err) {
    // req.body.email = req.session.email;
    //     if (err) {
    //         res.status(500).send("error");
    //         return;
    //     }
    //     res.status(200).send({ id: data._id });
    // });
});

app.post('/deleteTodo', async function (req, res) {      //deleteTodo
    if (!req.session.isLoggedIn) {
        res.status(401).send("error");
        return;
    }
    try {
        await Data.findByIdAndDelete(req.body.id);
        await UserTodoModel.findOneAndUpdate({ email: req.session.email },
            { $pull: { todoData: req.body.id } }
        );
        return res.status(200).send("Delete Todo");
    }
    catch (err) {
        return res.status(500).send("error");
    }



    // let temp = {
    //     id: req.body.id,
    //     email: req.session.email
    // }
    // deleteTodoFromFile(temp, function (err) {
    //     if (err) {
    //         res.status(500).send("error");
    //         return;
    //     }
    //     res.status(200).send("Delete Todo");
    // });
});

app.get('/getalltodo', async function (req, res) {       // getTodoOnLoad
    if (!req.session.isLoggedIn) {
        res.status(401).send("error");
        return;
    }
    try{
        const userData = await UserTodoModel.findOne({ email: req.session.email }).populate('todoData')
        if (userData){
            const initMongoData = userData.todoData || [];
            return res.status(200).send({ data: initMongoData });
        }
        else{
            return res.status(200).send({ data: [] });
        }
    }
    catch(err){
        res.status(500).send("error");
    }

    // getAllTodo(function (err, data) {
    //     if (err) {
    //         res.status(500).send("error");
    //         console.log("error");
    //         return;
    //     }
    //     const initialData = {
    //         fullname: req.session.fullname,
    //         data: data[req.session.email]
    //     }
// return res.status(200).send({ data: initMongoData });
    //     
    //     return;
    // });
});

app.post('/updatetodo', async function (req, res) {          //updateTodo on checkbox click
    if (!req.session.isLoggedIn) {
        res.status(401).send("error");
        return;
    }
    try {
        await DataModel.findOneAndUpdate({ _id: req.body.id },
            { $set: { checkbox: req.body.value } }
        );
        return res.status(200).send('Update Todo');
    }
    catch (err) {
        console.log(err);
    }

    // updateTodo(req.body, function (err) {
    // req.body.email = req.session.email;
    //     if (err) {
    //         res.status(500).send("error");
    //         console.log("Error in Updating todo");
    //         return;
    //     }
    //     res.status(200).send('Update Todo');
    //     return;
    // });

});

app.get('/signup', function (req, res) {                  //signup page
    // res.sendFile(__dirname + '/todoViews/signup.html'); 
    res.render("signup", { pageName: 'signup' });
});

app.post('/signup', function (req, res) {                //signup add details of user

    const user = {
        fullname: req.body.fullname,
        email: req.body.email,
        password: req.body.password,
        mobile: req.body.mobile,
    };
    UserModel.create(user)
        .then(function () {
            res.status(200).send({ success: "User signup", status: 200 });
        })
        .catch(function (error) {
            if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
                res.status(500).send({ err: 'Email already exists', status: 401 });
            } else {
                res.send({ err: 'Error user cannot save', status: 402 })
            }
        })


    // saveTodoInFile(req.body, 'user.json', function (err, data) {
    //     if (err) {
    //         return res.status(500).send({ err });

    //     }
    //     req.session.isLoggedIn = true;
    //     req.session.fullname = req.body.fullname;
    //     req.session.email = req.body.email;
    //     console.log("signup");
    //     // res.setHeader('X-Foo', 'bar');
    //     return res.status(200).send({success: "User signup"});
    //     // return;
    // });
    return;

});

app.get('/', function (req, res) {                 //loginPage render
    // res.sendFile(__dirname + '/todoViews/index.html');
    res.render("index", { pageName: 'login' });
});

app.post('/login', async function (req, res) {                //loginpage checking credentials
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(409).send({ err: 'Username not exist' });
        }
        if (user.password !== password) {
            return res.status(409).send({ err: 'Wrong password' });
        }
        req.session.isLoggedIn = true;
        req.session.fullname = user.fullname;
        req.session.email = user.email;
        res.status(200).send();
        return;

    } catch (err) {
        console.log(err);
    }



    // user exist or not
    // checkUserExistence(username, password, function (err, data) {
    //     if (err) {
    //         if (err === 'username') {
    //             res.status(409).send({ err: 'Username not exist' });
    //         }
    //         else if (err === 'password') {
    //             res.status(409).send({ err: 'Wrong password' });
    //         }
    //         else {
    //             console.log(err);
    //         }
    //         return;
    //     }
    //     req.session.isLoggedIn = true;
    //     req.session.fullname = data.fullname;
    //     req.session.email = data.email;
    //     res.status(200).send('login');
    //     return;
    // });
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

db.init().then(function () {
    console.log('DB Connected');
    app.listen(3000, () => {
        console.log('Server running at port 3000');
    })
}).catch(function (err) {
    console.log(err);
});












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
        }
        fs.writeFile(file, JSON.stringify(data), function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, inputData.fullname);
            return;
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