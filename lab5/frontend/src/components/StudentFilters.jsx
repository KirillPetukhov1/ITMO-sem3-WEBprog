'use client';

import { Button, Card, Form, Stack } from 'react-bootstrap';

import { FILTER_FIELDS } from '../lib/query.js';
import useStudentsQuery from './useStudentsQuery.js';

export default function StudentFilters() {
  const { query, update } = useStudentsQuery();

  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const filters = {};
    for (const name of FILTER_FIELDS) {
      filters[name] = String(data.get(name) ?? '').trim();
    }
    update(filters);
  }

  function handleReset() {
    const empty = Object.fromEntries(FILTER_FIELDS.map((name) => [name, '']));
    update({ ...empty, fullName: '' });
  }

  // key: при смене фильтров в url (в т.ч. "назад" в браузере) форма
  // пересоздаётся и подхватывает значения из адреса
  const key = FILTER_FIELDS.map((name) => query[name] ?? '').join('|');

  return (
    <Card>
      <Card.Header as="h2" className="h6 mb-0">
        Фильтры
      </Card.Header>
      <Card.Body>
        <Form key={key} onSubmit={handleSubmit}>
          <Form.Group className="mb-2" controlId="groupFilter">
            <Form.Label className="small mb-1">Группа</Form.Label>
            <Form.Control
              size="sm"
              name="group"
              type="text"
              maxLength={5}
              placeholder="A1234"
              pattern="[A-Z][0-9]{4}"
              title="большая латинская буква и 4 цифры, типа A1234"
              defaultValue={query.group}
            />
          </Form.Group>

          <Form.Group className="mb-2" controlId="isuFilter">
            <Form.Label className="small mb-1">Номер ИСУ</Form.Label>
            <Form.Control
              size="sm"
              name="isuId"
              type="number"
              min="100000"
              max="999999"
              defaultValue={query.isuId}
            />
          </Form.Group>

          <Form.Group className="mb-2" controlId="dormitoryFilter">
            <Form.Label className="small mb-1">Общага</Form.Label>
            <Form.Control
              size="sm"
              name="dormitory"
              type="number"
              min="1"
              max="99"
              defaultValue={query.dormitory}
            />
          </Form.Group>

          <Form.Group className="mb-2" controlId="roomFilter">
            <Form.Label className="small mb-1">Комната</Form.Label>
            <Form.Control
              size="sm"
              name="room"
              type="number"
              min="1"
              max="9999"
              defaultValue={query.room}
            />
          </Form.Group>

          <Form.Group className="mb-2" controlId="dateFilter">
            <Form.Label className="small mb-1">Дата заселения</Form.Label>
            <Form.Control
              size="sm"
              name="settlementDate"
              type="date"
              defaultValue={query.settlementDate}
            />
          </Form.Group>

          <Form.Group className="mb-2" controlId="foreignerFilter">
            <Form.Label className="small mb-1">Иностранец</Form.Label>
            <Form.Select size="sm" name="isForeigner" defaultValue={query.isForeigner ?? ''}>
              <option value="">любой</option>
              <option value="true">да</option>
              <option value="false">нет</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2" controlId="notesFilter">
            <Form.Label className="small mb-1">Примечания</Form.Label>
            <Form.Control
              size="sm"
              name="notes"
              type="search"
              maxLength={500}
              defaultValue={query.notes}
            />
          </Form.Group>

          <Stack direction="horizontal" gap={2} className="mt-3">
            <Button type="submit" size="sm">
              Применить
            </Button>
            <Button type="button" size="sm" variant="outline-secondary" onClick={handleReset}>
              Сбросить
            </Button>
          </Stack>
        </Form>
      </Card.Body>
    </Card>
  );
}
