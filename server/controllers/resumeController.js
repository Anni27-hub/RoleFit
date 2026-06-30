import { createResume } from "../models/Resume.js";
import { extractResumeText } from "../services/resumeParser.js";
import { readUpload } from "../services/uploadService.js";

export async function uploadResume(req, res, next) {
  try {
    const file = await readUpload(req);
    if (!file) {
      return res.status(400).json({ message: "Resume file is required." });
    }

    console.log(file);

    const text = await extractResumeText(file);
    if (text.trim().length < 80) {
      return res.status(400).json({
        message: "Could not read enough resume text. Try a text-based PDF or DOCX file."
      });
    }

    const resume = await createResume({
      userId: req.user._id,
      originalName: file.filename,
      mimeType: file.mimeType,
      size: file.buffer.length,
      text
    });

    res.status(201).json({ resumeId: resume._id.toString() });
  } catch (error) {
    next(error);
  }
}
