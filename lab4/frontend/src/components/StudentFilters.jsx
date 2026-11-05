export default function StudentFilters({ onNameChange, onApply }) {
  function handleSubmit(event) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)
    const filters = {}

    for (const name of ['group', 'isuId', 'dormitory', 'room', 'settlementDate', 'isForeigner', 'notes']) {
      filters[name] = String(data.get(name) || '').trim()
    }

    onApply(filters)
  }

  function handleReset(event) 
  {
    // чистим и форму, и применённые фильтры
    event.currentTarget.form.reset()
    onNameChange('')
    onApply({})
  }

  return (
    <section>
      <h2>фильтры</h2>

      <form onSubmit={handleSubmit} className="filter-form">
        <label htmlFor="groupFilter">группа</label>
        <input id="groupFilter" name="group" type="text" maxLength={5}
          pattern="[A-Z][0-9]{4}" title="большая латинская буква и 4 цифры, типа A1234" />

        <label htmlFor="isuFilter">номер ису</label>
        <input id="isuFilter" name="isuId" type="number" min="100000" max="999999" />

        <label htmlFor="dormitoryFilter">общага</label>
        <input id="dormitoryFilter" name="dormitory" type="number" min="1" max="99" />

        <label htmlFor="roomFilter">комната</label>
        <input id="roomFilter" name="room" type="number" min="1" max="9999" />

        <label htmlFor="dateFilter">дата заселения</label>
        <input id="dateFilter" name="settlementDate" type="date" min="2000-01-01" />

        <label htmlFor="foreignerFilter">иностранец</label>
        <select id="foreignerFilter" name="isForeigner" defaultValue="">
          <option value="">любой</option>
          <option value="true">да</option>
          <option value="false">нет</option>
        </select>

        <label htmlFor="notesFilter">примечания</label>
        <input id="notesFilter" name="notes" type="search" maxLength={500} />

        <div className="actions">
          <button type="submit">применить фильтры</button>
          <button type="button" onClick={handleReset}>сбросить</button>
        </div>
      </form>
    </section>
  )
}
