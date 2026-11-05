export default function StudentForm({ student = null, onSubmit, submitting, buttonText }) {
  function handleSubmit(event) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)
    // собираем поля, потом пакуем в post или patch
    const values = {
      fullName: String(data.get('fullName')).trim(),
      group: String(data.get('group')).trim(),
      dormitory: Number(data.get('dormitory')),
      room: Number(data.get('room')),
      settlementDate: String(data.get('settlementDate')),
      isForeigner: data.get('isForeigner') === 'true',
      notes: String(data.get('notes')).trim()
    }

    if (student === null) {
      // ису шлём только новенькому, старому менять нельзя
      values.isuId = Number(data.get('isuId'))
    }

    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="student-form">
      <label htmlFor="isuField">номер ису</label>
      <input id="isuField" name="isuId" type="number" min="100000" max="999999"
        defaultValue={student?.isuId || ''} disabled={student !== null} required />

      <label htmlFor="nameField">фио</label>
      <input id="nameField" name="fullName" type="text" minLength={5} maxLength={100}
        defaultValue={student?.fullName || ''} required />

      <label htmlFor="groupField">группа</label>
      <input id="groupField" name="group" type="text" pattern="[A-Z][0-9]{4}"
        title="большая латинская буква и 4 цифры, типа A1234" defaultValue={student?.group || ''} required />

      <label htmlFor="dormitoryField">общага</label>
      <input id="dormitoryField" name="dormitory" type="number" min="1" max="99"
        defaultValue={student?.dormitory || ''} required />

      <label htmlFor="roomField">комната</label>
      <input id="roomField" name="room" type="number" min="1" max="9999"
        defaultValue={student?.room || ''} required />

      <label htmlFor="dateField">дата заселения</label>
      <input id="dateField" name="settlementDate" type="date" min="2000-01-01"
        defaultValue={student?.settlementDate || ''} required />

      <label htmlFor="foreignerField">иностранец</label>
      <select id="foreignerField" name="isForeigner"
        defaultValue={String(student?.isForeigner ?? false)}>
        <option value="false">нет</option>
        <option value="true">да</option>
      </select>

      <label htmlFor="notesField">примечания</label>
      <textarea id="notesField" name="notes" maxLength={500}
        defaultValue={student?.notes || ''} />

      <button type="submit" disabled={submitting}>
        {submitting ? 'сохраняем...' : buttonText}
      </button>
    </form>
  )
}
