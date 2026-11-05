export function messageText(message)
{
  const text = String(message)
  // сервер пишет официально, переводим на наш
  const messages = {
    'Имя пользователя уже занято': 'логин уже занят, придумай другой',
    'Email уже используется': 'эта почта уже занята',
    'Имя пользователя или email уже используется': 'логин или почта уже заняты',
    'Неверное имя пользователя или пароль': 'логин или пароль мимо',
    'Недостаточно прав': 'у миня нет прав',
    'Студент не найден': 'студент куда-то делся',
    'Страница не существует': 'такой страницы нет, листай назад',
    'ИСУ ID нельзя изменить': 'ису не трогаем, он тут навсегда',
    'Идентификатор студента неизменяем': 'ису не трогаем, он тут навсегда',
    'ИСУ ID уже существует': 'такой ису уже есть',
    'Студент с таким ИСУ ID уже существует': 'такой ису уже есть',
    'Обязательное поле': 'тут пусто, заполни',
    'Ожидается 6 цифр': 'тут надо 6 цифр',
    'Длина ФИО должна быть от 5 до 100 символов': 'фио надо от 5 до 100 символов',
    'Ожидается заглавная латинская буква и 4 цифры': 'большая латинская буква и 4 цифры, типа A1234',
    'Дата должна быть не раньше 2000-01-01': 'дата слишком древняя, надо от 2000-01-01',
    'Пароль должен занимать не более 72 байт UTF-8': 'пароль тяжеловат, надо не больше 72 байт utf-8',
    'Username: 3–50 латинских букв, цифр, точек, дефисов или подчёркиваний': 'логин: 3–50 символов, латиница, цифры и ._-',
    'Проверьте введенные данные': 'что-то в полях не то, проверь',
    'Некорректные параметры запроса': 'с фильтрами что-то не то',
    'Неверный тип или формат JSON-значения': 'формат не тот, проверь поле',
    'Внутренняя ошибка сервера': 'ооошибка сервера',
    'Сессия отсутствует': 'сначала зайди в аккаунт',
    'Refresh-токен недействителен или истёк': 'токен стух, зайди ещё раз',
    'must not be blank': 'тут пусто, заполни',
    'must not be null': 'тут пусто, заполни',
    'must be a well-formed email address': 'почта какая-то не такая, проверь адрес'
  }

  if (messages[text])
  {
    return messages[text]
  }

  const minimum = text.match(/^must be greater than or equal to (\d+)$/)
  const maximum = text.match(/^must be less than or equal to (\d+)$/)
  const size = text.match(/^size must be between (\d+) and (\d+)$/)

  if (minimum)
  {
    return 'надо не меньше ' + minimum[1]
  }

  if (maximum)
  {
    return 'надо не больше ' + maximum[1]
  }

  if (size)
  {
    return 'надо от ' + size[1] + ' до ' + size[2] + ' символов'
  }

  return text.charAt(0).toLowerCase() + text.slice(1)
}

export async function errorText(response)
{
  try
  {
    const data = await response.json()

    if (data?.error?.details && typeof data.error.details === 'object')
    {
      const names = {
        isuId: 'номер ису', fullName: 'фио', group: 'группа',
        dormitory: 'общага', room: 'комната', settlementDate: 'дата заселения',
        isForeigner: 'иностранец', notes: 'примечания',
        username: 'логин', email: 'почта', password: 'пароль'
      }

      const fields = Object.entries(data.error.details).filter(([, messages]) => Array.isArray(messages)).map(([name, messages]) =>
      {
        return (names[name] || name) + ': ' + messages.map(messageText).join(', ')
      })

      if (fields.length > 0)
      {
        return fields.join('; ')
      }
    }

    if (data?.error?.message)
    {
      return messageText(data.error.message)
    }
  }
  catch
  {
    // ответ может прийти без jSONion
  }

  if (response.status === 401)
  {
    return 'выйди и зайди нормально'
  }

  if (response.status === 403)
  {
    return 'у миня нет прав'
  }

  if (response.status === 404)
  {
    return 'запись не найдена'
  }

  if (response.status >= 500)
  {
    return 'ооошибка сервера'
  }

  return 'ооооооошибка запроса: ' + response.status
}
