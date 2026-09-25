from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", protected_namespaces=("settings_",))

    host: str = "0.0.0.0"
    port: int = 8000
    internal_api_key: str = "changeme-internal-key"
    mock_model: bool = True
    model_path: str = "artifacts/model.torchscript.pt"
    labels_path: str = "artifacts/labels.json"
    model_version: str = "dev-mock"
    max_upload_mb: int = 5


settings = Settings()
