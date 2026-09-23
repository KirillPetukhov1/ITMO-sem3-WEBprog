"use strict";

import { API_BASE_URL } from "./constants.js";

export class ApiError extends Error {
    constructor(status, code, message, details = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

async function request(path = "", options = {}) {
    const headers = {
        Accept: "application/json",
        ...options.headers
    };

    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    let response;

    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers
        });
    } catch {
        throw new ApiError(0, "NETWORK_ERROR", "Не удалось подключиться к серверу.");
    }

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type") || "";
    let data = null;
    if (contentType.includes("application/json")) {
        try {
            data = await response.json();
        } catch {
            throw new ApiError(response.status, "INVALID_RESPONSE", "Сервер вернул некорректный JSON.");
        }
    }

    if (!response.ok) {
        const error = data?.error || {};
        throw new ApiError(
            response.status,
            error.code || "API_ERROR",
            error.message || `Ошибка сервера: ${response.status}.`,
            error.details || {}
        );
    }

    if (data === null) {
        throw new ApiError(response.status, "INVALID_RESPONSE", "Ожидался JSON-ответ сервера.");
    }
    return data;
}

export async function getStudents(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
            params.set(key, String(value));
        }
    });

    const query = params.toString();
    const data = await request(query ? `?${query}` : "");

    if (!data || !Array.isArray(data.results) || !Number.isInteger(data.page)) {
        throw new ApiError(200, "INVALID_RESPONSE", "Некорректный формат страницы студентов.");
    }
    return data;
}

export function getStudent(isuId) {
    return request(`/${encodeURIComponent(isuId)}`);
}

export function createStudent(student) {
    return request("", {
        method: "POST",
        body: JSON.stringify(student)
    });
}

export function updateStudent(isuId, changes) {
    return request(`/${encodeURIComponent(isuId)}`, {
        method: "PATCH",
        body: JSON.stringify(changes)
    });
}

export function deleteStudent(isuId) {
    return request(`/${encodeURIComponent(isuId)}`, { method: "DELETE" });
}
