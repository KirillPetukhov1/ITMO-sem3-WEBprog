import json
import os
import tempfile
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Generator, TypeAlias

from django.conf import settings
from filelock import FileLock

LOCK_TIMEOUT_SECONDS = 10

Student: TypeAlias = dict[str, Any]


def _read() -> list[Student]:
    """Прочитать и проверить список студентов из JSON-файла."""
    path = Path(settings.STUDENTS_FILE)
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as file:
        students = json.load(file)
    if not isinstance(students, list) or any(not isinstance(s, dict) for s in students):
        raise ValueError("В хранилище ожидается массив объектов студентов.")
    return students


def _write(students: list[Student]) -> None:
    """Атомарно записать список студентов в JSON-файл.

    Args:
        students: Полный список студентов для сохранения.
    """
    path = Path(settings.STUDENTS_FILE)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=path.parent,
            prefix=path.name + ".", suffix=".tmp", delete=False,
        ) as file:
            temporary = Path(file.name)
            json.dump(students, file, ensure_ascii=False, indent=2)
            file.write("\n")
            file.flush()
            os.fsync(file.fileno())
        os.replace(temporary, path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def _lock() -> FileLock:
    """Создать файловую блокировку для хранилища студентов."""
    path = Path(settings.STUDENTS_FILE)
    path.parent.mkdir(parents=True, exist_ok=True)
    return FileLock(str(path) + ".lock", timeout=LOCK_TIMEOUT_SECONDS)


def read_students() -> list[Student]:
    """Безопасно прочитать список студентов под блокировкой."""
    with _lock():
        return _read()


@contextmanager
def edit_students() -> Generator[list[Student]]:
    """Предоставить список для изменения и сохранить его после выхода."""
    with _lock():
        students = _read()
        yield students
        _write(students)
