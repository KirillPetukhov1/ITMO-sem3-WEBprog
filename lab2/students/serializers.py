from datetime import date
from rest_framework import serializers
import re
from typing import Any, Iterable

DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 100
MAX_PAGE_NUMBER = 2_147_483_647
GROUP_PATTERN = r"\A[A-Z][0-9]{4}\Z"
ISU_PATTERN = r"\A[0-9]{6}\Z"
SORT_FIELDS = (
    "fullName", "group", "isuId", "dormitory", "room",
    "settlementDate", "isForeigner", "notes",
)


def _validate_known_fields(data: Any, fields: Iterable[str]) -> None:
    """Проверить, что во входных данных нет неизвестного поля.

    Args:
        data: Проверяемые входные данные.
        fields: Имена разрешённых полей.
    """
    if isinstance(data, dict):
        unknown = set(data) - set(fields)
        if unknown:
            raise serializers.ValidationError({key: ["Неизвестное поле."] for key in sorted(unknown)})


def validate_isu_id(isu_id: str) -> None:
    """Проверить, что ИСУ ID состоит ровно из шести цифр.

    Args:
        isu_id: Проверяемый идентификатор студента.
    """
    if not re.fullmatch(ISU_PATTERN, isu_id):
        raise serializers.ValidationError(422, "INVALID_ISU_ID", "ИСУ ID должен содержать ровно 6 цифр.",
                               {"isuId": ["Ожидается 6 цифр."]})


class StudentSerializer(serializers.Serializer):
    fullName = serializers.CharField(min_length=5, max_length=100)
    group = serializers.RegexField(GROUP_PATTERN, max_length=5)
    isuId = serializers.RegexField(ISU_PATTERN, max_length=6)
    dormitory = serializers.IntegerField(min_value=1, max_value=99)
    room = serializers.IntegerField(min_value=1, max_value=9999)
    settlementDate = serializers.DateField(input_formats=["%Y-%m-%d"])
    isForeigner = serializers.BooleanField()
    notes = serializers.CharField(max_length=500, allow_blank=True, required=False, default="")

    def to_internal_value(self, data) -> dict[str, Any]:
        """Проверить JSON-типы и преобразовать данные студента.

        Args:
            data: Необработанные данные запроса.
        """
        if isinstance(data, dict):
            types = {"dormitory": int, "room": int, "isForeigner": bool}
            errors = {}
            for key, value in data.items():
                if key in self.fields and type(value) is not types.get(key, str):
                    errors[key] = ["Неверный тип JSON-значения."]
            if errors:
                raise serializers.ValidationError(errors)
        _validate_known_fields(data, self.fields)
        return super().to_internal_value(data)

    def validate_settlementDate(self, value: date) -> str:
        """Проверить дату заселения и вернуть её в формате ISO.

        Args:
            value: Дата заселения студента.
        """
        if value < date(2000, 1, 1):
            raise serializers.ValidationError("Дата должна быть не раньше 2000-01-01.")
        return value.isoformat()


class ListQuerySerializer(serializers.Serializer):
    fullName = serializers.CharField(required=False, max_length=100)
    group = serializers.RegexField(GROUP_PATTERN, required=False, max_length=5)
    isuId = serializers.RegexField(ISU_PATTERN, required=False, max_length=6)
    dormitory = serializers.IntegerField(required=False, min_value=1, max_value=99)
    room = serializers.IntegerField(required=False, min_value=1, max_value=9999)
    settlementDate = serializers.DateField(required=False, input_formats=["%Y-%m-%d"])
    isForeigner = serializers.ChoiceField(choices=["true", "false"], required=False)
    notes = serializers.CharField(required=False, max_length=500)
    sortBy = serializers.ChoiceField(choices=SORT_FIELDS, default="isuId")
    order = serializers.ChoiceField(choices=["asc", "desc"], default="asc")
    page = serializers.IntegerField(min_value=1, max_value=MAX_PAGE_NUMBER, default=1)
    page_size = serializers.IntegerField(min_value=1, max_value=MAX_PAGE_SIZE, default=DEFAULT_PAGE_SIZE)

    def to_internal_value(self, data) -> dict[str, Any]:
        """Проверить и преобразовать параметры списка студентов.

        Args:
            data: Необработанные query-параметры.
        """
        _validate_known_fields(data, self.fields)
        return super().to_internal_value(data)

    def validate_isForeigner(self, value: str) -> bool:
        """Преобразовать строковое значение в логическое.

        Args:
            value: Строка ``true`` или ``false``.
        """
        return value == "true"

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        """Подготовить проверенные параметры фильтрации.

        Args:
            attrs: Параметры после проверки отдельных полей.
        """
        if "settlementDate" in attrs:
            attrs["settlementDate"] = attrs["settlementDate"].isoformat()
        return attrs
