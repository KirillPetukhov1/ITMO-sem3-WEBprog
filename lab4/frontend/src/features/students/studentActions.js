import { studentsApi } from '../../app/services.js';
import { studentChanges } from './studentEvents.js';

export const getStudent = (id, signal) => studentsApi.get(id, signal);
export async function createStudent(values) {
  const student = await studentsApi.create(values);
  studentChanges.next(student.isuId);
  return student;
}
export async function updateStudent(id, values) {
  const student = await studentsApi.update(id, values);
  studentChanges.next(student.isuId);
  return student;
}
export async function deleteStudent(id) {
  await studentsApi.remove(id);
  studentChanges.next(Number(id));
}
