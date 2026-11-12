import { Button, Form } from 'react-bootstrap'

export default function StudentForm({ student = null, onSubmit, submitting, buttonText }) {
  function handleSubmit(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const values = {
      fullName: data.get('fullName').trim(),
      group: data.get('group').trim(),
      dormitory: Number(data.get('dormitory')),
      room: Number(data.get('room')),
      settlementDate: data.get('settlementDate'),
      isForeigner: data.get('isForeigner') === 'true',
      notes: data.get('notes').trim()
    }
    if (student === null) {
      values.isuId = Number(data.get('isuId'))
    }
    onSubmit(values)
  }
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="isuField">
        <Form.Label>Номер ИСУ</Form.Label>
        <Form.Control
          name="isuId"
          type="number"
          min="100000"
          max="999999"
          required
          defaultValue={student?.isuId}
          disabled={student !== null}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="nameField">
        <Form.Label>ФИО</Form.Label>
        <Form.Control
          name="fullName"
          minLength={5}
          maxLength={100}
          pattern="[A-Za-zА-Яа-яЁё]+(-[A-Za-zА-Яа-яЁё]+)*( [A-Za-zА-Яа-яЁё]+(-[A-Za-zА-Яа-яЁё]+)*)*"
          required
          defaultValue={student?.fullName}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="groupField">
        <Form.Label>Группа</Form.Label>
        <Form.Control
          name="group"
          pattern="[A-Z][0-9]{4}"
          placeholder="A1234"
          required
          title="большая латинская буква и 4 цифры"
          defaultValue={student?.group}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="dormitoryField">
        <Form.Label>Общага</Form.Label>
        <Form.Control
          name="dormitory"
          type="number"
          min="1"
          max="99"
          required
          defaultValue={student?.dormitory}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="roomField">
        <Form.Label>Комната</Form.Label>
        <Form.Control
          name="room"
          type="number"
          min="1"
          max="9999"
          required
          defaultValue={student?.room}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="dateField">
        <Form.Label>Дата заселения</Form.Label>
        <Form.Control
          name="settlementDate"
          type="date"
          min="2000-01-01"
          required
          defaultValue={student?.settlementDate}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="foreignerField">
        <Form.Label>Иностранец</Form.Label>
        <Form.Select name="isForeigner" defaultValue={String(student?.isForeigner ?? false)}>
          <option value="false">нет</option>
          <option value="true">да</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3" controlId="notesField">
        <Form.Label>Примечания</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="notes"
          maxLength={500}
          defaultValue={student?.notes}
        />
      </Form.Group>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Сохраняем...' : buttonText}
      </Button>
    </Form>
  )
}
