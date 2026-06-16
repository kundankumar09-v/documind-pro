import os
import uuid
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

CHROMA_DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "chroma_db"
)

class VectorStoreService:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.parent_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=400)
        self.child_splitter = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=50)
        os.makedirs(CHROMA_DATA_DIR, exist_ok=True)

    def _get_chroma(self) -> Chroma:
        return Chroma(persist_directory=CHROMA_DATA_DIR, embedding_function=self.embeddings)

    def add_document(self, text: str, filename: str, session_id: str) -> int:
        parent_chunks = self.parent_splitter.split_text(text)
        child_documents = []

        for parent_index, parent_text in enumerate(parent_chunks):
            parent_id = str(uuid.uuid4())
            child_chunks = self.child_splitter.split_text(parent_text)

            for child_text in child_chunks:
                child_documents.append(
                    Document(
                        page_content=child_text,
                        metadata={
                            "source": filename,
                            "session_id": str(session_id),
                            "parent_context": parent_text,
                            "parent_id": parent_id,
                        },
                    )
                )

        db = self._get_chroma()
        db.add_documents(child_documents)
        db.persist()
        return len(child_documents)

    def similarity_search_isolated(self, query: str, session_id: str, k: int = 7):
        db = self._get_chroma()
        child_matches = db.similarity_search(
            query,
            k=k,
            filter={"session_id": str(session_id)},
        )

        seen_parent_ids = set()
        parent_documents = []

        for child_document in child_matches:
            metadata = child_document.metadata or {}
            parent_id = metadata.get("parent_id")
            parent_context = metadata.get("parent_context")
            source_name = metadata.get("source", "unknown")

            if not parent_id or not parent_context:
                continue

            if parent_id in seen_parent_ids:
                continue

            seen_parent_ids.add(parent_id)
            parent_documents.append(
                Document(
                    page_content=parent_context,
                    metadata={
                        "source": source_name,
                        "session_id": str(session_id),
                        "parent_id": parent_id,
                    },
                )
            )

        return parent_documents

    def delete_session_vectors(self, session_id: str) -> bool:
        db = self._get_chroma()
        try:
            results = db.get(where={"session_id": str(session_id)})
            if results and results.get("ids"):
                db.delete(ids=results["ids"])
                db.persist()
                return True
            return True
        except Exception as e:
            print(f"Error deleting session vectors: {str(e)}")
            return False