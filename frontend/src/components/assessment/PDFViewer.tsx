import React, { useState, useMemo, useEffect } from 'react';
// Using dynamic import for react-pdf to avoid SSR issues
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { LoadingSpinner } from '../common/LoadingSpinner';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
    pdfBlob: Blob;
    onClose: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ pdfBlob, onClose }) => {
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState(1);
    const url = useMemo(() => URL.createObjectURL(pdfBlob), [pdfBlob]);

    useEffect(() => {
        return () => URL.revokeObjectURL(url);
    }, [url]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-75 flex justify-center">
            <div className="relative w-full max-w-4xl p-4 h-full">
                {/* Close button */}
                <div className="absolute top-0 right-0 p-4">
                    <button
                        onClick={onClose}
                        className="bg-white rounded-full p-2 hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* PDF Document */}
                <div className="h-full overflow-auto bg-white rounded-lg shadow-xl p-8">
                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<div className="flex justify-center"><LoadingSpinner className="w-8 h-8" /></div>}
                        error={
                            <div className="text-center text-red-600">
                                <p>Failed to load PDF. Please try again.</p>
                            </div>
                        }
                    >
                        <Page 
                            pageNumber={pageNumber}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            loading={<LoadingSpinner className="w-8 h-8" />}
                            scale={1.2}
                        />
                    </Document>
                    
                    {/* Page navigation */}
                    {numPages && numPages > 1 && (
                        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                                    disabled={pageNumber <= 1}
                                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span>
                                    Page {pageNumber} of {numPages}
                                </span>
                                <button
                                    onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                                    disabled={pageNumber >= numPages}
                                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};