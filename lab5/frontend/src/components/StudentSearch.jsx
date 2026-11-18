'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap';

import { SORT_OPTIONS } from '../lib/query.js';
import useStudentsQuery from './useStudentsQuery.js';

const SEARCH_DELAY = 300;

// поиск по ФИО + сортировка. поиск срабатывает сам через 300 мс после ввода
export default function StudentSearch() {
  const { query, update, pending } = useStudentsQuery();
  const [fullName, setFullName] = useState(query.fullName ?? '');
  const timer = useRef(null);
  const urlName = query.fullName ?? '';

  // в url поменялось имя не из этого поля (кнопка «назад», «сбросить») —
  // подтягиваем значение в поле
  const [seenUrlName, setSeenUrlName] = useState(urlName);
  if (seenUrlName !== urlName) {
    setSeenUrlName(urlName);
    if (fullName.trim() !== urlName) {
      setFullName(urlName);
    }
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  function search(value, replace) {
    clearTimeout(timer.current);
    update({ fullName: value.trim() }, { replace });
  }

  function handleChange(event) {
    const value = event.target.value;
    setFullName(value);
    clearTimeout(timer.current);
    // replace, чтобы каждая буква не оставалась в истории браузера
    timer.current = setTimeout(() => search(value, true), SEARCH_DELAY);
  }

  function handleSubmit(event) {
    event.preventDefault();
    search(fullName, false);
  }

  return (
    <>
      <Form onSubmit={handleSubmit} className="mb-3" role="search">
        <InputGroup>
          <Form.Control
            name="fullName"
            type="search"
            maxLength={100}
            placeholder="Поиск по ФИО"
            aria-label="ФИО студента"
            value={fullName}
            onChange={handleChange}
          />
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner animation="border" size="sm" /> : 'Найти'}
          </Button>
        </InputGroup>
      </Form>

      <Row className="g-2 mb-3">
        <Col sm={6}>
          <Form.Group controlId="sortField">
            <Form.Label className="small text-muted mb-1">Сортировать по</Form.Label>
            <Form.Select
              size="sm"
              value={query.sortBy ?? 'isuId'}
              onChange={(event) => update({ sortBy: event.target.value })}
            >
              {SORT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col sm={6}>
          <Form.Group controlId="orderField">
            <Form.Label className="small text-muted mb-1">Порядок</Form.Label>
            <Form.Select
              size="sm"
              value={query.order ?? 'asc'}
              onChange={(event) => update({ order: event.target.value })}
            >
              <option value="asc">по возрастанию</option>
              <option value="desc">по убыванию</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </>
  );
}
