from fastapi import Header, HTTPException, status

from app.config import settings


def verify_internal_key(x_internal_key: str | None = Header(default=None, alias="X-Internal-Key")) -> None:
    """This service is never exposed publicly — only the Node API calls it,
    presenting the shared internal key. Anything else is rejected."""
    if not x_internal_key or x_internal_key != settings.internal_api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing internal API key")
