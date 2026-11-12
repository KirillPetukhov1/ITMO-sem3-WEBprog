import { Observable, EMPTY, merge, of, timer, fromEvent, defer } from 'rxjs';
import {
  switchMap,
  exhaustMap,
  map,
  distinctUntilChanged,
  catchError,
  startWith,
} from 'rxjs/operators';

export function requestObservable(load) {
  return new Observable((subscriber) => {
    const controller = new AbortController();
    function onSuccess(value) {
      if (subscriber.closed) {
        return;
      }
      subscriber.next(value);
      subscriber.complete();
    }
    function onError(error) {
      if (!subscriber.closed) {
        subscriber.error(error);
      }
    }
    Promise.resolve()
      .then(() => load(controller.signal))
      .then(onSuccess, onError);
    return () => controller.abort();
  });
}

export function visibilityEvents(doc = globalThis.document) {
  if (!doc) {
    return of(true);
  }
  return fromEvent(doc, 'visibilitychange').pipe(
    map(() => !doc.hidden),
    startWith(!doc.hidden),
    distinctUntilChanged(),
  );
}

function loadResource(query, load) {
  return defer(() =>
    requestObservable((signal) => load(query, signal)).pipe(
      map((data) => ({
        kind: 'data',
        data,
      })),
      catchError((error) =>
        of({
          kind: 'error',
          error,
        }),
      ),
      startWith({
        kind: 'loading',
      }),
    ),
  );
}

function pollResource(query, options) {
  const { visible$, changes$, load, pollInterval } = options;

  function observeVisibility(visible) {
    if (!visible) {
      return EMPTY;
    }
    const triggers$ = merge(timer(0, pollInterval), changes$);
    return triggers$.pipe(exhaustMap(() => loadResource(query, load)));
  }
  return visible$.pipe(switchMap(observeVisibility));
}

function sameQuery(previous, current) {
  return JSON.stringify(previous) === JSON.stringify(current);
}

export function resourceStream({
  query$,
  active$,
  visible$ = visibilityEvents(),
  changes$,
  load,
  pollInterval,
  searchDelay = 300,
}) {
  let previousQuery;
  const pollingOptions = {
    visible$,
    changes$,
    load,
    pollInterval,
  };

  function observeQuery(query) {
    let delay = 0;
    if (previousQuery && previousQuery.fullName !== query.fullName) {
      delay = searchDelay;
    }
    previousQuery = query;

    return timer(delay).pipe(
      switchMap(() => pollResource(query, pollingOptions)),
      startWith({
        kind: 'query',
      }),
    );
  }

  function observeSession(active) {
    if (!active) {
      return of({
        kind: 'clear',
      });
    }
    return query$.pipe(distinctUntilChanged(sameQuery), switchMap(observeQuery));
  }
  return active$.pipe(distinctUntilChanged(), switchMap(observeSession));
}
