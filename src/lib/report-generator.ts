import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generateMedicalReport = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("Report element not found");
    return;
  }

  try {
    // 1. Force images to load and set crossOrigin before capture
    const images = element.getElementsByTagName('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
    });

    await Promise.all(imagePromises);

    // 2. Create canvas with settings that avoid tainting
    const canvas = await html2canvas(element, {
      scale: 1, // Start with 1 to ensure it works
      useCORS: true,
      allowTaint: false, // Set to false to see if it helps with security errors
      backgroundColor: "#ffffff",
      logging: true,
      proxy: undefined, // Don't use proxy unless configured
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.7);
    const pdf = new jsPDF("p", "mm", "a4");
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgProps = pdf.getImageProperties(imgData);
    const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
    
    const finalWidth = imgProps.width * ratio;
    const finalHeight = imgProps.height * ratio;

    const xOffset = (pdfWidth - finalWidth) / 2;
    
    pdf.addImage(imgData, "JPEG", xOffset, 10, finalWidth, finalHeight);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Critical error in generateMedicalReport:", error);
    // Silent fail for promise rejections in canvas
    throw new Error("Canvas capture failed");
  }
};
