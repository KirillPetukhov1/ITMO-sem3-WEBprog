class ApplicationError(Exception):
    """Ошибка сервиса, не зависящая от DRF."""

    def __init__(self, status, code, message, details=None):
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message
        self.details = details or {}
