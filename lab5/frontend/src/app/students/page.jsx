import Link from 'next/link';
import { Suspense } from 'react';

import StudentFilters from '../../components/StudentFilters.jsx';
import StudentSearch from '../../components/StudentSearch.jsx';
import StudentsTable, { StudentsTableSkeleton } from '../../components/StudentsTable.jsx';
import { queryString, pickQuery } from '../../lib/query.js';
import { requireSession } from '../../lib/session.js';

export const metadata = { title: 'Студенты' };

// ssr-страница списка. параметры поиска приходят из url (searchParams),
// поэтому ссылку с фильтрами можно скопировать и открыть заново
export default async function StudentsPage({ searchParams }) {
  const { user } = await requireSession();
  const query = pickQuery(await searchParams);

  return (
    <main>
      <div className="d-flex align-items-center mb-3">
        <h1 className="h3 mb-0">Студенты</h1>
        {user.role === 'ADMIN' && (
          <Link href="/students/new" className="btn btn-success ms-auto">
            + Создать студента
          </Link>
        )}
      </div>

      <div className="row g-4">
        <div className="col-lg-3">
          <StudentFilters />
        </div>
        <div className="col-lg-9">
          <StudentSearch />
          {/* streaming: шапка и фильтры уходят в браузер сразу, таблица —
              когда java ответит. key — чтобы при смене фильтров снова
              показать скелет */}
          <Suspense key={queryString(query)} fallback={<StudentsTableSkeleton />}>
            <StudentsTable query={query} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
