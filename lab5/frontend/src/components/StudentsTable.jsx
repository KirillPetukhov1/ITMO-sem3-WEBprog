import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getErrorMessage } from '../lib/errors.js';
import { studentsHref } from '../lib/query.js';
import { readAuthorized } from '../lib/session.js';
import { listStudents } from '../lib/students.js';

const COLUMNS = ['ИСУ', 'ФИО', 'Группа', 'Общага', 'Комната', 'Заселён', 'Иностранец'];

function TableShell({ children }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            {COLUMNS.map((title) => (
              <th key={title}>{title}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function StudentsTableSkeleton() {
  return (
    <div aria-busy="true">
      <p className="placeholder-glow small mb-2">
        <span className="placeholder col-2" />
      </p>
      <TableShell>
        {Array.from({ length: 5 }, (_, row) => (
          <tr key={row} className="placeholder-glow">
            {COLUMNS.map((title) => (
              <td key={title}>
                <span className="placeholder col-8" />
              </td>
            ))}
          </tr>
        ))}
      </TableShell>
      <p className="visually-hidden" role="status">
        загружаем студентов...
      </p>
    </div>
  );
}

function PageLink({ query, page, disabled, children, label }) {
  if (disabled) {
    return (
      <li className="page-item disabled">
        <span className="page-link" aria-label={label}>
          {children}
        </span>
      </li>
    );
  }
  // Link заранее подгружает соседнюю страницу (prefetch), переход мгновенный
  return (
    <li className="page-item">
      <Link className="page-link" href={studentsHref({ ...query, page })} aria-label={label}>
        {children}
      </Link>
    </li>
  );
}

// серверный компонент: данные запрашиваются на сервере (и берутся из кеша next)
export default async function StudentsTable({ query }) {
  let data;
  try {
    data = await readAuthorized((token) => listStudents(query, token));
  } catch (error) {
    // после удаления страница могла исчезнуть - уходим на последнюю существующую
    if (error?.code === 'PAGE_NOT_FOUND' && Number.isInteger(error.details?.total_pages)) {
      redirect(studentsHref({ ...query, page: error.details.total_pages }));
    }
    // кривые параметры в адресе - показываем ошибку прямо над таблицей
    if (error?.status === 422 || error?.status === 400) {
      return <div className="alert alert-warning">{getErrorMessage(error)}</div>;
    }
    // остальное (java упала и т.п.) ловит error.jsx
    throw error;
  }

  const page = data.page;
  const totalPages = Math.max(1, data.total_pages);

  return (
    <>
      <p className="text-body-secondary small mb-2">Найдено: {data.count}</p>
      <TableShell>
        {data.results.length === 0 && (
          <tr>
            <td colSpan={COLUMNS.length} className="text-center text-body-secondary">
              Никого не нашлось
            </td>
          </tr>
        )}
        {data.results.map((student) => (
          <tr key={student.isuId}>
            <td>{student.isuId}</td>
            <td>
              <Link href={`/students/${student.isuId}`}>{student.fullName}</Link>
            </td>
            <td>{student.group}</td>
            <td>{student.dormitory}</td>
            <td>{student.room}</td>
            <td>{student.settlementDate}</td>
            <td>{student.isForeigner ? 'да' : 'нет'}</td>
          </tr>
        ))}
      </TableShell>

      <nav aria-label="Страницы">
        <ul className="pagination justify-content-center">
          <PageLink query={query} page={page - 1} disabled={page <= 1} label="Назад">
            {'<'}
          </PageLink>
          <li className="page-item active" aria-current="page">
            <span className="page-link">
              {page} из {totalPages}
            </span>
          </li>
          <PageLink query={query} page={page + 1} disabled={page >= totalPages} label="Вперёд">
            {'>'}
          </PageLink>
        </ul>
      </nav>
    </>
  );
}
