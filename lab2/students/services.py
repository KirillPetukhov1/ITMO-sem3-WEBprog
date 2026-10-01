from typing import Any, TypeAlias

from .errors import ApplicationError
from .storage import edit_students, read_students

Student: TypeAlias = dict[str, Any]
PaginationResult: TypeAlias = dict[str, Any]


def _find_student(students: list[Student], isu_id: str) -> Student:
    """Найти студента по ИСУ ID.

    Args:
        students: Список студентов для поиска.
        isu_id: Идентификатор искомого студента.
    """
    for student in students:
        if student["isuId"] == isu_id:
            return student
    raise ApplicationError(404, "STUDENT_NOT_FOUND", "Студент не найден.")


def get_student(isu_id: str) -> Student:
    """Получить студента из хранилища.

    Args:
        isu_id: Идентификатор искомого студента.
    """
    return _find_student(read_students(), isu_id)


def list_students(params: dict[str, Any]) -> PaginationResult:
    """Отфильтровать, отсортировать и разбить список на страницы.

    Args:
        params: Проверенные параметры фильтрации и пагинации.
    """
    students = read_students()
    for field in ("fullName", "notes"):
        if field in params:
            needle = params[field].casefold()
            students = [s for s in students if needle in s[field].casefold()]
    for field in ("group", "isuId", "dormitory", "room", "settlementDate", "isForeigner"):
        if field in params:
            students = [s for s in students if s[field] == params[field]]
    students.sort(key=lambda s: s["isuId"])
    sort_by = params["sortBy"]
    students.sort(
        key=lambda s: s[sort_by].casefold() if isinstance(s[sort_by], str) else s[sort_by],
        reverse=params["order"] == "desc",
    )
    return _paginate(students, params["page"], params["page_size"])


def create_student(student: Student) -> Student:
    """Добавить нового студента.

    Args:
        student: Проверенные данные нового студента.
    """
    with edit_students() as students:
        if any(s["isuId"] == student["isuId"] for s in students):
            raise ApplicationError(409, "ISU_CONFLICT", "ИСУ ID уже существует.",
                                   {"isuId": ["Студент с таким ИСУ ID уже существует."]})
        students.append(student)
    return student


def update_student(isu_id: str, changes: Student) -> Student:
    """Обновить данные существующего студента.

    Args:
        isu_id: Идентификатор изменяемого студента.
        changes: Поля и новые значения.
    """
    with edit_students() as students:
        student = _find_student(students, isu_id)
        if "isuId" in changes:
            raise ApplicationError(422, "IMMUTABLE_ISU_ID", "ИСУ ID нельзя изменить.",
                                   {"isuId": ["Идентификатор студента неизменяем."]})
        student.update(changes)
    return student


def delete_student(isu_id: str) -> None:
    """Удалить студента из хранилища.

    Args:
        isu_id: Идентификатор удаляемого студента.
    """
    with edit_students() as students:
        students.remove(_find_student(students, isu_id))


def _paginate(students: list[Student], page: int, page_size: int) -> PaginationResult:
    """Выделить страницу уже отфильтрованного и отсортированного списка.

    Args:
        students: Отфильтрованный и отсортированный список.
        page: Номер запрашиваемой страницы.
        page_size: Максимальное число студентов на странице.

    ``page`` и ``page_size`` предварительно проверяются ListQuerySerializer.
    ``next`` и ``previous`` — номера страниц или ``None``.
    """
    count = len(students)
    total_pages = max(1, (count + page_size - 1) // page_size)
    if page > total_pages:
        raise ApplicationError(
            404, "PAGE_NOT_FOUND", "Страница не существует.",
            {"total_pages": total_pages},
        )
    start = (page - 1) * page_size
    return {
        "count": count,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "next": page + 1 if page < total_pages else None,
        "previous": page - 1 if page > 1 else None,
        "results": students[start:start + page_size],
    }
