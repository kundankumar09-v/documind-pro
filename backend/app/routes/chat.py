from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_ollama import ChatOllama
from app.services.vector_store import VectorStoreService

router = APIRouter(prefix="/api", tags=["Chat"])
vector_service = VectorStoreService()

class IsolatedChatRequest(BaseModel):
    question: str
    session_id: str

@router.post("/chat")
async def chat_with_documents(request: IsolatedChatRequest):
    try:
        parent_docs = vector_service.similarity_search_isolated(
            query=request.question,
            session_id=request.session_id,
            k=7,
        )

        if not parent_docs:
            return {
                "answer": "The provided document segments do not contain the necessary data to answer this question.",
                "citations": [],
            }

        context_blocks = []
        citations = []
        total_context_length = 0
        context_char_limit = 5000

        for doc in parent_docs:
            doc_length = len(doc.page_content)
            if total_context_length + doc_length > context_char_limit:
                break
            context_blocks.append(doc.page_content)
            total_context_length += doc_length
            source = doc.metadata.get("source") if doc.metadata else None
            if source and source not in citations:
                citations.append(source)

        context = "\n\n---\n\n".join(context_blocks)

        system_prompt = (
            "You are DocuMind, an offline document analysis engine. Answer only from the provided document context. "
            "Do not invent facts, do not add conversational filler, and do not summarize beyond the evidence.\n\n"
            "If the evidence required to answer the question is missing from the provided document segments, output exactly: "
            "The provided document segments do not contain the necessary data to answer this question.\n\n"
            "Response rules:\n"
            "- Use bold subtitles when helpful.\n"
            "- Provide concise bullet-point analysis.\n"
            "- Avoid any language such as 'Based on the text'.\n\n"
            f"DOCUMENT CONTEXT:\n{context}\n\n"
            f"USER QUESTION: {request.question}"
        )

        llm = ChatOllama(model="gemma2:2b", temperature=0.0, num_ctx=8192)
        response = llm.invoke(system_prompt)

        return {
            "answer": response.content,
            "citations": citations,
        }

    except Exception as exc:
        print(f"CRITICAL CHAT EXCEPTION: {str(exc)}")
        raise HTTPException(
            status_code=500,
            detail=f"Inference pipeline error: {str(exc)}",
        )