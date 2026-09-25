from pydantic import BaseModel


class Prediction(BaseModel):
    label: str
    confidence: float


class PredictResponse(BaseModel):
    predictions: list[Prediction]
    modelVersion: str
    inferenceMs: float


class HealthResponse(BaseModel):
    status: str
    modelLoaded: bool
    mockMode: bool
    modelVersion: str
    numClasses: int
