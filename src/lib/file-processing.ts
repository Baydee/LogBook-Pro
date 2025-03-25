import mammoth from "mammoth";

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  try {
    // Just return the raw text without any processing
    return file.text();
  } catch (error) {
    console.error("Error extracting text:", error);
    throw error;
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    text += strings.join(" ") + "\n";
  }

  return text;
}

async function extractTextFromDOC(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
