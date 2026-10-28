import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Download a single admit card as PDF
 */
export const downloadSingleAdmitCardPdf = async ({ cardElement, filename = 'Admit_Card.pdf' }) => {
  if (!cardElement) throw new Error('Card element is required for PDF generation');

  const canvas = await html2canvas(cardElement, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const maxWidth = 196;
  const maxHeight = 283;

  const aspectRatio = canvas.height / canvas.width;
  let targetWidth = maxWidth;
  let targetHeight = targetWidth * aspectRatio;

  if (targetHeight > maxHeight) {
    targetHeight = maxHeight;
    targetWidth = targetHeight / aspectRatio;
  }

  const x = (pageWidth - targetWidth) / 2;
  const y = (pageHeight - targetHeight) / 2;

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  pdf.addImage(imgData, 'JPEG', x, y, targetWidth, targetHeight, undefined, 'FAST');
  pdf.save(filename);

  return true;
};

/**
 * Download multiple admit cards in a single combined PDF (1 student per page)
 * @param {Array<HTMLElement>} cardElements - List of rendered admit card DOM elements
 * @param {string} filename - Output PDF filename
 * @param {Function} onProgress - Callback ({ current, total, percent, studentName })
 * @param {Object} abortController - Optional controller to cancel generation
 */
export const downloadAllAdmitCardsPdf = async ({
  cardElements = [],
  filename = 'All_Admit_Cards.pdf',
  onProgress = () => {},
  abortController = { aborted: false }
}) => {
  if (!cardElements || cardElements.length === 0) {
    throw new Error('No admit cards found to generate PDF');
  }

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const maxWidth = 196;
  const maxHeight = 283;
  const total = cardElements.length;

  for (let i = 0; i < total; i++) {
    if (abortController.aborted) {
      throw new Error('PDF generation was cancelled');
    }

    const card = cardElements[i];
    const studentName = card.getAttribute('data-student-name') || `Student ${i + 1}`;

    onProgress({
      current: i + 1,
      total,
      percent: Math.round(((i) / total) * 100),
      studentName,
      status: `Rendering ${studentName} (${i + 1} of ${total})...`
    });

    // Small yield to allow UI to update progress bar smoothly
    await new Promise((resolve) => setTimeout(resolve, 20));

    const canvas = await html2canvas(card, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const aspectRatio = canvas.height / canvas.width;
    let targetWidth = maxWidth;
    let targetHeight = targetWidth * aspectRatio;

    if (targetHeight > maxHeight) {
      targetHeight = maxHeight;
      targetWidth = targetHeight / aspectRatio;
    }

    const x = (pageWidth - targetWidth) / 2;
    const y = (pageHeight - targetHeight) / 2;

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', x, y, targetWidth, targetHeight, undefined, 'FAST');

    onProgress({
      current: i + 1,
      total,
      percent: Math.round(((i + 1) / total) * 100),
      studentName,
      status: `Completed ${i + 1} of ${total}`
    });
  }

  pdf.save(filename);
  return { success: true, count: total };
};

/**
 * Trigger native print dialog formatted for multi-page admit cards
 */
export const triggerBatchPrint = () => {
  document.body.classList.add('printing-admit-cards');

  const cleanup = () => {
    document.body.classList.remove('printing-admit-cards');
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);

  // Trigger print after slight timeout so CSS styles apply
  setTimeout(() => {
    window.print();
    // Fallback cleanup if afterprint doesn't fire
    setTimeout(cleanup, 2000);
  }, 100);
};
