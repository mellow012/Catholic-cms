// lib/pdfCertificate.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generateCertificate(
  sacrament: any,
  dioceseSealUrl: string // e.g., from diocese.sealUrl
) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const boldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

  // Background border
  page.drawRectangle({
    x: 30,
    y: 30,
    width: 540,
    height: 740,
    borderWidth: 4,
    borderColor: rgb(0.2, 0.4, 0.8),
  });

  // Title
  page.drawText("CATHOLIC DIOCESE OF MANGOCHI", {
    x: 100,
    y: 700,
    size: 28,
    font: boldItalic,
    color: rgb(0.2, 0.4, 0.8),
  });
  page.drawText("CERTIFICATE OF " + sacrament.type.toUpperCase(), {
    x: 150,
    y: 660,
    size: 32,
    font,
    color: rgb(0, 0, 0),
  });

  // Seal (embed image)
  if (dioceseSealUrl) {
    const sealImageBytes = await fetch(dioceseSealUrl).then(res => res.arrayBuffer());
    const sealImage = await pdfDoc.embedPng(sealImageBytes);
    page.drawImage(sealImage, {
      x: 400,
      y: 600,
      width: 150,
      height: 150,
    });
  }

  // Content (customize per sacrament)
  let y = 550;
  const drawLine = (label: string, value: string) => {
    page.drawText(`${label}:`, { x: 80, y, size: 16, font });
    page.drawText(value || "________________", { x: 200, y, size: 16, font });
    y -= 40;
  };

  // Example for baptism – extend per type
  if (sacrament.type === "baptism") {
    drawLine("Child", `${sacrament.firstName} ${sacrament.lastName}`);
    drawLine("Date of Baptism", sacrament.baptismDate);
    drawLine("Parents", sacrament.parents);
    drawLine("Godparents", sacrament.godparents);
    drawLine("Officiant", sacrament.officiantName);
    drawLine("Place", sacrament.location);
  }

  // Footer
  page.drawText("This is an official record of the Catholic Church in Malawi.", {
    x: 80,
    y: 100,
    size: 12,
    font,
  });
  page.drawText(`Registry No: ${sacrament.registryNumber || sacrament.id}`, {
    x: 80,
    y: 80,
    size: 12,
    font,
  });

  return await pdfDoc.save();
}