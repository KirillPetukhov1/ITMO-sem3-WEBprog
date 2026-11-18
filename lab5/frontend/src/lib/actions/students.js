'use server';

import { updateTag } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';

import { backendFetch } from '../backend.js';
import { studentDto, studentFromDto } from '../domain/student.js';
import { ApiError, getErrorMessage } from '../errors.js';
import { actAuthorized } from '../session.js';
import { STUDENTS_TAG, isIsuId, studentTag } from '../students.js';

// server action - это публичная точка входа, поэтому права проверяем здесь,
// не надеясь на то, что кнопку видит только админ (java проверит ещё раз)
function requireAdmin(user) {
  if (user?.role !== 'ADMIN') {
    throw new ApiError('Недостаточно прав.', 403, 'ACCESS_DENIED');
  }
}

function requireIsu(isuId) {
  if (!isIsuId(isuId)) {
    throw new ApiError('Студент не найден', 404, 'STUDENT_NOT_FOUND');
  }
}

// после изменения сбрасываем кеш: следующий рендер пойдёт в java за свежими данными
function invalidate(isuId) {
  updateTag(STUDENTS_TAG);
  if (isuId) {
    updateTag(studentTag(isuId));
  }
}

export async function createStudentAction(values) {
  let created;
  try {
    const body = studentDto(values ?? {});
    created = await actAuthorized(async (token, user) => {
      requireAdmin(user);
      return studentFromDto(await backendFetch('/api/students', { method: 'POST', body, token }));
    });
  } catch (error) {
    unstable_rethrow(error);
    return { error: getErrorMessage(error) };
  }
  invalidate(String(created.isuId));
  redirect(`/students/${created.isuId}`);
}

export async function updateStudentAction(isuId, values) {
  try {
    requireIsu(isuId);
    const body = studentDto(values ?? {}, true);
    await actAuthorized(async (token, user) => {
      requireAdmin(user);
      return backendFetch(`/api/students/${isuId}`, { method: 'PATCH', body, token });
    });
  } catch (error) {
    unstable_rethrow(error);
    return { error: getErrorMessage(error) };
  }
  invalidate(isuId);
  redirect(`/students/${isuId}`);
}

export async function deleteStudentAction(isuId) {
  try {
    requireIsu(isuId);
    await actAuthorized(async (token, user) => {
      requireAdmin(user);
      return backendFetch(`/api/students/${isuId}`, { method: 'DELETE', token });
    });
  } catch (error) {
    unstable_rethrow(error);
    return { error: getErrorMessage(error) };
  }
  invalidate(isuId);
  redirect('/students');
}
