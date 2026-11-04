"use strict";

// Separate frontend server: backend runs on port 8080. Set "" for same-origin hosting.
export const API_ORIGIN = "http://localhost:8080";
export const API_BASE_URL = `${API_ORIGIN}/api/students`;
export const AUTH_BASE_URL = `${API_ORIGIN}/api/auth`;

export const PAGE_IDS = {
    login: "login-page",
    register: "register-page",
    list: "list-page",
    form: "form-page",
    details: "details-page"
};

export const TOAST_DURATION_MS = 4000;

export const DEFAULT_PAGE_SIZE = 10;
