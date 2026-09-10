"use strict";

const STORAGE_KEY = "students_simple_v1";

const defaultStudents = [
  {
    id: 1,
    fullName: "Иванов Иван Иванович",
    group: "P3215",
    isuId: "500124",
    dormitory: 8,
    room: 412,
    settlementDate: "2027-06-30",
    isForeigner: false,
    notes: ""
  },
  {
    id: 2,
    fullName: "Ким Мин Джун",
    group: "M3402",
    isuId: "381905",
    dormitory: 5,
    room: 217,
    settlementDate: "2027-06-30",
    isForeigner: true,
    notes: "Иностранный студент"
  }
];


let students = loadStudents();
let selectedStudentId = null;

const listPage = document.querySelector("#list-page");
const formPage = document.querySelector("#form-page");
const detailsPage = document.querySelector("#details-page");
const tableBody = document.querySelector("#students-table");
const emptyMessage = document.querySelector("#empty-message");
const form = document.querySelector("#student-form");


function loadStudents() {
  const savedStudents = localStorage.getItem(STORAGE_KEY);
  return savedStudents ? JSON.parse(savedStudents) : defaultStudents;
}


function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}


function showPage(page) {
  document.querySelectorAll(".page").forEach((item) => {
    item.classList.remove("active");
  });
  page.classList.add("active");
}


function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = String(value);
  return element.innerHTML;
}


function renderStudents() {
  tableBody.innerHTML = "";
  emptyMessage.style.display = students.length ? "none" : "block";

  students.forEach((student) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${escapeHtml(student.fullName)}</td>
      <td>${escapeHtml(student.group)}</td>
      <td>${escapeHtml(student.isuId)}</td>
      <td>${escapeHtml(student.dormitory)}</td>
      <td>${escapeHtml(student.room)}</td>
      <td>
        <div class="actions">
          <button class="action-button" data-action="details" data-id="${student.id}">Подробнее</button>
          <button class="action-button" data-action="edit" data-id="${student.id}">Изменить</button>
          <button class="action-button delete-button" data-action="delete" data-id="${student.id}">Удалить</button>
        </div>
      </td>
    `;

    tableBody.append(row);
  });
}


function openForm(student = null) {
  form.reset();
  document.querySelector("#full-name-error").textContent = "";
  document.querySelector("#isu-error").textContent = "";

  if (student) {
    document.querySelector("#form-title").textContent = "Редактирование студента";
    document.querySelector("#student-id").value = student.id;
    document.querySelector("#full-name").value = student.fullName;
    document.querySelector("#group").value = student.group;
    document.querySelector("#isu-id").value = student.isuId;
    document.querySelector("#dormitory").value = student.dormitory;
    document.querySelector("#room").value = student.room;
    document.querySelector("#settlement-date").value = student.settlementDate;
    document.querySelector("#is-foreigner").checked = student.isForeigner;
    document.querySelector("#notes").value = student.notes;
  } else {
    document.querySelector("#form-title").textContent = "Добавление студента";
    document.querySelector("#student-id").value = "";
  }

  showPage(formPage);
}


function readForm() {
  return {
    fullName: document.querySelector("#full-name").value.trim(),
    group: document.querySelector("#group").value.trim(),
    isuId: document.querySelector("#isu-id").value.trim(),
    dormitory: Number(document.querySelector("#dormitory").value),
    room: Number(document.querySelector("#room").value),
    settlementDate: document.querySelector("#settlement-date").value,
    isForeigner: document.querySelector("#is-foreigner").checked,
    notes: document.querySelector("#notes").value.trim()
  };
}


function validateStudent(student, currentId) {
  const nameError = document.querySelector("#full-name-error");
  const isuError = document.querySelector("#isu-error");
  nameError.textContent = "";
  isuError.textContent = "";

  if (student.fullName.split(/\s+/).length < 2) {
    nameError.textContent = "Введите фамилию и имя.";
    return false;
  }

  const duplicateIsu = students.some((item) => {
    return item.isuId === student.isuId && item.id !== currentId;
  });

  if (duplicateIsu) {
    isuError.textContent = "Студент с таким ИСУ ID уже существует.";
    return false;
  }

  return true;
}


function showDetails(student) {
  selectedStudentId = student.id;
  document.querySelector("#student-details").innerHTML = `
    <dl>
      <dt>ФИО</dt><dd>${escapeHtml(student.fullName)}</dd>
      <dt>Группа</dt><dd>${escapeHtml(student.group)}</dd>
      <dt>ИСУ ID</dt><dd>${escapeHtml(student.isuId)}</dd>
      <dt>Общежитие</dt><dd>${escapeHtml(student.dormitory)}</dd>
      <dt>Комната</dt><dd>${escapeHtml(student.room)}</dd>
      <dt>Срок заселения</dt><dd>${escapeHtml(student.settlementDate)}</dd>
      <dt>Иностранный студент</dt><dd>${student.isForeigner ? "Да" : "Нет"}</dd>
      <dt>Заметки</dt><dd>${escapeHtml(student.notes || "Нет")}</dd>
    </dl>
  `;
  showPage(detailsPage);
}


function deleteStudent(id) {
  if (!confirm("Удалить студента?")) return;

  students = students.filter((student) => student.id !== id);
  saveStudents();
  renderStudents();
  showPage(listPage);
}



document.querySelector("#add-button").addEventListener("click", () => openForm());
document.querySelector("#cancel-button").addEventListener("click", () => showPage(listPage));
document.querySelector("#back-button").addEventListener("click", () => showPage(listPage));

document.querySelector("#edit-details-button").addEventListener("click", () => {
  const student = students.find((item) => item.id === selectedStudentId);
  if (student) openForm(student);
});

tableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const student = students.find((item) => item.id === id);
  if (!student) return;

  if (button.dataset.action === "details") showDetails(student);
  if (button.dataset.action === "edit") openForm(student);
  if (button.dataset.action === "delete") deleteStudent(id);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const idValue = document.querySelector("#student-id").value;
  const currentId = idValue ? Number(idValue) : null;
  const studentData = readForm();

  if (!validateStudent(studentData, currentId)) return;

  if (currentId) {
    const index = students.findIndex((student) => student.id === currentId);
    students[index] = { id: currentId, ...studentData };
  } else {
    students.push({ id: Date.now(), ...studentData });
  }

  saveStudents();
  renderStudents();
  showPage(listPage);
});

renderStudents();
