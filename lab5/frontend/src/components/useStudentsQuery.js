'use client';

import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { pickQuery, studentsHref } from '../lib/query.js';

// меняем фильтры = меняем url. дальше next сам запросит у сервера
// новый rsc-рендер страницы с этими параметрами
export default function useStudentsQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const query = pickQuery(searchParams);

  function update(changes, { replace = false } = {}) {
    // любое изменение условий - снова с первой страницы
    const next = { ...query, ...changes, page: changes.page ?? undefined };
    const href = studentsHref(next);
    if (pathname === '/students' && studentsHref(query) === href) {
      return;
    }
    startTransition(() => {
      if (replace) {
        router.replace(href, { scroll: false });
      } else {
        router.push(href, { scroll: false });
      }
    });
  }

  return { query, update, pending };
}
