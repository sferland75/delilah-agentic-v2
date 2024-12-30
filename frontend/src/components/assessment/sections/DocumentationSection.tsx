import React from 'react';
import { Document } from '../../../types/assessment';

interface Props {
    data: Document[];
    onChange: (value: Document[]) => void;
}

const DocumentationSection: React.FC<Props> = ({ data, onChange }) => {
    const [loading, setLoading] = React.useState(false);

    const handleUpload = async (file: File) => {
        setLoading(true);
        try {
            // Simulate upload
            const newDoc: Document = {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                type: file.type,
                url: URL.createObjectURL(file),
                uploadedAt: new Date().toISOString()
            };
            onChange([...data, newDoc]);
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        onChange(data.filter(doc => doc.id !== id));
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Upload Documents
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <input
                            type="file"
                            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                            className="sr-only"
                            id="file-upload"
                            disabled={loading}
                        />
                        <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                            {loading ? (
                                <span>Uploading...</span>
                            ) : (
                                <span>Upload a file</span>
                            )}
                        </label>
                    </div>
                </div>
            </div>

            <div className="mt-6 space-y-4">
                {data.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-500">{new Date(doc.uploadedAt).toLocaleString()}</p>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => window.open(doc.url)}
                                className="text-indigo-600 hover:text-indigo-900"
                            >
                                View
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDelete(doc.id)}
                                className="text-red-600 hover:text-red-900"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentationSection;