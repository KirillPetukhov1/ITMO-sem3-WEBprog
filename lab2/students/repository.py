import json
import os
import tempfile
from contextlib import contextmanager
from pathlib import Path
from filelock import FileLock
from .constants import LOCK_TIMEOUT_SECONDS


class JsonStudentRepository:
    """Чтение и атомарная запись; блокировка действует между потоками и процессами."""

    def __init__(self, path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.lock = FileLock(str(self.path) + ".lock", timeout=LOCK_TIMEOUT_SECONDS)

    def _read(self):
        if not self.path.exists():
            return []
        with self.path.open(encoding="utf-8") as file:
            students = json.load(file)
        if not isinstance(students, list) or any(not isinstance(s, dict) for s in students):
            raise ValueError("В хранилище ожидается массив объектов студентов.")
        return students

    def _write(self, students):
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w", encoding="utf-8", dir=self.path.parent,
                prefix=self.path.name + ".", suffix=".tmp", delete=False,
            ) as file:
                temporary = Path(file.name)
                json.dump(students, file, ensure_ascii=False, indent=2)
                file.write("\n")
                file.flush()
                os.fsync(file.fileno())
            os.replace(temporary, self.path)
        finally:
            if temporary is not None:
                temporary.unlink(missing_ok=True)

    def read_all(self):
        with self.lock:
            return self._read()

    @contextmanager
    def edit(self):
        with self.lock:
            students = self._read()
            yield students
            self._write(students)
