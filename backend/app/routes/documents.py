from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.parser import DocumentParser
from app.services.vector_store import VectorStoreService

router = APIRouter(prefix="/api", tags=["Documents"])
vector_service = VectorStoreService()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    session_id: str = Form(...)
):
    filename = file.filename or "unnamed_file"
    extension = filename.split(".")[-1].lower() if "." in filename else ""

    if extension not in ["pdf", "docx"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    try:
        file_bytes = await file.read()

        if extension == "pdf":
            parsed_data = DocumentParser.parse_pdf_advanced(file_bytes)
        else:
            parsed_data = DocumentParser.parse_docx_advanced(file_bytes)

        if not parsed_data or not parsed_data.get("text"):
            raise HTTPException(status_code=422, detail="No readable text detected in document.")

        indexed_chunks = vector_service.add_document(
            text=parsed_data["text"],
            filename=filename,
            session_id=session_id,
        )

        return {
            "filename": filename,
            "page_count": parsed_data.get("page_count", 1),
            "indexed_chunks": indexed_chunks,
            "status": "Success"
        }

    except HTTPException:
        raise

    except Exception as exc:
        print(f"CRITICAL UPLOAD ERROR: {str(exc)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process and index document: {str(exc)}"
        )

@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    try:
        success = vector_service.delete_session_vectors(session_id)
        if success:
            return {"status": "Session vectors deleted successfully", "session_id": session_id}
        else:
            return {"status": "No vectors found for session", "session_id": session_id}
    except Exception as exc:
        print(f"CRITICAL SESSION DELETION ERROR: {str(exc)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete session: {str(exc)}"
        )