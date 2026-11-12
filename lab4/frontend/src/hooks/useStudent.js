import { useMemo } from 'react';

import { studentsApi } from '../app/services.js';
import useStudentResource from './useStudentResource.js';

const load = (query, signal) => studentsApi.get(query.isuId, signal);

export default function useStudent(isuId) {
  const query = useMemo(
    () => ({
      isuId,
    }),
    [isuId],
  );
  return useStudentResource(query, load);
}
