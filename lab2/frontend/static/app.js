"use strict";

import {
    ApiError,
    createStudent,
    deleteStudent,
    getStudent,
    getStudents,
    updateStudent
} from "./api.js";
import { PAGE_IDS, DEFAULT_PAGE_SIZE } from "./constants.js";
import {
    clearFormErrors,
    getOriginalIsuId,
    openStudentForm,
    readFilters,
    readStudentForm,
    readStudentChanges,
    resetFilters,
    showFormErrors
} from "./forms.js";
import {
    renderListMessage,
    renderStudentDetails,
    renderStudents,
    renderPagination,
    setSubmitting,
    showPage,
    showToast
} from "./render.js";

const studentForm = document.querySelector("#student-form");
const filterForm = document.querySelector("#filter-form");
const tableBody = document.querySelector("#students-table");

let activeFilters = {};
let selectedIsuId = null;
let currentPage = 1;
let pageSize = DEFAULT_PAGE_SIZE;
let listRequestId = 0;
let saving = false;

function errorMessage(error) {
    return error instanceof ApiError
        ? error.message
        : "Произошла непредвиденная ошибка.";
}

async function loadStudents() {
    // Более старый ответ не должен перерисовать результат новых фильтров.
    const requestId = ++listRequestId;
    renderListMessage("Загрузка...");
    renderPagination();

    try {
        let data;
        try {
            data = await getStudents({ ...activeFilters, page: currentPage, page_size: pageSize });
        } catch (error) {
            if (requestId !== listRequestId) return;
            if (error.code !== "PAGE_NOT_FOUND") throw error;
            // Последняя страница могла исчезнуть после удаления студента.
            currentPage = Number(error.details.total_pages) || 1;
            data = await getStudents({ ...activeFilters, page: currentPage, page_size: pageSize });
        }
        if (requestId !== listRequestId) return;
        currentPage = data.page;
        renderStudents(data.results);
        renderPagination(data);
    } catch (error) {
        if (requestId !== listRequestId) return;
        renderListMessage(errorMessage(error));
    }
}

async function showDetails(isuId) {
    try {
        const student = await getStudent(isuId);
        selectedIsuId = student.isuId;
        renderStudentDetails(student);
        showPage(PAGE_IDS.details);
    } catch (error) {
        showToast(errorMessage(error));
        await loadStudents();
        showPage(PAGE_IDS.list);
    }
}

async function showEditForm(isuId) {
    try {
        const student = await getStudent(isuId);
        openStudentForm(student);
        showPage(PAGE_IDS.form);
    } catch (error) {
        showToast(errorMessage(error));
        await loadStudents();
        showPage(PAGE_IDS.list);
    }
}

async function removeStudent(isuId) {
    if (!window.confirm("Удалить студента?")) {
        return;
    }

    try {
        await deleteStudent(isuId);
        showToast("Студент удален.");
        await loadStudents();
    } catch (error) {
        showToast(errorMessage(error));
    }
}

document.querySelector("#add-button").addEventListener("click", () => {
    openStudentForm();
    showPage(PAGE_IDS.form);
});

document.querySelector("#cancel-button").addEventListener("click", () => {
    showPage(PAGE_IDS.list);
});

document.querySelector("#back-button").addEventListener("click", () => {
    showPage(PAGE_IDS.list);
});

document.querySelector("#edit-details-button").addEventListener("click", () => {
    if (selectedIsuId) {
        showEditForm(selectedIsuId);
    }
});

filterForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!filterForm.checkValidity()) {
        filterForm.reportValidity();
        return;
    }

    activeFilters = readFilters();
    currentPage = 1;
    await loadStudents();
});

document.querySelector("#reset-filter-button").addEventListener("click", async () => {
    resetFilters();
    activeFilters = {};
    currentPage = 1;
    await loadStudents();
});

tableBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const { action, id } = button.dataset;

    if (action === "details") {
        showDetails(id);
    } else if (action === "edit") {
        showEditForm(id);
    } else if (action === "delete") {
        removeStudent(id);
    }
});

studentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!studentForm.checkValidity()) {
        studentForm.reportValidity();
        return;
    }

    if (saving) return;
    saving = true;
    clearFormErrors();
    setSubmitting(true);
    document.querySelector("#add-button").disabled = true;
    document.querySelector("#cancel-button").disabled = true;

    const originalIsuId = getOriginalIsuId();
    const student = readStudentForm();

    try {
        if (originalIsuId) {
            await updateStudent(originalIsuId, readStudentChanges());
            showToast("Данные студента обновлены.");
        } else {
            await createStudent(student);
            showToast("Студент добавлен.");
        }

        showPage(PAGE_IDS.list);
        await loadStudents();
    } catch (error) {
        if (error instanceof ApiError && (error.status === 409 || error.status === 422)) {
            showFormErrors(error.details, error.message);
        } else {
            showFormErrors({}, errorMessage(error));
        }
    } finally {
        saving = false;
        setSubmitting(false);
        document.querySelector("#add-button").disabled = false;
        document.querySelector("#cancel-button").disabled = false;
    }
});

document.querySelector("#previous-page").addEventListener("click", () => {
    currentPage -= 1;
    loadStudents();
});

document.querySelector("#next-page").addEventListener("click", () => {
    currentPage += 1;
    loadStudents();
});

document.querySelector("#page-size").value = String(DEFAULT_PAGE_SIZE);
document.querySelector("#page-size").addEventListener("change", (event) => {
    pageSize = Number(event.target.value);
    currentPage = 1;
    loadStudents();
});

loadStudents();
