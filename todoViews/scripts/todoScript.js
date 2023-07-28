const submitTodoNode = document.getElementById('submitTodo');
const userInputNode = document.getElementById('userInput');
const todoListNode = document.getElementById('todoList');
const prioritySelect = document.getElementById('prioritySelect');
let numberOfTodos = 0;

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

    fetch("/todo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
    }).then(function (response) {
        if (response.status === 200) {
            showTodoInUI(todo);
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
    numberOfTodos -= 1;
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
    // console.log('hello function');
    fetch("/getalltodo")
        .then(function (response) {
            if (response.status === 200) {
                // showTodoOnRefresh(response.data);
                return response.json();
            }
        }).then((json) => {
            // console.log(json);
            showTodoOnRefresh(json);
        }).catch(function (error) {
            console.log("Error in fetching response ", error);
        })
};



// getAllTodo();

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

function updateCheckbox(){
    const checkboxID = this.id;
    const makingServerId = 'server' + (this.id).charAt((this.id).length -1);

    const sendTodoData = {
        id:makingServerId,
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
    }).catch(function (error) {
        console.log("Error in fetching response ", error);
    })
}