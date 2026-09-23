"use strict";

import { TOAST_DURATION_MS } from "./constants.js";

const tableBody = document.querySelector("#students-table");
const emptyMessage = document.querySelector("#empty-message");
const details = document.querySelector("#student-details");
const toast = document.querySelector("#toast");

let toastTimer = null;

export function showPage(pageId) {
    document.querySelectorAll(".page").forEach((page) => {
        page.classList.toggle("active", page.id === pageId);
    });
}

function appendCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = String(value);
    row.append(cell);
}

function createActionButton(action, isuId, label, studentName, extraClass = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `action-button ${extraClass}`.trim();
    button.dataset.action = action;
    button.dataset.id = isuId;
    button.textContent = label;
    button.setAttribute("aria-label", `${label}: ${studentName}`);
    return button;
}

export function renderStudents(students) {
    tableBody.replaceChildren();

    students.forEach((student) => {
        const row = document.createElement("tr");
        appendCell(row, student.fullName);
        appendCell(row, student.group);
        appendCell(row, student.isuId);
        appendCell(row, student.dormitory);
        appendCell(row, student.room);

        const actionsCell = document.createElement("td");
        const actions = document.createElement("div");
        actions.className = "actions";
        actions.append(
            createActionButton("details", student.isuId, "Подробнее", student.fullName),
            createActionButton("edit", student.isuId, "Изменить", student.fullName),
            createActionButton("delete", student.isuId, "Удалить", student.fullName, "delete-button")
        );
        actionsCell.append(actions);
        row.append(actionsCell);
        tableBody.append(row);
    });

    emptyMessage.textContent = "Список студентов пуст.";
    emptyMessage.hidden = students.length > 0;
}

export function renderListMessage(message) {
    tableBody.replaceChildren();
    emptyMessage.textContent = message;
    emptyMessage.hidden = false;
}

export function renderStudentDetails(student) {
    const list = document.createElement("dl");
    const rows = [
        ["ФИО", student.fullName],
        ["Группа", student.group],
        ["ИСУ ID", student.isuId],
        ["Общежитие", student.dormitory],
        ["Комната", student.room],
        ["Срок заселения", student.settlementDate],
        ["Иностранный студент", student.isForeigner ? "Да" : "Нет"],
        ["Заметки", student.notes || "Нет"]
    ];

    rows.forEach(([term, value]) => {
        const termElement = document.createElement("dt");
        const valueElement = document.createElement("dd");
        termElement.textContent = term;
        valueElement.textContent = String(value);
        list.append(termElement, valueElement);
    });

    details.replaceChildren(list);
}

export function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => {
        toast.hidden = true;
    }, TOAST_DURATION_MS);
}

export function setSubmitting(isSubmitting) {
    const submitButton = document.querySelector("#student-form button[type='submit']");
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? "Сохранение..." : "Сохранить";
}

export function renderPagination(data = null) {
    document.querySelector("#previous-page").disabled = !data || data.previous === null;
    document.querySelector("#next-page").disabled = !data || data.next === null;
    document.querySelector("#page-info").textContent = data
        ? `Страница ${data.page} из ${data.total_pages}. Всего студентов: ${data.count}`
        : "Страница не загружена";
}
