from .exceptions import ApplicationError
from .pagination import paginate_students


def find_student(students, isu_id):
    for student in students:
        if student["isuId"] == isu_id:
            return student
    raise ApplicationError(404, "STUDENT_NOT_FOUND", "Студент не найден.")


class StudentService:
    def __init__(self, repository):
        self.repository = repository

    def get(self, isu_id):
        return find_student(self.repository.read_all(), isu_id)

    def list(self, params):
        students = self.repository.read_all()
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
        return paginate_students(students, params["page"], params["page_size"])

    def create(self, student):
        with self.repository.edit() as students:
            if any(s["isuId"] == student["isuId"] for s in students):
                raise ApplicationError(409, "ISU_CONFLICT", "ИСУ ID уже существует.",
                                       {"isuId": ["Студент с таким ИСУ ID уже существует."]})
            students.append(student)
        return student

    def update(self, isu_id, changes):
        with self.repository.edit() as students:
            student = find_student(students, isu_id)
            if "isuId" in changes:
                raise ApplicationError(422, "IMMUTABLE_ISU_ID", "ИСУ ID нельзя изменить.",
                                       {"isuId": ["Идентификатор студента неизменяем."]})
            student.update(changes)
        return student

    def delete(self, isu_id):
        with self.repository.edit() as students:
            students.remove(find_student(students, isu_id))
