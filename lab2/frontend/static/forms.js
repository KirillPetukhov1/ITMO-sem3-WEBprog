"use strict";

const studentForm = document.querySelector("#student-form");
const filterForm = document.querySelector("#filter-form");
const isuIdInput = document.querySelector("#isu-id");
const originalIsuIdInput = document.querySelector("#original-isu-id");
const formError = document.querySelector("#form-error");

const fieldIds = {
    fullName: "full-name",
    group: "group",
    isuId: "isu-id",
    dormitory: "dormitory",
    room: "room",
    settlementDate: "settlement-date",
    notes: "notes",
    isForeigner: "is-foreigner"
};

let originalData = null;

function fieldValue(id) {
    return document.querySelector(`#${id}`).value.trim();
}

export function readStudentForm() {
    return {
        fullName: fieldValue("full-name"),
        group: fieldValue("group"),
        isuId: fieldValue("isu-id"),
        dormitory: Number(fieldValue("dormitory")),
        room: Number(fieldValue("room")),
        settlementDate: fieldValue("settlement-date"),
        isForeigner: document.querySelector("#is-foreigner").checked,
        notes: fieldValue("notes")
    };
}

export function readFilters() {
    const sortBy = fieldValue("sort-by");

    return {
        fullName: fieldValue("filter-full-name"),
        group: fieldValue("filter-group"),
        isuId: fieldValue("filter-isu-id"),
        dormitory: fieldValue("filter-dormitory"),
        room: fieldValue("filter-room"),
        isForeigner: fieldValue("filter-is-foreigner"),
        sortBy,
        order: sortBy ? fieldValue("sort-order") : ""
    };
}

export function resetFilters() {
    filterForm.reset();
}

export function clearFormErrors() {
    document.querySelectorAll("[data-error-for]").forEach((element) => {
        element.textContent = "";
    });

    Object.values(fieldIds).forEach((id) => {
        document.querySelector(`#${id}`).removeAttribute("aria-invalid");
    });

    formError.textContent = "";
    formError.hidden = true;
}

export function showFormErrors(details = {}, message = "Проверьте введенные данные.") {
    clearFormErrors();
    let hasFieldErrors = false;

    Object.entries(details).forEach(([field, value]) => {
        const inputId = fieldIds[field];
        if (!Object.hasOwn(fieldIds, field)) return;
        const errorElement = document.querySelector(`[data-error-for="${field}"]`);

        if (!errorElement || !inputId) {
            return;
        }

        const errorMessage = Array.isArray(value) ? value.join(" ") : String(value);
        errorElement.textContent = errorMessage;
        document.querySelector(`#${inputId}`).setAttribute("aria-invalid", "true");
        hasFieldErrors = true;
    });

    if (!hasFieldErrors || message) {
        formError.textContent = message;
        formError.hidden = false;
    }
}

export function openStudentForm(student = null) {
    studentForm.reset();
    clearFormErrors();
    originalIsuIdInput.value = student?.isuId || "";
    isuIdInput.readOnly = Boolean(student);

    document.querySelector("#form-title").textContent = student
        ? "Редактирование студента"
        : "Добавление студента";

    originalData = student ? { ...student } : null;
    if (!student) {
        return;
    }

    document.querySelector("#full-name").value = student.fullName;
    document.querySelector("#group").value = student.group;
    isuIdInput.value = student.isuId;
    document.querySelector("#dormitory").value = student.dormitory;
    document.querySelector("#room").value = student.room;
    document.querySelector("#settlement-date").value = student.settlementDate;
    document.querySelector("#is-foreigner").checked = student.isForeigner;
    document.querySelector("#notes").value = student.notes || "";
}

export function getOriginalIsuId() {
    return originalIsuIdInput.value || null;
}

export function readStudentChanges() {
    return Object.fromEntries(Object.entries(readStudentForm()).filter(
        ([key, value]) => key !== "isuId" && value !== originalData?.[key]
    ));
}
