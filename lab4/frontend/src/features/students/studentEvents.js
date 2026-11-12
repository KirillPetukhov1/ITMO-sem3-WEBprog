import { Subject } from 'rxjs'
// Только уведомления о подтверждённых сервером изменениях, не хранилище данных.

export const studentChanges = new Subject()
