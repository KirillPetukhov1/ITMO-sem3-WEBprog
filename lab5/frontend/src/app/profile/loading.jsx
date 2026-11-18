import PageSpinner from '../../components/PageSpinner.jsx';

// loading.jsx = автоматический <Suspense> вокруг страницы:
// пока сервер ходит в java за профилем, пользователь сразу видит спиннер.
// на /students/[id] его специально нет: со стримингом статус 200 уходит
// раньше, чем станет ясно, что студента нет, и 404 бы потерялся
export default function ProfileLoading() {
  return <PageSpinner text="грузим профиль..." />;
}
