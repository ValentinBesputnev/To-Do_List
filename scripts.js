let allTasks = [];
let valueInput = "";
let input = null;
let activeEditTask = null;

window.onload = async function init() {
  input = document.getElementById("add-task");
  input.addEventListener("change", updateValue);
  const response = await fetch("http://localhost:8000/allTasks", {
    method: "GET",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
  let result = await response.json();
  allTasks = result;
  render();
};

const onClickButton = async () => {
  if (valueInput.trim() != "") {
    const response = await fetch("http://localhost:8000/createTask", {
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
    let result = await response.json();

    allTasks = result;
  } else {
    alert("Oops. You have not entered a task.");
  }
  valueInput = "";
  input.value = "";
  render();
};

const updateValue = (event) => {
  valueInput = event.target.value;
};

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

    if (index === activeEditTask) {
      const inputTask = document.createElement("input");
      inputTask.type = "text";
      inputTask.value = item.text;
      inputTask.addEventListener("input", (e) => updateTaskText(e));
      inputTask.addEventListener("blur", () => doneEditTask(index));
      container.appendChild(inputTask);
    } else {
      const text = document.createElement("p");
      text.innerText = item.text;
      text.className = item.isCheck ? "text-task done-text" : "text-task";
      container.appendChild(text);
    }

    if (!item.isCheck) {
      if (index === activeEditTask) {
        const imageDone = document.createElement("img");
        imageDone.src = "img/done.png";
        imageDone.onclick = () => doneEditTask(index);
        container.appendChild(imageDone);
      } else {
        const imageEdit = document.createElement("img");
        imageEdit.src = "imgs/edit.png";
        imageEdit.onclick = () => {
          activeEditTask = index;
          render();
        };
        container.appendChild(imageEdit);
      }

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
  const response = await fetch("http://localhost:8000/updateTask", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(allTasks[index]),
  });
  const result = await response.json();
  allTasks = result;
  render();
};

const onDeleteTask = async (index) => {
  const response = await fetch(
    `http://localhost:8000/deleteTask?id=${allTasks[index]._id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
  let result = await response.json();
  allTasks = result;
  render();
};

const updateTaskText = async (event) => {
  allTasks[activeEditTask].text = event.target.value;
};

const doneEditTask = async () => {
  if (allTasks[activeEditTask].text.trim()) {
    await fetch("http://localhost:8000/updateTask", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(allTasks[activeEditTask]),
    });
    activeEditTask = null;
    render();
  } else {
    alert("Task must not be empty");
  }
};
