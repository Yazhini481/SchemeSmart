import base64
import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field
from sarvamai import SarvamAI

router = APIRouter(prefix="/voice", tags=["Voice"])


class SpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2500)
    language: str = "ta"


@router.post("/speak")
def speak(request: SpeechRequest):
    if request.language != "ta":
        raise HTTPException(status_code=400, detail="This voice endpoint currently supports Tamil only.")

    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="Tamil voice service is not configured.")

    try:
        client = SarvamAI(api_subscription_key=api_key)
        result = client.text_to_speech.convert(
            text=request.text,
            language_code="ta-IN",
            speaker="kavitha",
            model="bulbul:v3",
            output_audio_codec="wav",
        )
        if not result.audios:
            raise RuntimeError("Sarvam returned no audio.")
        audio = base64.b64decode(result.audios[0])
        return Response(content=audio, media_type="audio/wav")
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Tamil voice generation failed.") from exc