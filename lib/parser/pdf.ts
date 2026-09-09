// @ts-ignore
import PDFParser from "pdf2json";

/**
 * Extracts plain text from an uploaded PDF file buffer, ArrayBuffer, or File object using pdf2json.
 */
export async function extractTextFromPDF(fileOrBuffer: Buffer | ArrayBuffer | File): Promise<string> {
  try {
    let buffer: Buffer;

    if (typeof File !== 'undefined' && fileOrBuffer instanceof File) {
      const arrayBuffer = await fileOrBuffer.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if (Buffer.isBuffer(fileOrBuffer)) {
      buffer = fileOrBuffer;
    } else if (fileOrBuffer instanceof ArrayBuffer) {
      buffer = Buffer.from(fileOrBuffer);
    } else {
      throw new Error('Invalid input format: expected Buffer, ArrayBuffer, or File.');
    }

    if (!buffer || buffer.length === 0) {
      throw new Error("Provided PDF buffer is empty.");
    }

    return await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser(null, true);

      pdfParser.on("pdfParser_dataError", (err: any) => {
        const errorMsg = typeof err === 'string' ? err : err?.parserError?.message || err?.parserError || err?.message || "Unknown parsing error";
        reject(new Error(errorMsg));
      });

      pdfParser.on("pdfParser_dataReady", () => {
        try {
          const rawText = pdfParser.getRawTextContent ? pdfParser.getRawTextContent() : "";
          const cleanedText = rawText
            .replace(/\r\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

          if (!cleanedText || cleanedText.length < 20) {
            reject(new Error("Extracted text is empty or too short. The PDF might be scanned or image-based."));
            return;
          }

          resolve(cleanedText);
        } catch (err) {
          reject(err);
        }
      });

      pdfParser.parseBuffer(buffer);
    });
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    throw new Error(
      `Failed to parse PDF document: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Alias for backwards compatibility
export const extractPdfText = extractTextFromPDF;

export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
