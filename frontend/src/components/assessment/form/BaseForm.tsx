import React from 'react';
import { BaseFormProps, BaseFormChildProps } from './BaseFormProps';
import { CoreAssessment, Form1Assessment, CATAssessment } from '../../../types/assessment';

const BaseForm: React.FC<BaseFormProps> = ({
    formData,
    onFormChange,
    children
}) => {
    const handleCoreChange = (fieldPath: keyof CoreAssessment, value: any) => {
        onFormChange({
            ...formData,
            core: {
                ...formData.core,
                [fieldPath]: value
            }
        });
    };

    const handleForm1Change = (value: Form1Assessment) => {
        onFormChange({
            ...formData,
            form1: value
        });
    };

    const handleCATChange = (value: CATAssessment) => {
        onFormChange({
            ...formData,
            cat: value
        });
    };

    if (!children) return null;

    return (
        <div className="space-y-6">
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement<BaseFormChildProps>(child as React.ReactElement<BaseFormChildProps>, {
                        data: formData,
                        onCoreChange: handleCoreChange,
                        onForm1Change: handleForm1Change,
                        onCATChange: handleCATChange
                    });
                }
                return child;
            })}
        </div>
    );
};

export default BaseForm;