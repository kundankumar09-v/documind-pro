import fitz  # PyMuPDF
import io
import base64
from docx import Document

class DocumentParser:
    @staticmethod
    def parse_pdf_advanced(file_bytes: bytes):
        """Extracts text, tracks true page boundaries, and renders embedded images."""
        text = ""
        extracted_images = []
        
        # Open PDF from system memory
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        total_pages = len(doc)
        
        for page_num in range(total_pages):
            page = doc.load_page(page_num)
            text += f"\n--- [Page {page_num + 1}] ---\n" + page.get_text()
            
            # Extract image assets
            image_list = page.get_images(full=True)
            for img_index, img in enumerate(image_list):
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                
                # Encode binary images to Base64 strings for direct React rendering
                base64_image = base64.b64encode(image_bytes).decode("utf-8")
                img_url = f"data:image/{image_ext};base64,{base64_image}"
                extracted_images.append(img_url)
                
        return {
            "text": text.strip(),
            "page_count": total_pages,
            "images": extracted_images
        }

    @staticmethod
    def parse_docx_advanced(file_bytes: bytes):
        """Extracts text contents and logs default structural layouts from DOCX."""
        text = []
        docx_file = io.BytesIO(file_bytes)
        doc = Document(docx_file)
        
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text.append(paragraph.text)
                
        full_text = "\n".join(text)
        # Estimate pages for docx files based on average word counts (approx 400 words per page)
        estimated_pages = max(1, len(full_text.split()) // 400)
        
        return {
            "text": full_text.strip(),
            "page_count": estimated_pages,
            "images": [] # Base docx image matching requires separate zipfile parsing
        }