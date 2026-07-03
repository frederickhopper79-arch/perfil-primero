export async function extractTextFromPdf(file: File): Promise<string> {
  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    return file.text().catch(() => "");
  }

  try {
    const pdfjsLib = await import("pdfjs-dist");

    // Usar worker bundleado localmente — evita problemas de CDN/versión
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

    const pageTexts: string[] = [];
    const maxPages = Math.min(pdf.numPages, 10);

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (pageText) pageTexts.push(pageText);
    }

    const text = pageTexts.join("\n\n");
    console.log(`[pdf-extract] extracted ${text.length} chars from ${pdf.numPages} pages`);
    return text;
  } catch (err) {
    console.warn("[pdf-extract] pdfjs failed:", err);
    return "";
  }
}
