import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "local-student-lab-development-key")
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]
ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
INSTALLED_APPS = ["django.contrib.staticfiles", "rest_framework", "students"]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
]
APPEND_SLASH = False
DATABASES = {}
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [BASE_DIR / "frontend" / "templates"],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": []},
}]
STATIC_URL = "/static/"
STATICFILES_DIRS = [
    BASE_DIR / "frontend" / "static",
    ("resources", BASE_DIR / "frontend" / "resources")
]
LANGUAGE_CODE = "ru-ru"
TIME_ZONE = "UTC"
USE_TZ = True
DATA_UPLOAD_MAX_MEMORY_SIZE = 64 * 1024
STUDENTS_FILE = Path(os.environ.get("STUDENTS_FILE", BASE_DIR / "data" / "students.json"))
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "UNAUTHENTICATED_USER": None,
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "EXCEPTION_HANDLER": "students.error_handlers.api_exception_handler",
}
