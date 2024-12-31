// @ts-ignore
import { jsPDF } from 'jspdf/dist/jspdf.es.min.js';
import { Assessment } from './assessmentService';

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export async function generateAssessmentPDF(assessment: Assessment): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20; // Starting y position
    
    // Helper function for adding text with word wrap
    const addText = (text: string, x: number, maxWidth: number) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        y += (lines.length * 7);
        return y;
    };

    // Add header with logo
    doc.setFontSize(20);
    doc.text('Assessment Report', pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Add metadata
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, 10, { align: 'right' });
    doc.text(`ID: ${assessment.id || 'Draft'}`, 20, 10);

    // Reset styles for content
    doc.setFontSize(12);
    doc.setTextColor(0);

    // Add sections
    const addSection = (title: string, content: any) => {
        doc.setFont('helvetica', 'bold');
        doc.text(title, 20, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        
        if (typeof content === 'string') {
            addText(content, 20, pageWidth - 40);
        } else if (Array.isArray(content)) {
            content.forEach(item => {
                addText(`• ${item}`, 25, pageWidth - 45);
                y += 2;
            });
        } else if (typeof content === 'object') {
            Object.entries(content).forEach(([key, value]) => {
                if (value) {
                    addText(`${key}: ${value}`, 25, pageWidth - 45);
                    y += 2;
                }
            });
        }
        y += 10;

        // Add new page if needed
        if (y > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            y = 20;
        }
    };

    // Add content sections
    addSection('Client Information', {
        'Name': assessment.clientInfo.name,
        'Date of Birth': formatDate(assessment.clientInfo.dateOfBirth)
    });

    addSection('Functional Status', {
        'Mobility': assessment.functionalStatus.mobility,
        'ADL': assessment.functionalStatus.adl,
        'IADL': assessment.functionalStatus.iadl
    });

    addSection('Environment', {
        'Home Setup': assessment.environment.homeSetup,
        'Safety Risks': assessment.environment.safetyRisks.join(', ')
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128);
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    return doc.output('blob');
}