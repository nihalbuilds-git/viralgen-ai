import jsPDF from "jspdf";

export function downloadTxt(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${filename}.txt`);
  URL.revokeObjectURL(url);
}

export function downloadPdf(filename: string, title: string, text: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, margin, margin + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const wrapped = doc.splitTextToSize(text, pageWidth - margin * 2) as string[];
  let y = margin + 40;
  const lineHeight = 16;
  for (const line of wrapped) {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }
  doc.save(`${filename}.pdf`);
}

function triggerDownload(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function outputToText(output: unknown): string {
  if (!output) return "";
  if (typeof output === "string") return output;
  if (typeof output !== "object") return String(output);
  const o = output as Record<string, unknown>;
  if (Array.isArray(o.captions)) return (o.captions as string[]).join("\n\n");
  if (typeof o.description === "string") return o.description;
  if (o.headline || o.body || o.cta) {
    return [o.headline && `Headline: ${o.headline}`, o.body && `\n${o.body}`, o.cta && `\nCTA: ${o.cta}`]
      .filter(Boolean)
      .join("\n");
  }
  return JSON.stringify(output, null, 2);
}
