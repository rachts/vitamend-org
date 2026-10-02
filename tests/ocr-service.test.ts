import { afterEach, describe, expect, it, vi } from "vitest";
import { OCRService } from "@/lib/ai/ocr-service";

afterEach(() => vi.unstubAllGlobals());

describe("OCR upload transport", () => {
  it("sends the file exactly once", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true })));
    vi.stubGlobal("fetch", fetchMock);
    await OCRService.processImage(new File(["image"], "label.png", { type: "image/png" }));
    const body = fetchMock.mock.calls[0]?.[1].body as FormData;
    expect(Array.from(body.keys())).toEqual(["image"]);
  });

  it("rejects oversized files before spending upload bandwidth", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(OCRService.processImage(new File([new Uint8Array(4 * 1024 * 1024 + 1)], "large.png"))).rejects.toThrow("4 MB");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
