const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generates a beautiful certificate PDF and pipes it to the response.
 * @param {Object} res - Express response stream
 * @param {Object} student - Student details { name }
 * @param {Object} event - Event details { title, date, venue, organizer }
 * @param {Object} certificate - Certificate details { certificateId, verificationCode }
 * @param {string} hostUrl - Base URL of the application for QR code verification
 */
exports.generateCertificatePDF = async (res, student, event, certificate, hostUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Create a Landscape A4 PDF Document (841.89 x 595.27 points)
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 0
      });

      // Pipe to response
      doc.pipe(res);

      const width = doc.page.width;
      const height = doc.page.height;

      // 2. Draw Background & Styling (Theme Colors: Navy #0F1016, Purple #5A52E5)
      if (event.certificateTemplate && event.certificateTemplate.trim() !== '') {
        try {
          const templateBuffer = Buffer.from(event.certificateTemplate.replace(/^data:image\/\w+;base64,/, ''), 'base64');
          doc.image(templateBuffer, 0, 0, { width: width, height: height });
        } catch (err) {
          console.error('Error drawing custom certificate template:', err);
          // Fallback to default border design
          doc.rect(0, 0, width, height).fill('#F9FAFB');
          doc.rect(0, 0, 40, height).fill('#0F1016');
          doc.rect(width - 40, 0, 40, height).fill('#0F1016');
          doc.rect(40, 0, 8, height).fill('#5A52E5');
          doc.rect(width - 48, 0, 8, height).fill('#5A52E5');
          doc.rect(60, 20, width - 120, height - 40).lineWidth(2).stroke('#5A52E5');
        }
      } else {
        // Solid light gray background fill
        doc.rect(0, 0, width, height).fill('#F9FAFB');

        // Decorative Top-Left and Bottom-Right dark navy bars
        doc.rect(0, 0, 40, height).fill('#0F1016');
        doc.rect(width - 40, 0, 40, height).fill('#0F1016');

        // Thin decorative purple accents next to the bars
        doc.rect(40, 0, 8, height).fill('#5A52E5');
        doc.rect(width - 48, 0, 8, height).fill('#5A52E5');

        // Elegant inner gold/purple border
        doc.rect(60, 20, width - 120, height - 40)
           .lineWidth(2)
           .stroke('#5A52E5');
           
        doc.rect(65, 25, width - 130, height - 50)
           .lineWidth(1)
           .stroke('#E5E7EB');
      }

      // 3. Extract dynamic styling configuration
      const layout = event.certificateLayout || {};
      const showDefaultLabels = layout.showDefaultLabels !== false;

      const getLayoutVal = (element, prop, fallback) => {
        if (layout[element] && layout[element][prop] !== undefined) {
          return layout[element][prop];
        }
        return fallback;
      };

      // Helper function to resolve color strings (ensure leading #)
      const getColor = (element, prop, fallback) => {
        let val = getLayoutVal(element, prop, fallback);
        if (typeof val === 'string' && val.length > 0 && !val.startsWith('#') && /^[0-9A-F]{6}$/i.test(val)) {
          return '#' + val;
        }
        return val;
      };

      // 4. Draw branding / headers (highly customizable)
      // Brand Name
      const brandEnabled = getLayoutVal('brandName', 'enabled', showDefaultLabels);
      if (brandEnabled) {
        const brandX = Number(getLayoutVal('brandName', 'x', 100));
        const brandY = Number(getLayoutVal('brandName', 'y', 60));
        const brandSize = Number(getLayoutVal('brandName', 'fontSize', 22));
        const brandColor = getColor('brandName', 'color', '#0F1016');
        const brandText = getLayoutVal('brandName', 'text', 'UniCraft');

        doc.fillColor(brandColor)
           .font('Helvetica-Bold')
           .fontSize(brandSize)
           .text(brandText, brandX, brandY);
      }

      // College Name
      const collegeNameEnabled = getLayoutVal('collegeName', 'enabled', showDefaultLabels);
      if (collegeNameEnabled) {
        const collX = Number(getLayoutVal('collegeName', 'x', 100));
        const collY = Number(getLayoutVal('collegeName', 'y', 85));
        const collSize = Number(getLayoutVal('collegeName', 'fontSize', 10));
        const collColor = getColor('collegeName', 'color', '#5A52E5');
        const collText = getLayoutVal('collegeName', 'text', 'COLLEGE ENGAGEMENT SYSTEM');

        doc.fillColor(collColor)
           .font('Helvetica')
           .fontSize(collSize)
           .text(collText, collX, collY);
      }

      // College Logo
      const logoEnabled = getLayoutVal('collegeLogo', 'enabled', false);
      if (logoEnabled) {
        const logoImg = getLayoutVal('collegeLogo', 'logoImage', '');
        if (logoImg && logoImg.trim() !== '') {
          const logoX = Number(getLayoutVal('collegeLogo', 'x', 100));
          const logoY = Number(getLayoutVal('collegeLogo', 'y', 25));
          const logoSize = Number(getLayoutVal('collegeLogo', 'size', 40));
          try {
            const logoBuffer = Buffer.from(logoImg.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            doc.image(logoBuffer, logoX, logoY, { width: logoSize, height: logoSize });
          } catch (err) {
            console.error('Error drawing college logo in PDF:', err);
          }
        }
      }

      // Certificate Title
      const titleEnabled = getLayoutVal('certificateTitle', 'enabled', showDefaultLabels);
      if (titleEnabled) {
        const titleX = Number(getLayoutVal('certificateTitle', 'x', 100));
        const titleY = Number(getLayoutVal('certificateTitle', 'y', 140));
        const titleSize = Number(getLayoutVal('certificateTitle', 'fontSize', 36));
        const titleColor = getColor('certificateTitle', 'color', '#0F1016');
        const titleText = getLayoutVal('certificateTitle', 'text', 'CERTIFICATE OF PARTICIPATION');
        const titleWidth = Number(getLayoutVal('certificateTitle', 'width', width - 200));
        const titleAlign = getLayoutVal('certificateTitle', 'align', 'center');

        doc.fillColor(titleColor)
           .font('Helvetica-Bold')
           .fontSize(titleSize)
           .text(titleText, titleX, titleY, {
             width: titleWidth,
             align: titleAlign
           });
      }

      // Presented To Label
      const presentedEnabled = getLayoutVal('presentedTo', 'enabled', showDefaultLabels);
      if (presentedEnabled) {
        const presX = Number(getLayoutVal('presentedTo', 'x', 100));
        const presY = Number(getLayoutVal('presentedTo', 'y', 210));
        const presSize = Number(getLayoutVal('presentedTo', 'fontSize', 14));
        const presColor = getColor('presentedTo', 'color', '#4B5563');
        const presText = getLayoutVal('presentedTo', 'text', 'This is proudly presented to');
        const presWidth = Number(getLayoutVal('presentedTo', 'width', width - 200));
        const presAlign = getLayoutVal('presentedTo', 'align', 'center');

        doc.fillColor(presColor)
           .font('Helvetica')
           .fontSize(presSize)
           .text(presText, presX, presY, {
             width: presWidth,
             align: presAlign
           });
      }

      // 5. Student Name
      const nameEnabled = getLayoutVal('studentName', 'enabled', true);
      if (nameEnabled) {
        const nameX = Number(getLayoutVal('studentName', 'x', 100));
        const nameY = Number(getLayoutVal('studentName', 'y', 245));
        const nameSize = Number(getLayoutVal('studentName', 'fontSize', 28));
        const nameColor = getColor('studentName', 'color', '#0F1016');
        const nameWidth = Number(getLayoutVal('studentName', 'width', width - (nameX * 2)));
        const nameAlign = getLayoutVal('studentName', 'align', 'center');

        doc.fillColor(nameColor)
           .font('Helvetica-Bold')
           .fontSize(nameSize)
           .text(student.name, nameX, nameY, {
             width: nameWidth,
             align: nameAlign
           });

        // Dynamic underline for the name
        const underlineEnabled = getLayoutVal('studentName', 'underline', showDefaultLabels);
        if (underlineEnabled) {
          doc.moveTo(250, nameY + nameSize + 7)
             .lineTo(width - 250, nameY + nameSize + 7)
             .lineWidth(1.5)
             .stroke('#5A52E5');
        }
      }

      // Participation Description Text
      const partEnabled = getLayoutVal('participationText', 'enabled', showDefaultLabels);
      if (partEnabled) {
        const partX = Number(getLayoutVal('participationText', 'x', 100));
        const partY = Number(getLayoutVal('participationText', 'y', 295));
        const partSize = Number(getLayoutVal('participationText', 'fontSize', 14));
        const partColor = getColor('participationText', 'color', '#4B5563');
        const partText = getLayoutVal('participationText', 'text', 'for active participation and completion of the college event');
        const partWidth = Number(getLayoutVal('participationText', 'width', width - 200));
        const partAlign = getLayoutVal('participationText', 'align', 'center');

        doc.fillColor(partColor)
           .font('Helvetica')
           .fontSize(partSize)
           .text(partText, partX, partY, {
             width: partWidth,
             align: partAlign
           });
      }

      // 6. Event Title
      const eventEnabled = getLayoutVal('eventTitle', 'enabled', true);
      if (eventEnabled) {
        const eventX = Number(getLayoutVal('eventTitle', 'x', 100));
        const eventY = Number(getLayoutVal('eventTitle', 'y', 325));
        const eventSize = Number(getLayoutVal('eventTitle', 'fontSize', 22));
        const eventColor = getColor('eventTitle', 'color', '#5A52E5');
        const eventWidth = Number(getLayoutVal('eventTitle', 'width', width - (eventX * 2)));
        const eventAlign = getLayoutVal('eventTitle', 'align', 'center');

        doc.fillColor(eventColor)
           .font('Helvetica-Bold')
           .fontSize(eventSize)
           .text(event.title, eventX, eventY, {
             width: eventWidth,
             align: eventAlign
           });
      }

      // 7. Event Date & Venue Info
      const dateEnabled = getLayoutVal('date', 'enabled', true);
      if (dateEnabled) {
        const dateX = Number(getLayoutVal('date', 'x', 100));
        const dateY = Number(getLayoutVal('date', 'y', 365));
        const dateSize = Number(getLayoutVal('date', 'fontSize', 12));
        const dateColor = getColor('date', 'color', '#6B7280');
        const dateWidth = Number(getLayoutVal('date', 'width', width - (dateX * 2)));
        const dateAlign = getLayoutVal('date', 'align', 'center');

        const eventDateStr = new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        doc.fillColor(dateColor)
           .font('Helvetica')
           .fontSize(dateSize);

        if (showDefaultLabels) {
          doc.text(`Held on ${eventDateStr} at the venue: ${event.venue}`, dateX, dateY, {
               width: dateWidth,
               align: dateAlign
             })
             .text(`Organized by: ${event.organizer}`, dateX, dateY + dateSize + 8, {
               width: dateWidth,
               align: dateAlign
             });
        } else {
          doc.text(eventDateStr, dateX, dateY, {
            width: dateWidth,
            align: dateAlign
          });
        }
      }

      // 8. Signatures
      const sigEnabled = getLayoutVal('signatures', 'enabled', true);
      if (sigEnabled) {
        const sigX = Number(getLayoutVal('signatures', 'x', 100));
        const sigY = Number(getLayoutVal('signatures', 'y', 470));
        const sigSpaceWidth = Number(getLayoutVal('signatures', 'width', 420));
        const signatures = event.signatures || [];

        if (signatures.length > 0) {
          const n = signatures.length;
          const sigBlockWidth = 110;
          const cols = n > 3 ? Math.ceil(n / 2) : n;

          for (let i = 0; i < n; i++) {
            const sig = signatures[i];
            let x, currentSigY;

            if (n <= 3) {
              x = n === 1
                ? sigX + (sigSpaceWidth / 2) - (sigBlockWidth / 2)
                : sigX + i * ((sigSpaceWidth - sigBlockWidth) / (n - 1));
              currentSigY = sigY;
            } else {
              const colIdx = i % cols;
              const rowIdx = Math.floor(i / cols);
              x = sigX + colIdx * ((sigSpaceWidth - sigBlockWidth) / Math.max(1, cols - 1));
              currentSigY = sigY + rowIdx * 55;
            }

            // Draw signature line
            doc.moveTo(x, currentSigY)
               .lineTo(x + sigBlockWidth, currentSigY)
               .lineWidth(1)
               .stroke('#9CA3AF');

            // Draw scanned signature image or handwritten cursive text
            if (sig.signatureImage && sig.signatureImage.trim() !== '') {
              try {
                const sigImgBuffer = Buffer.from(sig.signatureImage.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                doc.image(sigImgBuffer, x + 10, currentSigY - 45, { width: sigBlockWidth - 20, height: 40 });
              } catch (err) {
                console.error('Error rendering signature image in PDF:', err);
                if (sig.name && sig.name.trim()) {
                  doc.fillColor('#5A52E5')
                     .font('Times-Italic')
                     .fontSize(14)
                     .text(sig.name, x, currentSigY - 25, { width: sigBlockWidth, align: 'center' });
                }
              }
            } else if (sig.name && sig.name.trim()) {
              doc.fillColor('#5A52E5')
                 .font('Times-Italic')
                 .fontSize(14)
                 .text(sig.name, x, currentSigY - 25, { width: sigBlockWidth, align: 'center' });
            }

            // Draw name and title labels
            if (sig.name && sig.name.trim() !== '') {
              doc.fillColor('#4B5563')
                 .font('Helvetica-Bold')
                 .fontSize(10)
                 .text(sig.name, x, currentSigY + 8, { width: sigBlockWidth, align: 'center' });
            }

            if (sig.title && sig.title.trim() !== '') {
              doc.fillColor('#9CA3AF')
                 .font('Helvetica')
                 .fontSize(8)
                 .text(sig.title, x, currentSigY + (sig.name && sig.name.trim() ? 20 : 8), { width: sigBlockWidth, align: 'center' });
            }
          }
        } else if (showDefaultLabels) {
          // Fallback default signature
          const fallbackX = sigX + (sigSpaceWidth / 2) - 80;
          doc.moveTo(fallbackX, sigY)
             .lineTo(fallbackX + 160, sigY)
             .lineWidth(1)
             .stroke('#9CA3AF');

          doc.fillColor('#4B5563')
             .font('Helvetica-Bold')
             .fontSize(11)
             .text('Event Coordinator', fallbackX, sigY + 10, { width: 160, align: 'center' })
             .font('Helvetica')
             .fontSize(9)
             .text(event.organizer, fallbackX, sigY + 25, { width: 160, align: 'center' });
        }
      }

      // Custom Stamp / Seal Image
      const stampEnabled = getLayoutVal('customStamp', 'enabled', false);
      if (stampEnabled) {
        const stampX = Number(getLayoutVal('customStamp', 'x', 400));
        const stampY = Number(getLayoutVal('customStamp', 'y', 350));
        const stampSize = Number(getLayoutVal('customStamp', 'size', 80));
        const stampImg = getLayoutVal('customStamp', 'stampImage', '');

        if (stampImg && stampImg.trim() !== '') {
          try {
            const stampImgBuffer = Buffer.from(stampImg.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            doc.image(stampImgBuffer, stampX, stampY, { width: stampSize, height: stampSize });
          } catch (err) {
            console.error('Error rendering custom stamp image in PDF:', err);
          }
        }
      }

      // 9. QR Verification & Serial Number
      const qrEnabled = getLayoutVal('qrCode', 'enabled', true);
      const idEnabled = getLayoutVal('certificateId', 'enabled', true);

      let qrBuffer = null;
      let qrSize = Number(getLayoutVal('qrCode', 'size', 90));
      let qrX = Number(getLayoutVal('qrCode', 'x', width - 230));
      let qrY = Number(getLayoutVal('qrCode', 'y', 415));

      if (qrEnabled) {
        const verificationUrl = `${hostUrl}/verify-certificate/${certificate.verificationCode}`;
        const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 180 });
        qrBuffer = Buffer.from(qrDataUrl.replace(/^data:image\/png;base64,/, ''), 'base64');
        doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });
      }

      if (idEnabled) {
        const idX = Number(getLayoutVal('certificateId', 'x', qrX - 30));
        const idY = Number(getLayoutVal('certificateId', 'y', qrY + qrSize + 10));
        const idSize = Number(getLayoutVal('certificateId', 'fontSize', 10));
        const idColor = getColor('certificateId', 'color', '#1F2937');
        const idWidth = Number(getLayoutVal('certificateId', 'width', qrSize + 60));
        const idAlign = getLayoutVal('certificateId', 'align', 'center');

        doc.fillColor(idColor)
           .font('Helvetica-Bold')
           .fontSize(idSize)
           .text(`${certificate.certificateId}`, idX, idY, {
             width: idWidth,
             align: idAlign
           });
      }

      if (qrEnabled && showDefaultLabels) {
        doc.fillColor('#9CA3AF')
           .font('Helvetica')
           .fontSize(8)
           .text('Scan to verify authenticity', qrX - 30, qrY + qrSize + 25, {
             width: qrSize + 60,
             align: 'center'
           });
      }

      doc.end();
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};
