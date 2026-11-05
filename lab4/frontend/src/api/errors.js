export function messageText(message) {
  const text = String(message)
  const messages = {
    'Имя пользователя уже занято': 'Имя пользователя уже занято',
    'Email уже используется': 'Email уже используется',
    'Имя пользователя или email уже используется': 'Имя пользователя или email уже используется',
    'Неверное имя пользователя или пароль': 'Неверное имя пользователя или пароль',
    'Недостаточно прав': 'Недостаточно прав',
    'Студент не найден': 'Студент не найден',
    'Страница не существует': 'Страница не существует',
    'ИСУ ID нельзя изменить': 'ИСУ ID нельзя изменить',
    'Идентификатор студента неизменяем': 'Идентификатор студента неизменяем',
    'ИСУ ID уже существует': 'ИСУ ID уже существует',
    'Студент с таким ИСУ ID уже существует': 'Студент с таким ИСУ ID уже существует',
    'Обязательное поле': 'Обязательное поле',
    'Ожидается 6 цифр': 'Ожидается 6 цифр',
    'Длина ФИО должна быть от 5 до 100 символов': 'Длина ФИО должна быть от 5 до 100 символов',
    'Ожидается заглавная латинская буква и 4 цифры': 'Ожидается заглавная латинская буква и 4 цифры',
    'Дата должна быть не раньше 2000-01-01': 'Дата должна быть не раньше 2000-01-01',
    'Пароль должен занимать не более 72 байт UTF-8': 'Пароль должен занимать не более 72 байт UTF-8',
    'Username: 3–50 латинских букв, цифр, точек, дефисов или подчёркиваний': 'Username: 3–50 латинских букв, цифр, точек, дефисов или подчёркиваний',
    'Проверьте введенные данные': 'Проверьте введенные данные',
    'Некорректные параметры запроса': 'Некорректные параметры запроса',
    'Неверный тип или формат JSON-значения': 'Неверный тип или формат JSON-значения',
    'Внутренняя ошибка сервера': 'Внутренняя ошибка сервера',
    'Сессия отсутствует': 'Сессия отсутствует',
    'Refresh-токен недействителен или истёк': 'Refresh-токен недействителен или истёк',
    'must not be blank': 'тут пусто, заполни',
    'must not be null': 'тут пусто, заполни',
    'must be a well-formed email address': 'почта какая-то не такая, проверь адрес'
  }

  if (messages[text]) {
    return messages[text]
  }

  const minimum = text.match(/^must be greater than or equal to (\d+)$/)
  const maximum = text.match(/^must be less than or equal to (\d+)$/)
  const size = text.match(/^size must be between (\d+) and (\d+)$/)

  if (minimum) {
    return 'надо не меньше ' + minimum[1]
  }

  if (maximum) {
    return 'надо не больше ' + maximum[1]
  }

  if (size) {
    return 'надо от ' + size[1] + ' до ' + size[2] + ' символов'
  }

  return text.charAt(0).toLowerCase() + text.slice(1)
}

export async function errorText(response) {
  try {
    const data = await response.json()

    if (data?.error?.details && typeof data.error.details === 'object') {
      const names = {
        isuId: 'номер ису', fullName: 'фио', group: 'группа',
        dormitory: 'общага', room: 'комната', settlementDate: 'дата заселения',
        isForeigner: 'иностранец', notes: 'примечания',
        username: 'логин', email: 'почта', password: 'пароль'
      }

      const fields = Object.entries(data.error.details).filter(([, messages]) => Array.isArray(messages)).map(([name, messages]) => {
        return (names[name] || name) + ': ' + messages.map(messageText).join(', ')
      })

      if (fields.length > 0) {
        return fields.join('; ')
      }
    }

    if (data?.error?.message) {
      return messageText(data.error.message)
    }
  }
  catch {
    // ответ может прийти без jSONion
  }

  if (response.status === 401) {
    return 'выйди и зайди нормально'
  }

  if (response.status === 403) {
    return 'у миня нет прав'
  }

  if (response.status === 404) {
    return 'запись не найдена'
  }

  if (response.status >= 500) {
    return 'ооошибка сервера'
  }

  return 'ооооооошибка запроса: ' + response.status
}
