
const submitTodoNode = document.getElementById('submitTodo');
const userInputNode = document.getElementById('userInput');
const todoListNode = document.getElementById('todoList');
const prioritySelect = document.getElementById('prioritySelect');
let numberOfTodos = 0;
const username = document.getElementById('username');
const password = document.getElementById('password');
const profileName = document.getElementById('profileName');


// submit todo
submitTodoNode.addEventListener('click', function () {

    const todoText = userInputNode.value;

    if (!todoText) {
        alert("Please enter a todo");
        return;
    }
    // todoList = [...todoList, todoText];
    numberOfTodos += 1;
    const todo = {
        id: 'server' + numberOfTodos,
        todoText,
        checkbox: false,
        priority: prioritySelect.value,
    }

    fetch("/addtodo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
    }).then(function (response) {
        if (response.status === 200) {
            showTodoInUI(todo);
        }
        else if (response.status === 401) {
            alert('Please Login First');
            window.location.href = "/";
        }
        else {
            alert('Something weird happened')
        }
    }).catch(function (error) {
        console.log("Error in fetching response ", error);
    })
})

function showTodoInUI(todo) {
    const todoTextNode = document.createElement('div');
    todoTextNode.setAttribute("class", "todo");
    todoTextNode.setAttribute("id", numberOfTodos);

    const name = 'todo' + numberOfTodos;
    const todoNode = `
                        <div class='textTodo'>
                            <input type="checkbox" name=${name} id=${name}>
                            <label for=${name}>${todo.todoText}</label>
                        </div>
                    `
    todoTextNode.innerHTML = todoNode;
    const btn = document.createElement('img');
    btn.src = './delete.png';
    btn.alt = 'deleteIcon';
    btn.id = 'server' + numberOfTodos;
    btn.addEventListener('click', deleteTodoNode);
    todoTextNode.appendChild(btn);

    switch (prioritySelect.value) {
        case 'low':
            todoTextNode.style.border = "2px solid green";
            break;
        case 'medium':
            todoTextNode.style.border = '2px solid orange';
            break;
        case 'high':
            todoTextNode.style.border = '2px solid red';
            break;
        default:
            break;
    }
    // console.log(prioritySelect.value);
    todoListNode.appendChild(todoTextNode);
    const inputCheckbox = document.getElementById(name);
    inputCheckbox.addEventListener('click', updateCheckbox);
    const element = document.getElementById("todoList");
    element.scrollTop = element.scrollHeight;
    userInputNode.value = '';
}



// delete function
function deleteTodoNode() {
    if (!this) {
        alert("Node not Present");
        return;
    }
    const idd = {
        id: this.id,
    }

    fetch('/deleteTodo', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(idd),
    }).then(function (response) {
        if (response.status === 200) {
            deleteFromUI(idd);
        }
        else if (response.status === 401) {
            alert('Please Login First');
            window.location.href = "/";
        }
        else {
            alert('Something weird happened')
        }
    }).catch(function (err) {
        console.log('Error in deleting Node ', err);
    })
}

function deleteFromUI(idd) {
    let elementId = idd.id;
    elementId = elementId.charAt(elementId.length - 1);
    const element = document.getElementById(elementId);
    element.remove();
}




// on window load fetching all stored data
window.onload = function getAllTodo() {
    fetch("/getalltodo")
        .then(function (response) {
            if (response.status === 200) {
                return response.json();
            }
            else if (response.status === 401) {
                alert('Please Login First');
                window.location.href = "/";
                return;
            }
            else {
                alert('Something weird happened');
                return
            }
        }).then((json) => {
            showTodoOnRefresh(json.data);
        }).catch(function (error) {
            console.log("Error in fetching response ", error);
        })
};

function showTodoOnRefresh(data) {
    Object.values(data).map((ele) => {
        const todoTextNode = document.createElement('div');
        todoTextNode.setAttribute("class", "todo");
        let index = (ele.id).charAt((ele.id).length - 1);
        numberOfTodos = Number(index);
        todoTextNode.setAttribute("id", index);

        const name = 'todo' + index;
        const todoNode = `
                        <div class='textTodo'>
                            <input type="checkbox" name=${name} id=${name}>
                            <label for=${name}>${ele.todoText}</label>
                        </div>
                    `
        todoTextNode.innerHTML = todoNode;
        const btn = document.createElement('img');
        btn.src = './delete.png';
        btn.alt = 'deleteIcon';
        btn.id = 'server' + index;
        btn.addEventListener('click', deleteTodoNode);
        todoTextNode.appendChild(btn);


        switch (ele.priority) {
            case 'low':
                todoTextNode.style.border = "2px solid green";
                break;
            case 'medium':
                todoTextNode.style.border = '2px solid orange';
                break;
            case 'high':
                todoTextNode.style.border = '2px solid red';
                break;
            default:
                break;
        }
        todoListNode.appendChild(todoTextNode);
        const inputCheckbox = document.getElementById(name);
        if (ele.checkbox) {
            inputCheckbox.checked = true;
        }
        inputCheckbox.addEventListener('click', updateCheckbox);
    })

}


// update todo function
function updateCheckbox() {
    const checkboxID = this.id;
    const makingServerId = 'server' + (this.id).charAt((this.id).length - 1);

    const sendTodoData = {
        id: makingServerId,
    }

    fetch("/updatetodo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(sendTodoData),
    }).then(function (response) {
        if (response.status === 200) {
            alert('Successfully Updated Toddo');
        }   
        else if (response.status === 401) {
            alert('Please Login First');
            window.location.href = "/";
        }
        else {
            alert('Something weird happened')
        }
    }).catch(function (error) {
        console.log("Error in fetching response ", error);
    })
}

// signup function
function signupUser() {
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const mobile = document.getElementById('mobile').value;

    const signupData =
    {
        fullname,
        email,
        password,
        mobile
    }

    fetch("/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
    }).then(function (response) {
        console.log("client")
        if (response.status === 200) {
            window.location.href = ('/');
            return;
        }
        else if(response.status === 500){
            response.json().then(json => alert(json.err));
        }
        else {
            alert('Something weird happened');
        }
    }).catch(function (error) {
        console.log("Error in fetching response ", error);
    })
}

// login function
function loginUser() {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('passwordLogin').value;

    const loginData =
    {
        username,
        password
    }
    console.log(loginData);

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
    }).then(function (response) {
        if (response.status === 200) {
            window.location.href = ('/todoview');
            return;
        }
        else if (response.status === 409) {
            response.json().then(json => alert(json.err));
        }
        else {
            alert('Something weird happened');
        }
    }).catch(function (error) {
        console.log("Error in fetching response ", error);
    })
}