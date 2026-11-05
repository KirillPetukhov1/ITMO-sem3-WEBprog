"use strict";

import { API_BASE_URL } from "./constants.js";
import { ApiError } from "./http.js";
import { authorizedRequest } from "./auth.js";
export { ApiError } from "./http.js";

function request(path = "", options = {}) {
    return authorizedRequest(`${API_BASE_URL}${path}`, options);
}

export async function getStudents(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
            params.set(key, String(value));
        }
    });

    const query = params.toString();
    
    let data;
    if (params.size > 5) {
        const body = Object.fromEntries(params);
        for (const field of ["isuId", "dormitory", "room", "page", "page_size"]) {
            if (Object.hasOwn(body, field)) body[field] = Number(body[field]);
        }
        if (Object.hasOwn(body, "isForeigner")) body.isForeigner = body.isForeigner === "true";
        data = await request("", { method: "QUERY", body: JSON.stringify(body) });
    } else {
        data = await request(query ? `?${query}` : "");
    }

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
