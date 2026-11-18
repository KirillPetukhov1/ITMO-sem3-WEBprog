import { studentsApi } from '../app/services.js';
import useStudentResource from './useStudentResource.js';

async function loadList(query, signal) {
  try {
    return await studentsApi.list(query, signal);
  } catch (error) {
    const page = error.details?.total_pages;
    if (error.code !== 'PAGE_NOT_FOUND' || !Number.isInteger(page) || page < 1) {
      throw error;
    }

    return {
      ...(await studentsApi.list(
        {
          ...query,
          page,
        },
        signal,
      )),
      correctedFrom: query.page,
    };
  }
}

export default function useStudentList(query) {
  return useStudentResource(query, loadList);
}
