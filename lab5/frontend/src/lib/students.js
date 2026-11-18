import 'server-only';

import { backendFetch } from './backend.js';
import { STUDENTS_REVALIDATE } from './config.js';
import { pageFromDto, searchDto, studentFromDto } from './domain/student.js';
import { ApiError } from './errors.js';

// теги кеша: общий на все списки и отдельный на каждого студента
export const STUDENTS_TAG = 'students';
export const studentTag = (isuId) => `student-${isuId}`;

const ISU_PATTERN = /^[1-9][0-9]{5}$/;

export function isIsuId(value) {
  return typeof value === 'string' && ISU_PATTERN.test(value);
}

// кешируем ответ java в data cache next. ключ кеша включает заголовок
// Authorization, так что чужой (или подделанный) токен в чужой кеш не попадёт
function cached(tags) {
  return {
    cache: 'force-cache',
    next: { tags, revalidate: STUDENTS_REVALIDATE },
  };
}

export async function listStudents(params, token) {
  const query = searchDto(params);
  const dto = await backendFetch('/api/students', { query, token, ...cached([STUDENTS_TAG]) });
  return pageFromDto(dto);
}

export async function getStudent(isuId, token) {
  if (!isIsuId(isuId)) {
    throw new ApiError('Студент не найден', 404, 'STUDENT_NOT_FOUND');
  }
  const dto = await backendFetch(`/api/students/${isuId}`, {
    token,
    ...cached([STUDENTS_TAG, studentTag(isuId)]),
  });
  return studentFromDto(dto);
}
