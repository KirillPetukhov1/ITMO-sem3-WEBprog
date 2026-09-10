"use strict";

import { load, save, findById, add, update, remove, validate } from './business'

// const businessScript = document.createElement("script");
// businessScript.src = "business.js";
// businessScript.onload = startApplication;
// document.head.append(businessScript);

// function startApplication() {
    let students = load();
    let selectedStudentId = null;

    const listPage = document.querySelector("#list-page");
    const formPage = document.querySelector("#form-page");
    const detailsPage = document.querySelector("#details-page");
    const tableBody = document.querySelector("#students-table");
    const emptyMessage = document.querySelector("#empty-message");
    const form = document.querySelector("#student-form");

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

    function showValidationError(error) {
        document.querySelector("#full-name-error").textContent = "";
        document.querySelector("#isu-error").textContent = "";

        if (!error) return;

        const errorElement = error.field === "fullName"
            ? document.querySelector("#full-name-error")
            : document.querySelector("#isu-error");
        errorElement.textContent = error.message;
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

    function saveAndRender() {
        save(students);
        renderStudents();
        showPage(listPage);
    }

    document.querySelector("#add-button").addEventListener("click", () => openForm());
    document.querySelector("#cancel-button").addEventListener("click", () => showPage(listPage));
    document.querySelector("#back-button").addEventListener("click", () => showPage(listPage));

    document.querySelector("#edit-details-button").addEventListener("click", () => {
        const student = findById(students, selectedStudentId);
        if (student) openForm(student);
    });

    tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const id = Number(button.dataset.id);
        const student = findById(students, id);
        if (!student) return;

        if (button.dataset.action === "details") showDetails(student);
        if (button.dataset.action === "edit") openForm(student);
        if (button.dataset.action === "delete" && confirm("Удалить студента?")) {
            students = remove(students, id);
            saveAndRender();
        }
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
        const error = validate(studentData, students, currentId);

        showValidationError(error);
        if (error) return;

        students = currentId
            ? update(students, currentId, studentData)
            : add(students, studentData);

        saveAndRender();
    });

    renderStudents();
// }
