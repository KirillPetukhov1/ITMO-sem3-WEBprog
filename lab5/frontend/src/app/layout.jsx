import 'bootstrap/dist/css/bootstrap.min.css';

import Navigation from '../components/Navigation.jsx';
import { getSession } from '../lib/session.js';

export const metadata = {
  title: {
    default: 'система управления разумом',
    template: '%s · система управления разумом',
  },
  description: 'Учёт студентов общежитий',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

// общий каркас всех страниц: шапка рендерится на сервере
// и сразу знает, кто вошёл (из куки), без мигания «гость → пользователь»
export default async function RootLayout({ children }) {
  const session = await getSession();
  return (
    <html lang="ru" data-bs-theme="dark">
      <body>
        <Navigation user={session?.user ?? null} />
        <div className="container pb-4">{children}</div>
      </body>
    </html>
  );
}
