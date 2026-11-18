import 'server-only';

import { cache } from 'react';

import { readAuthorized, requireSession } from '../../../lib/session.js';
import { getStudent } from '../../../lib/students.js';

// cache(): generateMetadata и сама страница зовут это оба раза,
// а запрос к java уйдёт только один
export const loadStudent = cache(async (id) => {
  const { user } = await requireSession();
  try {
    const student = await readAuthorized((token) => getStudent(id, token));
    return { student, user };
  } catch (error) {
    if (error?.code === 'STUDENT_NOT_FOUND' || error?.code === 'INVALID_ISU_ID') {
      return { student: null, user };
    }
    throw error;
  }
});
