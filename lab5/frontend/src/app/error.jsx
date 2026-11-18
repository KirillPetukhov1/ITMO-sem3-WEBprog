'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

// error.jsx - граница ошибок: ловит исключения при рендере страниц
// (java недоступна, 500 и т.п.). обязательно клиентский компонент
export default function ErrorPage({ error, reset }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // повторить = заново запросить серверный рендер и сбросить границу ошибки
  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <main>
      <div className="alert alert-danger">
        <h1 className="h4">Что-то пошло не так</h1>
        <p className="mb-0">
          Не удалось загрузить данные. Возможно, сервер недоступен - попробуйте ещё раз.
        </p>
        {error?.digest && <p className="small text-body-secondary mb-0">код: {error.digest}</p>}
      </div>
      <div className="d-flex gap-2">
        <button type="button" className="btn btn-outline-danger" onClick={retry} disabled={pending}>
          {pending ? 'Повторяем...' : 'Повторить'}
        </button>
        <Link href="/students" className="btn btn-outline-secondary">
          К списку
        </Link>
      </div>
    </main>
  );
}
