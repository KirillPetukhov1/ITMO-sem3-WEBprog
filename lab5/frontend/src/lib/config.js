// адрес java-бэкенда; ходит туда только сервер next, браузер его не знает
export const API_URL = (process.env.API_URL || 'http://localhost:8080').replace(/\/$/, '');

// secure-куки нужны только за https
export const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';

// сколько секунд держим список студентов в кеше, если его никто не сбросил
export const STUDENTS_REVALIDATE = Math.max(1, Number(process.env.STUDENTS_REVALIDATE) || 30);

export const REQUEST_TIMEOUT = 15000;
