import { PDFDocument } from "pdf-lib";

export class PdfToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfToolError";
  }
}

export async function loadPdf(bytes: Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/encrypt/i.test(message)) {
      throw new PdfToolError("This PDF is already password-protected. These tools do not unlock PDFs.");
    }
    throw new PdfToolError("Could not read that PDF. It may be damaged or not a PDF.");
  }
}

export function assertPages(count: number): void {
  if (count < 1) throw new PdfToolError("This PDF has no pages.");
}
