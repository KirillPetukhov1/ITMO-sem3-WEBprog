from django.http import JsonResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.reverse import reverse
from rest_framework.views import APIView
from .errors import ApplicationError, error_body
from .serializers import validate_isu_id, ListQuerySerializer, StudentSerializer
from .services import (
    get_student, list_students, create_student, update_student, delete_student,
)


class StudentListView(APIView):
    http_method_names = ["get", "query", "post", "head", "options"]

    def get(self, request: Request) -> Response:
        """Вернуть отфильтрованный список студентов.

        Args:
            request: HTTP-запрос с параметрами фильтрации.
        """
        repeated = {k: ["Параметр должен быть указан один раз."] for k in request.query_params
                    if len(request.query_params.getlist(k)) > 1}
        if repeated:
            raise ApplicationError(400, "INVALID_QUERY", "Некорректные параметры запроса.", repeated)
        serializer = ListQuerySerializer(data=request.query_params.dict())
        if not serializer.is_valid():
            raise ApplicationError(400, "INVALID_QUERY", "Некорректные параметры запроса.", serializer.errors)
        return Response(list_students(serializer.validated_data))
    
    def query(self, request: Request) -> Response:
        """Обработать QUERY-запрос так же, как GET.

        Args:
            request: Исходный HTTP-запрос.
        """
        serializer = ListQuerySerializer(data=request.data)
        if not serializer.is_valid():
            raise ApplicationError(400, "INVALID_QUERY", "Некорректные параметры запроса.", serializer.errors)
        params = serializer.validated_data
        page_of_students = list_students(params)
        return Response(page_of_students)

    def post(self, request: Request) -> Response:
        """Создать студента из данных запроса.

        Args:
            request: HTTP-запрос с данными нового студента.
        """
        serializer = StudentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student_data = dict(serializer.validated_data)
        student = create_student(student_data)
        location = reverse("student-detail", kwargs={"isu_id": student["isuId"]}, request=request)
        return Response(student, status=status.HTTP_201_CREATED, headers={"Location": location})


class StudentDetailView(APIView):
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get(self, request: Request, isu_id: str) -> Response:
        """Вернуть студента по ИСУ ID.

        Args:
            request: Исходный HTTP-запрос.
            isu_id: Идентификатор студента.
        """
        validate_isu_id(isu_id)
        return Response(get_student(isu_id))

    def patch(self, request: Request, isu_id: str) -> Response:
        """Частично обновить данные студента.

        Args:
            request: HTTP-запрос с изменяемыми полями.
            isu_id: Идентификатор студента.
        """
        validate_isu_id(isu_id)
        serializer = StudentSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        changes = dict(serializer.validated_data)
        return Response(update_student(isu_id, changes))

    def delete(self, request: Request, isu_id: str) -> Response:
        """Удалить студента по ИСУ ID.

        Args:
            request: Исходный HTTP-запрос.
            isu_id: Идентификатор студента.
        """
        validate_isu_id(isu_id)
        delete_student(isu_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


def unknown_api(request: Request) -> JsonResponse:
    """Вернуть ошибку для неизвестного API-адреса.

    Args:
        request: Исходный HTTP-запрос.
    """
    return JsonResponse(error_body("NOT_FOUND", "Адрес API не найден."), status=404)
