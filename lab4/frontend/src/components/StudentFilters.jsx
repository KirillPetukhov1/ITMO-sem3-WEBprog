import { Button, Card, Form, Stack } from 'react-bootstrap'

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
    // чистим и форму и фильтры
    event.currentTarget.form.reset()
    onNameChange('')
    onApply({})
  }

  return (
    <Card>
      <Card.Header as="h2" className="h6 mb-0">Фильтры</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2" controlId="groupFilter">
            <Form.Label className="small mb-1">Группа</Form.Label>
            <Form.Control size="sm" name="group" type="text" maxLength={5} placeholder="A1234"
              pattern="[A-Z][0-9]{4}" title="большая латинская буква и 4 цифры, типа A1234" />
          </Form.Group>

          <Form.Group className="mb-2" controlId="isuFilter">
            <Form.Label className="small mb-1">Номер ИСУ</Form.Label>
            <Form.Control size="sm" name="isuId" type="number" min="100000" max="999999" />
          </Form.Group>

          <Form.Group className="mb-2" controlId="dormitoryFilter">
            <Form.Label className="small mb-1">Общага</Form.Label>
            <Form.Control size="sm" name="dormitory" type="number" min="1" max="99" />
          </Form.Group>

          <Form.Group className="mb-2" controlId="roomFilter">
            <Form.Label className="small mb-1">Комната</Form.Label>
            <Form.Control size="sm" name="room" type="number" min="1" max="9999" />
          </Form.Group>

          <Form.Group className="mb-2" controlId="dateFilter">
            <Form.Label className="small mb-1">Дата заселения</Form.Label>
            <Form.Control size="sm" name="settlementDate" type="date" min="2000-01-01" />
          </Form.Group>

          <Form.Group className="mb-2" controlId="foreignerFilter">
            <Form.Label className="small mb-1">Иностранец</Form.Label>
            <Form.Select size="sm" name="isForeigner" defaultValue="">
              <option value="">любой</option>
              <option value="true">да</option>
              <option value="false">нет</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2" controlId="notesFilter">
            <Form.Label className="small mb-1">Примечания</Form.Label>
            <Form.Control size="sm" name="notes" type="search" maxLength={500} />
          </Form.Group>

          <Stack direction="horizontal" gap={2} className="mt-3">
            <Button type="submit" size="sm">Применить</Button>
            <Button type="button" size="sm" variant="outline-secondary" onClick={handleReset}>Сбросить</Button>
          </Stack>
        </Form>
      </Card.Body>
    </Card>
  )
}