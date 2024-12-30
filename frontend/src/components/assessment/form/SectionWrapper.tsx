import React from 'react';
import { Card } from '../../ui/card';

interface SectionWrapperProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
    title,
    description,
    children,
    className = ''
}) => {
    return (
        <Card className={`p-6 ${className}`}>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    {description && (
                        <p className="mt-1 text-sm text-gray-500">{description}</p>
                    )}
                </div>
                <div className="space-y-4">
                    {children}
                </div>
            </div>
        </Card>
    );
};

export default SectionWrapper;