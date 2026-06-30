import Busboy from "busboy";

const maxBytes = 5 * 1024 * 1024;

export function readUpload(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("multipart/form-data")) {
      return reject(httpError(400, "Expected multipart form data."));
    }

    const busboy = Busboy({ headers: req.headers, limits: { files: 1, fileSize: maxBytes } });
    let fileData = null;
    let fileTooLarge = false;

    busboy.on("file", (name, stream, info) => {
      const chunks = [];
      const filename = info.filename || "resume";
      const mimeType = info.mimeType || "application/octet-stream";

      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("limit", () => {
        fileTooLarge = true;
        stream.resume();
      });
      stream.on("end", () => {
        fileData = {
          field: name,
          filename,
          mimeType,
          buffer: Buffer.concat(chunks)
        };
      });
    });

    busboy.on("error", reject);
    busboy.on("finish", () => {
      if (fileTooLarge) return reject(httpError(413, "Resume must be smaller than 5MB."));
      resolve(fileData);
    });

    req.pipe(busboy);
  });
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
