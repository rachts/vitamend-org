import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/ocr/route";
import { SAMPLE_LABEL_AMOXICILLIN, SAMPLE_LABEL_BLURRY_SIMULATION } from "./fixtures/sample-labels";

describe("Next.js OCR API Route (/api/ocr)", () => {
  it("processes a valid simulated packaging image upload and returns structured extracted fields", async () => {
    // Create a mock image file containing sample label text
    const mockBlob = new Blob([SAMPLE_LABEL_AMOXICILLIN], { type: "image/jpeg" });
    const mockFile = new File([mockBlob], "amoxicillin_box_front.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("image", mockFile);

    const req = {
      formData: async () => formData,
      url: "http://localhost:3000/api/ocr",
      method: "POST",
      headers: new Headers(),
    } as any;

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.extracted.medicineName).toContain("AMOXICILLIN");
    expect(json.extracted.batchNumber).toBe("BTH-2025-889");
    expect(json.validation.isValid).toBe(true);
    expect(json.confidence).toBeGreaterThan(80);
  });

  it("returns 400 error when request payload lacks required packaging image", async () => {
    const emptyFormData = new FormData();

    const req = {
      formData: async () => emptyFormData,
      url: "http://localhost:3000/api/ocr",
      method: "POST",
      headers: new Headers(),
    } as any;

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.code).toBe("INVALID_REQUEST");
  });

  it("returns 415 error when unsupported file formats (e.g. DOCX or EXE) are uploaded", async () => {
    const badFile = new File(["dummy docx content"], "document.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    const formData = new FormData();
    formData.append("image", badFile);

    const req = {
      formData: async () => formData,
      url: "http://localhost:3000/api/ocr",
      method: "POST",
      headers: new Headers(),
    } as any;

    const res = await POST(req);
    expect(res.status).toBe(415);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.code).toBe("UNSUPPORTED_FILE");
  });

  it("returns 413 error when file exceeds 10 MB maximum allowance limit", async () => {
    // Allocate an 11MB typed array wrapped as a standard File object
    const oversizedBuffer = new Uint8Array(11 * 1024 * 1024);
    const oversizedFile = new File([oversizedBuffer], "giant_scan.png", { type: "image/png" });

    const formData = new FormData();
    formData.append("image", oversizedFile);

    const req = {
      formData: async () => formData,
      url: "http://localhost:3000/api/ocr",
      method: "POST",
      headers: new Headers(),
    } as any;

    const res = await POST(req);
    expect(res.status).toBe(413);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.code).toBe("LARGE_FILE");
  });

  it("returns 422 error when uploaded label photograph is heavily blurred or unreadable", async () => {
    const blurryBlob = new Blob([SAMPLE_LABEL_BLURRY_SIMULATION], { type: "image/jpeg" });
    const blurryFile = new File([blurryBlob], "blurry_photo.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("image", blurryFile);

    const req = {
      formData: async () => formData,
      url: "http://localhost:3000/api/ocr",
      method: "POST",
      headers: new Headers(),
    } as any;

    const res = await POST(req);
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.code).toBe("BLURRED_IMAGE");
  });
});
