import re
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.views import APIView
from .constants import ISU_PATTERN
from .exceptions import ApplicationError
from .repository import JsonStudentRepository
from .serializers import ListQuerySerializer, StudentSerializer
from .services import StudentService


def get_service():
    return StudentService(JsonStudentRepository(settings.STUDENTS_FILE))


def validate_isu_id(isu_id):
    if not re.fullmatch(ISU_PATTERN, isu_id):
        raise ApplicationError(422, "INVALID_ISU_ID", "ИСУ ID должен содержать ровно 6 цифр.",
                               {"isuId": ["Ожидается 6 цифр."]})


def parse_student(data, partial=False):
    serializer = StudentSerializer(data=data, partial=partial)
    serializer.is_valid(raise_exception=True)
    student = dict(serializer.validated_data)
    if "settlementDate" in student:
        student["settlementDate"] = student["settlementDate"].isoformat()
    return student


class StudentListView(APIView):
    http_method_names = ["get", "post", "head", "options"]

    def get(self, request):
        repeated = {k: ["Параметр должен быть указан один раз."] for k in request.query_params
                    if len(request.query_params.getlist(k)) > 1}
        if repeated:
            raise ApplicationError(400, "INVALID_QUERY", "Некорректные параметры запроса.", repeated)
        serializer = ListQuerySerializer(data=request.query_params.dict())
        if not serializer.is_valid():
            raise ApplicationError(400, "INVALID_QUERY", "Некорректные параметры запроса.", serializer.errors)
        return Response(get_service().list(serializer.validated_data))

    def post(self, request):
        student = get_service().create(parse_student(request.data))
        location = reverse("student-detail", kwargs={"isu_id": student["isuId"]}, request=request)
        return Response(student, status=status.HTTP_201_CREATED, headers={"Location": location})


class StudentDetailView(APIView):
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get(self, request, isu_id):
        validate_isu_id(isu_id)
        return Response(get_service().get(isu_id))

    def patch(self, request, isu_id):
        validate_isu_id(isu_id)
        changes = parse_student(request.data, partial=True)
        return Response(get_service().update(isu_id, changes))

    def delete(self, request, isu_id):
        validate_isu_id(isu_id)
        get_service().delete(isu_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class UnknownApiView(APIView):
    def dispatch(self, request, *args, **kwargs):
        from django.http import JsonResponse
        from .error_handlers import error_body
        return JsonResponse(error_body("NOT_FOUND", "Адрес API не найден."), status=404)
