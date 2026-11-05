import { getUser, isAdmin, getSessionVersion, login, register, logout } from "./auth.js";
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
    clearAuthErrors,
    showAuthErrors,
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
    if (!getUser()) return;
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
            currentPage = Number(error.details.total_pages) || 1;
            data = await getStudents({ ...activeFilters, page: currentPage, page_size: pageSize });
        }
        if (requestId !== listRequestId) return;
        currentPage = data.page;
        renderStudents(data.results, isAdmin());
        renderPagination(data);
    } catch (error) {
        if (requestId !== listRequestId) return;
        renderListMessage(errorMessage(error));
    }
}

async function showDetails(isuId) {
    if (!getUser()) return;
    const sessionVersion = getSessionVersion();
    try {
        const student = await getStudent(isuId);
        if (sessionVersion !== getSessionVersion()) return;
        selectedIsuId = student.isuId;
        renderStudentDetails(student);
        showPage(PAGE_IDS.details);
    } catch (error) {
        if (sessionVersion !== getSessionVersion()) return;
        showToast(errorMessage(error));
        await loadStudents();
        showPage(PAGE_IDS.list);
    }
}

async function showEditForm(isuId) {
    if (!getUser() || !isAdmin()) return;
    const sessionVersion = getSessionVersion();
    try {
        const student = await getStudent(isuId);
        if (sessionVersion !== getSessionVersion()) return;
        openStudentForm(student);
        showPage(PAGE_IDS.form);
    } catch (error) {
        if (sessionVersion !== getSessionVersion()) return;
        showToast(errorMessage(error));
        await loadStudents();
        showPage(PAGE_IDS.list);
    }
}

async function removeStudent(isuId) {
    if (!getUser() || !isAdmin()) return;
    const sessionVersion = getSessionVersion();
    if (!window.confirm("Удалить студента?")) {
        return;
    }

    try {
        await deleteStudent(isuId);
        if (sessionVersion !== getSessionVersion()) return;
        showToast("Студент удален.");
        await loadStudents();
    } catch (error) {
        if (sessionVersion !== getSessionVersion()) return;
        showToast(errorMessage(error));
    }
}

document.querySelector("#add-button").addEventListener("click", () => {
    if (!isAdmin()) return;
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

    if (saving || !isAdmin()) return;
    const sessionVersion = getSessionVersion();
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
            if (sessionVersion !== getSessionVersion()) return;
            showToast("Данные студента обновлены.");
        } else {
            await createStudent(student);
            if (sessionVersion !== getSessionVersion()) return;
            showToast("Студент добавлен.");
        }

        showPage(PAGE_IDS.list);
        await loadStudents();
    } catch (error) {
        if (sessionVersion !== getSessionVersion()) return;
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

const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
let authBusy = false;

function setAuthBusy(value) {
    authBusy = value;
    for (const form of [loginForm, registerForm]) {
        form.querySelectorAll("button").forEach(button => { button.disabled = value; });
    }
    document.querySelector("#logout-button").disabled = value;
}

function updateAccount() {
    const user = getUser();
    document.querySelector("#account-panel").hidden = !user;
    document.querySelector("#account-info").textContent = user
        ? `${user.username} · ${isAdmin() ? "Администратор" : "Пользователь"}` : "";
    document.querySelector("#add-button").hidden = !isAdmin();
    document.querySelector("#edit-details-button").hidden = !isAdmin();
}

window.addEventListener("auth-changed", ({ detail }) => {
    updateAccount();
    if (!getUser()) {
        listRequestId += 1;
        selectedIsuId = null;
        tableBody.replaceChildren();
        document.querySelector("#student-details").replaceChildren();
        renderPagination();
        openStudentForm();
        resetFilters();
        activeFilters = {};
        currentPage = 1;
        loginForm.elements.password.value = "";
        showPage(PAGE_IDS.login);
        if (detail.reason === "expired") {
            showAuthErrors(loginForm, "Сессия истекла. Войдите снова.");
        }
    } else if (detail.reason === "login") {
        showPage(PAGE_IDS.list);
        loadStudents();
    }
});

document.querySelector("#show-register").addEventListener("click", () => {
    clearAuthErrors(registerForm);
    loginForm.elements.password.value = "";
    showPage(PAGE_IDS.register);
    registerForm.elements.username.focus();
});
document.querySelector("#show-login").addEventListener("click", () => {
    clearAuthErrors(loginForm);
    registerForm.elements.password.value = "";
    registerForm.elements.confirmPassword.value = "";
    showPage(PAGE_IDS.login);
    loginForm.elements.username.focus();
});

loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (authBusy || !loginForm.reportValidity()) return;
    clearAuthErrors(loginForm);
    setAuthBusy(true);
    try {
        await login(loginForm.elements.username.value.trim(), loginForm.elements.password.value);
        loginForm.elements.password.value = "";
    } catch (error) {
        showAuthErrors(loginForm, errorMessage(error), error.details);
    } finally { setAuthBusy(false); }
});

registerForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (authBusy || !registerForm.reportValidity()) return;
    clearAuthErrors(registerForm);
    const password = registerForm.elements.password.value;
    if (password !== registerForm.elements.confirmPassword.value) {
        showAuthErrors(registerForm, "Пароли не совпадают.", { confirmPassword: ["Повторите пароль."] });
        return;
    }
    if (new TextEncoder().encode(password).length > 72) {
        showAuthErrors(registerForm, "Пароль слишком длинный.", { password: ["Допустимо не более 72 байт UTF-8."] });
        return;
    }
    setAuthBusy(true);
    try {
        const username = registerForm.elements.username.value.trim();
        await register({ username, email: registerForm.elements.email.value.trim().toLowerCase(), password });
        registerForm.reset();
        loginForm.elements.username.value = username;
        clearAuthErrors(loginForm);
        showPage(PAGE_IDS.login);
        showToast("Регистрация завершена. Войдите в аккаунт.");
    } catch (error) {
        showAuthErrors(registerForm, errorMessage(error), error.details);
    } finally { setAuthBusy(false); }
});

document.querySelector("#logout-button").addEventListener("click", async () => {
    if (authBusy) return;
    setAuthBusy(true);
    clearAuthErrors(loginForm);
    try { await logout(); }
    catch (error) {
        showAuthErrors(loginForm, `Локальный выход выполнен. Сервер не подтвердил выход: ${errorMessage(error)}`);
    } finally { setAuthBusy(false); }
});

updateAccount();
if (getUser()) {
    showPage(PAGE_IDS.list);
    loadStudents();
} else {
    showPage(PAGE_IDS.login);
}
