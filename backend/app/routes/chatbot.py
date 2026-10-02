from fastapi import APIRouter
from app.models import ChatRequest, ChatResponse
from app.services.chatbot import process_chat_message

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])

@router.post("", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    return process_chat_message(
        message=req.message,
        context=req.context,
        profile=req.profile,
        lang_pref=req.language
    )
