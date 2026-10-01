from django.urls import path, re_path
from .views import StudentDetailView, StudentListView, unknown_api

urlpatterns = [
    path("students", StudentListView.as_view(), name="student-list"),
    path("students/<str:isu_id>", StudentDetailView.as_view(), name="student-detail"),
    re_path(r"^.*$", unknown_api),
]
