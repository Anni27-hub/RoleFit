import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export async function extractResumeText(file) {
  if (!file) {
    const error = new Error("No file uploaded.");
    error.status = 400;
    throw error;
  }

    // Supports both Multer and Busboy
  const filename = file.originalname || file.filename;

  if (!filename) {
    const error = new Error("Filename missing.");
    error.status = 400;
    throw error;
  }

  const ext = "." + filename.split(".").pop().toLowerCase();

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    return cleanText(result.value);
  }

  if (ext === ".pdf") {
    return extractPdfText(file.buffer);
  }

  const error = new Error("Only PDF and DOCX files are supported.");
  error.status = 400;
  throw error;
}

async function extractPdfText(buffer) {
  let parser;

  try {
    parser = new PDFParse({
      data: buffer,
    });

    const result = await parser.getText();

    const text = cleanText(result.text);

    if (text.length >= 80) {
      return text;
    }
  } catch (err) {
    console.error("PDF Parse Error:", err);
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }

  const error = new Error(
    "Could not read enough resume text. Upload a text-based PDF or DOCX file. If your PDF is scanned or image-only, export it as DOCX or re-save it as a selectable-text PDF.",
  );
  error.status = 400;
  throw error;
}

function cleanText(value) {
  return String(value || "")
    .replace(/\u0000/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
