from django.urls import include, path
from django.views.generic import TemplateView

urlpatterns = [
    path("", TemplateView.as_view(template_name="main.html"), name="home"),
    path("api/", include("students.urls")),
]
handler400 = "students.error_handlers.bad_request"
handler404 = "students.error_handlers.not_found"
handler500 = "students.error_handlers.server_error"
