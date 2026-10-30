/**
 * High-reliability browser printing utility for Admit Cards
 * Opens an isolated iframe, clones styles and images, and invokes native print / save as PDF
 */
export const printElement = (element, documentTitle = 'Admit_Card') => {
  return new Promise((resolve, reject) => {
    if (!element) {
      reject(new Error('Element to print is required'));
      return;
    }

    try {
      // 1. Create a hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        document.body.removeChild(iframe);
        reject(new Error('Could not access iframe document'));
        return;
      }

      // 2. Gather all active stylesheets and style tags
      let stylesHtml = '';
      const styleElements = document.querySelectorAll('link[rel="stylesheet"], style');
      styleElements.forEach((el) => {
        stylesHtml += el.outerHTML;
      });

      // 3. Inject A4 page and print-specific layout rules
      stylesHtml += `
        <style>
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          .admit-card-page-wrapper {
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            min-height: 284mm !important;
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 2mm 0 !important;
            margin: 0 !important;
          }
          .admit-card-page-wrapper:last-child,
          .report-card-page-wrapper:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .report-card-page-wrapper {
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            box-sizing: border-box !important;
            padding: 4mm 5mm !important;
            margin: 0 !important;
            background: #ffffff !important;
            overflow: hidden !important;
          }
          .admit-card-element,
          #printable-admit-card {
            width: 100% !important;
            max-width: 196mm !important;
            border: 2px solid #0f172a !important;
            box-shadow: none !important;
            box-sizing: border-box !important;
            background-color: #ffffff !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .report-card-element,
          #printable-report-card,
          #report-card-editor-card,
          #report-card-preview-modal-card,
          #student-view-report-card {
            width: 100% !important;
            max-width: 198mm !important;
            height: 288mm !important;
            max-height: 288mm !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
            margin: 0 auto !important;
            padding: 3mm 4mm 2mm 4mm !important;
          }
          .exam-title-input {
            background-color: #f59e0b !important;
            background-image: linear-gradient(90deg, #b45309 0%, #f59e0b 50%, #b45309 100%) !important;
            background: linear-gradient(90deg, #b45309 0%, #f59e0b 50%, #b45309 100%) !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            border: 1px solid #fef3c7 !important;
            border-radius: 14px !important;
            padding: 2.5px 14px !important;
            font-weight: 800 !important;
            font-size: 8pt !important;
            letter-spacing: 0.8px !important;
            text-transform: uppercase !important;
            text-align: center !important;
            display: inline-block !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25) !important;
          }
          .header-box {
            background-color: #1e3a8a !important;
            background: linear-gradient(135deg, #0f2b5c 0%, #1e3a8a 50%, #0f2b5c 100%) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .header-meta-bar {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
            border-bottom: 1px solid rgba(251, 191, 36, 0.4) !important;
            color: #fbbf24 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .header-meta-value {
            color: #ffffff !important;
            font-weight: 800 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        </style>
      `;

      // 4. Clone element to sanitize inputs for crystal-clear print rendering
      const clone = element.cloneNode(true);
      const origInputs = element.querySelectorAll('input, textarea, select');
      const cloneInputs = clone.querySelectorAll('input, textarea, select');
      origInputs.forEach((origInput, idx) => {
        const cloneInput = cloneInputs[idx];
        if (!cloneInput) return;
        const val = origInput.value !== undefined ? origInput.value : '';
        if (origInput.tagName === 'TEXTAREA') {
          const div = document.createElement('div');
          div.className = cloneInput.className || '';
          div.textContent = val;
          div.style.cssText = cloneInput.style.cssText;
          div.style.border = 'none';
          div.style.background = 'transparent';
          div.style.padding = '0';
          div.style.whiteSpace = 'pre-wrap';
          div.style.width = '100%';
          div.style.display = 'block';
          cloneInput.parentNode?.replaceChild(div, cloneInput);
        } else if (origInput.classList.contains('exam-title-input')) {
          const span = document.createElement('span');
          span.className = 'exam-title-input';
          span.textContent = val;
          span.style.backgroundColor = '#f59e0b';
          span.style.backgroundImage = 'linear-gradient(90deg, #b45309 0%, #f59e0b 50%, #b45309 100%)';
          span.style.background = 'linear-gradient(90deg, #b45309 0%, #f59e0b 50%, #b45309 100%)';
          span.style.color = '#0f172a';
          span.style.fontWeight = '800';
          span.style.fontSize = '8pt';
          span.style.padding = '2.5px 14px';
          span.style.borderRadius = '14px';
          span.style.border = '1px solid #fef3c7';
          span.style.webkitPrintColorAdjust = 'exact';
          span.style.printColorAdjust = 'exact';
          span.style.display = 'inline-block';
          span.style.textAlign = 'center';
          span.style.letterSpacing = '0.8px';
          span.style.textTransform = 'uppercase';
          cloneInput.parentNode?.replaceChild(span, cloneInput);
        } else if (origInput.classList.contains('header-meta-input')) {
          const span = document.createElement('span');
          span.className = 'header-meta-value';
          span.textContent = val;
          span.style.color = '#ffffff';
          span.style.fontWeight = '800';
          span.style.fontSize = '7.2pt';
          span.style.webkitPrintColorAdjust = 'exact';
          span.style.printColorAdjust = 'exact';
          span.style.display = 'inline-block';
          cloneInput.parentNode?.replaceChild(span, cloneInput);
        } else {
          const span = document.createElement('span');
          span.className = cloneInput.className || '';
          span.textContent = val;
          span.style.cssText = cloneInput.style.cssText;
          span.style.border = 'none';
          span.style.background = 'transparent';
          span.style.padding = '0';
          span.style.display = 'inline-block';
          cloneInput.parentNode?.replaceChild(span, cloneInput);
        }
      });

      const noPrintEls = clone.querySelectorAll('.no-print');
      noPrintEls.forEach((el) => el.remove());

      // Determine content HTML (batch container vs single card)
      let contentHtml = '';
      if (element.classList && (element.classList.contains('admit-card-page-wrapper') || element.classList.contains('report-card-page-wrapper'))) {
        contentHtml = clone.outerHTML;
      } else if (element.querySelector && (element.querySelector('.admit-card-page-wrapper') || element.querySelector('.report-card-page-wrapper'))) {
        contentHtml = clone.innerHTML;
      } else {
        const isReportCard = element.classList?.contains('report-card-element') || 
                             element.id?.includes('report-card') || 
                             clone.querySelector('.report-card-element') !== null;
        const wrapperClass = isReportCard ? 'report-card-page-wrapper' : 'admit-card-page-wrapper';
        contentHtml = `<div class="${wrapperClass}">${clone.outerHTML}</div>`;
      }

      // 5. Write document contents into the iframe
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${documentTitle}</title>
            ${stylesHtml}
          </head>
          <body>
            ${contentHtml}
          </body>
        </html>
      `);
      doc.close();

      // 5. Wait for all images to finish loading (logos, photos, signatures)
      const images = doc.querySelectorAll('img');
      const imagePromises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((res) => {
          img.onload = res;
          img.onerror = res;
        });
      });

      Promise.all(imagePromises).then(() => {
        // Small delay to allow fonts and CSS layout to compute
        setTimeout(() => {
          try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          } catch (e) {
            console.error('Print call error:', e);
          }

          // Clean up iframe after print dialog completes
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            resolve();
          }, 1500);
        }, 250);
      });
    } catch (err) {
      reject(err);
    }
  });
};
