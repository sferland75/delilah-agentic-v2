// ... previous imports ...
import { generateAssessmentPDF } from '../../services/pdfService';
import { PDFViewer } from './PDFViewer';

const AssessmentView: React.FC = () => {
    // ... previous state and hooks ...
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const handleGeneratePDF = async () => {
        if (!assessment) return;
        
        setIsGeneratingPDF(true);
        try {
            const blob = await generateAssessmentPDF(assessment);
            setPdfBlob(blob);
        } catch (error) {
            console.error('Error generating PDF:', error);
            setToast({
                message: 'Failed to generate PDF',
                type: 'error'
            });
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!assessment || !pdfBlob) return;
        
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `assessment-${assessment.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Update the actions section in the JSX
    return (
        <>
            {/* ... previous JSX ... */}
            
            {/* PDF Actions */}
            <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex space-x-3">
                        <button
                            onClick={handleGeneratePDF}
                            disabled={isGeneratingPDF}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            {isGeneratingPDF ? (
                                <>
                                    <LoadingSpinner className="w-4 h-4 mr-2" />
                                    Generating PDF...
                                </>
                            ) : (
                                'Preview PDF'
                            )}
                        </button>
                        {pdfBlob && (
                            <button
                                onClick={handleDownloadPDF}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Download PDF
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* PDF Viewer Modal */}
            {pdfBlob && (
                <PDFViewer
                    pdfBlob={pdfBlob}
                    onClose={() => setPdfBlob(null)}
                />
            )}

            {/* Toast Messages */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
};

export default AssessmentView;