from datetime import date
from rest_framework import serializers
from .constants import (
    DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MAX_PAGE_NUMBER,
    GROUP_PATTERN, ISU_PATTERN, SORT_FIELDS,
)


class KnownFieldsSerializer(serializers.Serializer):
    def to_internal_value(self, data):
        if isinstance(data, dict):
            unknown = set(data) - set(self.fields)
            if unknown:
                raise serializers.ValidationError({key: ["Неизвестное поле."] for key in sorted(unknown)})
        return super().to_internal_value(data)


class StudentSerializer(KnownFieldsSerializer):
    fullName = serializers.CharField(min_length=5, max_length=100)
    group = serializers.RegexField(GROUP_PATTERN, max_length=5)
    isuId = serializers.RegexField(ISU_PATTERN, max_length=6)
    dormitory = serializers.IntegerField(min_value=1, max_value=99)
    room = serializers.IntegerField(min_value=1, max_value=9999)
    settlementDate = serializers.DateField(input_formats=["%Y-%m-%d"])
    isForeigner = serializers.BooleanField()
    notes = serializers.CharField(max_length=500, allow_blank=True, required=False, default="")

    def to_internal_value(self, data):
        if isinstance(data, dict):
            types = {"dormitory": int, "room": int, "isForeigner": bool}
            errors = {}
            for key, value in data.items():
                if key in self.fields and type(value) is not types.get(key, str):
                    errors[key] = ["Неверный тип JSON-значения."]
            if errors:
                raise serializers.ValidationError(errors)
        return super().to_internal_value(data)

    def validate_settlementDate(self, value):
        if value < date(2000, 1, 1):
            raise serializers.ValidationError("Дата должна быть не раньше 2000-01-01.")
        return value


class ListQuerySerializer(KnownFieldsSerializer):
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

    def validate_isForeigner(self, value):
        return value == "true"

    def validate(self, attrs):
        if "settlementDate" in attrs:
            attrs["settlementDate"] = attrs["settlementDate"].isoformat()
        return attrs
