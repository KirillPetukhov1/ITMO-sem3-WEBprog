from .exceptions import ApplicationError


def paginate_students(students, page, page_size):
    """Выделить страницу уже отфильтрованного и отсортированного списка.

    page и page_size предварительно проверяются ListQuerySerializer.
    next и previous - номера страниц или null.
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
