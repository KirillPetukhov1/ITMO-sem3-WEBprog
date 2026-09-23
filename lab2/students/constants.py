DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 100
MAX_PAGE_NUMBER = 2_147_483_647
LOCK_TIMEOUT_SECONDS = 10
GROUP_PATTERN = r"\A[A-Z][0-9]{4}\Z"
ISU_PATTERN = r"\A[0-9]{6}\Z"
SORT_FIELDS = (
    "fullName", "group", "isuId", "dormitory", "room",
    "settlementDate", "isForeigner", "notes",
)
