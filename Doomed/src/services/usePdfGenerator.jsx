// components/PdfGenerator.jsx
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useCallback } from 'react';

export const usePdfGenerator = () => {
  const generatePdf = useCallback(async (options) => {
    const {
      chartSelectors,
      aiInsightsText,
      fullAIInsightsText,
      fileName = "report.pdf",
      primaryColor = '#2c3e50',
      chartWidth = 130,
      verticalSpacing = 25
    } = options;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Get charts using provided selectors
    const chartContainers = Array.from(document.querySelectorAll(chartSelectors));

    for (let i = 0; i < chartContainers.length; i++) {
      if (i > 0 && yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 20;
      }

      const container = chartContainers[i];
      const title = container.querySelector('.chart-title')?.innerText || `Chart ${i+1}`;
      
      const canvas = await html2canvas(container);
      const imgHeight = (canvas.height * chartWidth) / canvas.width;

      // Add title
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Add chart
      const imgData = canvas.toDataURL('image/png');
      const xPosition = (pageWidth - chartWidth) / 2;
      doc.addImage(imgData, 'PNG', xPosition, yPosition, chartWidth, imgHeight);
      yPosition += imgHeight + verticalSpacing;
    }

    // Add AI Insights
    if (aiInsightsText || fullAIInsightsText) {
      // Add AI Insights section
      if (aiInsightsText) {
        doc.addPage();
        doc.setFontSize(12);
        doc.setTextColor(primaryColor);
        doc.text("AI Insights", pageWidth / 2, 20, { align: 'center' });
        
        doc.setTextColor('#666666');
        const splitSummary = doc.splitTextToSize(aiInsightsText, pageWidth - 40);
        doc.text(splitSummary, 20, 35, { align: 'left' });
      }
    
      // Process Detailed AI Report
      if (fullAIInsightsText) {
        const rawText = fullAIInsightsText
          .replace(/\\n/g, '\n')
          .replace(/^"|"$/g, '')
          .split('\n');
    
        // Merge lines with their subsequent content
        const processedLines = [];
        let buffer = '';
        
        rawText.forEach((line, index) => {
          const trimmed = line.trim();
          if (trimmed.endsWith(':') && !trimmed.startsWith(' ')) {
            if (buffer) processedLines.push(buffer);
            buffer = trimmed;
          } else if (buffer) {
            buffer += ` ${trimmed}`;
            processedLines.push(buffer);
            buffer = '';
          } else {
            if (trimmed) processedLines.push(trimmed);
          }
        });
    
        let yPos = 35;
        const lineHeight = 8;
        const pageHeight = 280;
        const mainSections = [
          'Executive Summary:',
          'Detailed Findings:',
          'Actionable Recommendations:',
          'Conclusion:'
        ];
    
        doc.addPage();
        doc.setFontSize(12);
        doc.text("Detailed AI Report", pageWidth / 2, 20, { align: 'center' });
    
        processedLines.forEach((line) => {
          if (yPos > pageHeight) {
            doc.addPage();
            yPos = 35;
          }
    
          const isMainSection = mainSections.includes(line.substring(0, line.indexOf(':') + 1));
          const hasColon = line.includes(':') && !line.startsWith(' ');
    
          if (isMainSection) {
            // Main section styling
            doc.setFontSize(14);
            doc.setTextColor(primaryColor);
            doc.setFont(undefined, 'bold');
            doc.text(line, 20, yPos);
            yPos += lineHeight * 2;
          } else if (hasColon) {
            // Subheading with content
            const colonIndex = line.indexOf(':');
            const prefix = line.substring(0, colonIndex + 1);
            const content = line.substring(colonIndex + 1).trim();
    
            // Calculate prefix width
            doc.setFontSize(12);
            const prefixWidth = doc.getTextWidth(prefix);
    
            // Draw prefix
            doc.setTextColor('#444');
            doc.setFont(undefined, 'bold');
            doc.text(prefix, 20, yPos);
    
            // Draw content
            doc.setFontSize(11);
            doc.setTextColor('#666');
            doc.setFont(undefined, 'normal');
            const contentLines = doc.splitTextToSize(content, pageWidth - 40 - prefixWidth - 5);
            
            contentLines.forEach((chunk, i) => {
              if (i > 0 && yPos > pageHeight - lineHeight) {
                doc.addPage();
                yPos = 35;
              }
              const xPos = i === 0 ? 25 + prefixWidth : 20;
              doc.text(chunk, xPos, yPos);
              yPos += lineHeight;
            });
          } else {
            // Regular text
            doc.setFontSize(11);
            doc.setTextColor('#666');
            const lines = doc.splitTextToSize(line, pageWidth - 40);
            lines.forEach(chunk => {
              doc.text(chunk, 20, yPos);
              yPos += lineHeight;
            });
          }
          
          yPos += lineHeight / 2; // Add spacing between paragraphs
        });
      }
    }


    doc.save(fileName);
  }, []);

  return generatePdf;
};