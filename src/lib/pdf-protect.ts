import {
  PDFArray,
  PDFDict,
  PDFHexString,
  PDFObject,
  PDFRawStream,
  PDFRef,
  PDFStream,
  PDFString,
  type PDFDocument,
} from "pdf-lib";
import { fileKey, objectKey, ownerKey, passwordBytes, rc4, toHex, userKey } from "./pdf-crypto";
import { PdfToolError, loadPdf } from "./pdf-load";

/** Allow printing and editing once the file is open. The password is what gates opening. */
const OPEN_PERMISSIONS = -4;

function sameRef(a: PDFRef, b: PDFRef | undefined): boolean {
  return !!b && a.objectNumber === b.objectNumber && a.generationNumber === b.generationNumber;
}

function encryptString(value: PDFString | PDFHexString, key: Uint8Array): PDFHexString {
  return PDFHexString.of(toHex(rc4(key, value.asBytes())));
}

function encryptValue(value: PDFObject, key: Uint8Array): PDFObject {
  if (value instanceof PDFString || value instanceof PDFHexString) return encryptString(value, key);
  if (value instanceof PDFArray) {
    for (let i = 0; i < value.size(); i++) {
      const child = value.get(i);
      if (child instanceof PDFRef) continue;
      value.set(i, encryptValue(child, key));
    }
    return value;
  }
  if (value instanceof PDFStream) {
    encryptDict(value.dict, key);
    return PDFRawStream.of(value.dict, rc4(key, value.getContents()));
  }
  if (value instanceof PDFDict) {
    encryptDict(value, key);
    return value;
  }
  return value;
}

function encryptDict(dict: PDFDict, key: Uint8Array): void {
  for (const [name, value] of dict.entries()) {
    if (value instanceof PDFRef) continue;
    const next = encryptValue(value, key);
    if (next !== value) dict.set(name, next);
  }
}

function fileIdBytes(doc: PDFDocument): Uint8Array {
  const context = doc.context;
  let id: PDFObject | undefined = context.trailerInfo.ID;
  if (id instanceof PDFRef) id = context.lookup(id);
  if (id instanceof PDFArray && id.size() > 0) {
    let first: PDFObject | undefined = id.get(0);
    if (first instanceof PDFRef) first = context.lookup(first);
    if (first instanceof PDFHexString || first instanceof PDFString) return first.asBytes();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = PDFHexString.of(toHex(bytes));
  context.trailerInfo.ID = context.obj([hex, PDFHexString.of(toHex(bytes))]);
  return bytes;
}

function idRef(doc: PDFDocument): PDFRef | undefined {
  const id = doc.context.trailerInfo.ID;
  return id instanceof PDFRef ? id : undefined;
}

/**
 * Encrypt a PDF so a viewer asks for `password` before showing it.
 * Uses the standard handler, revision 3. The same password is both the
 * open password and the owner password. This does not make the file unbreakable.
 */
export async function protectPdf(bytes: Uint8Array, password: string): Promise<Uint8Array> {
  if (!password) throw new PdfToolError("Enter a password.");
  const doc = await loadPdf(bytes);
  if (doc.getPageCount() < 1) throw new PdfToolError("This PDF has no pages.");
  await doc.flush();

  const secret = passwordBytes(password);
  const id = fileIdBytes(doc);
  const owner = ownerKey(secret);
  const key = fileKey(secret, owner, OPEN_PERMISSIONS, id);
  const user = userKey(key, id);
  const context = doc.context;
  const encrypt = context.obj({
    Filter: "Standard",
    V: 2,
    R: 3,
    Length: 128,
    P: OPEN_PERMISSIONS,
    O: PDFHexString.of(toHex(owner)),
    U: PDFHexString.of(toHex(user)),
  });
  const encryptRef = context.register(encrypt);
  context.trailerInfo.Encrypt = encryptRef;
  const skipId = idRef(doc);

  for (const [ref, object] of context.enumerateIndirectObjects()) {
    if (sameRef(ref, encryptRef) || sameRef(ref, skipId)) continue;
    const objKey = objectKey(key, ref.objectNumber, ref.generationNumber);
    const next = encryptValue(object, objKey);
    if (next !== object) context.assign(ref, next);
  }

  return doc.save({ useObjectStreams: false, updateFieldAppearances: false });
}
