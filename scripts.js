let allTasks = [];
let valueInput = "";
let input = null;
let activeEditTask = { index: null, text: null };

window.onload = init = async () => {
  input = document.getElementById("add-task");
  input.addEventListener("change", updateValue);
  const response = await fetch("http://localhost:3000/allTasks", {
    method: "GET",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
  const result = await response.json();
  allTasks = result.data;
  render();
};

const onClickButton = async () => {
  if (valueInput.trim() != "") {
    const response = await fetch("http://localhost:3000/createTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        text: valueInput,
        isCheck: false,
      }),
    });
    const result = await response.json();
    allTasks = result.data;
  } else {
    alert("Oops. You have not entered a task.");
  }
  valueInput = "";
  input.value = "";
  render();
};

const updateValue = (event) => (valueInput = event.target.value);

const render = () => {
  const content = document.getElementById("content-page");
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }
  allTasks.sort((a, b) =>
    a.isCheck > b.isCheck ? 1 : a.isCheck < b.isCheck ? -1 : 0
  );
  allTasks.map((item, index) => {
    const container = document.createElement("div");
    container.id = `task=${index}`;
    container.className = "task-container";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "doneBut";
    checkbox.checked = item.isCheck;
    checkbox.onchange = () => onChangeCheckbox(index);
    container.appendChild(checkbox);
    if (index === activeEditTask.index) {
      const inputTask = document.createElement("input");
      inputTask.type = "text";
      inputTask.value = item.text;
      inputTask.className = "input-task";
      inputTask.addEventListener("input", (e) => updateTaskText(e));
      inputTask.addEventListener("onclick", () => doneEditTask(index));
      container.appendChild(inputTask);
      const imageDone = document.createElement("img");
      const imageCancel = document.createElement("img");
      imageDone.src = "imgs/Goto.png";
      imageCancel.src = "imgs/close.png";
      imageCancel.onclick = () => cancelEditTask();
      imageDone.onclick = () => doneEditTask(index);
      container.appendChild(imageDone);
      container.appendChild(imageCancel);
    } else {
      const text = document.createElement("p");
      text.innerText = item.text;
      text.className = item.isCheck ? "text-task done-text" : "text-task";
      const imageEdit = document.createElement("img");
      imageEdit.className = item.isCheck ? "imageEdit-disable" : "imageEdit";
      imageEdit.src = "imgs/edit.png";
      imageEdit.onclick = () => {
        activeEditTask = { index: index, text: allTasks[index].text };
        render();
      };
      container.appendChild(text);
      container.appendChild(imageEdit);
      const imageDelete = document.createElement("img");
      imageDelete.src = "imgs/close.png";
      imageDelete.onclick = () => onDeleteTask(index);
      container.appendChild(imageDelete);
    }

    content.appendChild(container);
  });
};

const onChangeCheckbox = async (index) => {
  allTasks[index].isCheck = !allTasks[index].isCheck;
  const response = await fetch("http://localhost:3000/updateTask", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(allTasks[index]),
  });
  const result = await response.json();
  allTasks = result.data;
  render();
};

const onDeleteTask = async (index) => {
  const response = await fetch(
    `http://localhost:3000/deleteTask?_id=${allTasks[index]._id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
  const result = await response.json();
  allTasks = result.data;
  render();
};

const updateTaskText = (event) => {
  activeEditTask.text = event.target.value;
};

const doneEditTask = async (index) => {
  if (activeEditTask.text) {
    allTasks[index].text = activeEditTask.text;
    let _id = allTasks[index]._id;
    const response = await fetch("http://localhost:3000/updateTask", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        _id,
        text: activeEditTask.text,
      }),
    });
    const result = await response.json();
    allTasks = result.data;
    activeEditTask = { index: null, text: null };
    render();
  } else {
    alert("Task must not be empty");
  }
};

const cancelEditTask = () => {
  activeEditTask = { index: null, text: null };
  render();
};