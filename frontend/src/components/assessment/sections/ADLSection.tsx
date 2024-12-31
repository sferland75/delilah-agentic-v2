import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormErrorDisplay } from '@/components/common/FormErrorDisplay';
import { ValidationErrors } from '@/validation/assessmentValidation';

interface ADLData {
    mobility: {
        walking: string;
        balance: string;
        assistance: string;
        equipment: string[];
    };
    selfCare: {
        bathing: string;
        dressing: string;
        grooming: string;
        toileting: string;
        feeding: string;
    };
    homeManagement: {
        cleaning: string;
        laundry: string;
        cooking: string;
        shopping: string;
    };
    transfers: {
        bedToChair: string;
        toiletTransfers: string;
        carTransfers: string;
    };
    cognition: {
        attention: string;
        memory: string;
        problemSolving: string;
        safety: string;
    };
    scores: {
        barthel?: number;
        fim?: number;
    };
    notes: string;
}

interface Props {
    data: ADLData;
    onChange: (data: ADLData) => void;
    errors?: ValidationErrors;
    disabled?: boolean;
}

export const ADLSection: React.FC<Props> = ({
    data,
    onChange,
    errors = {},
    disabled = false
}) => {
    const updateField = (category: keyof ADLData, field: string, value: any) => {
        onChange({
            ...data,
            [category]: {
                ...data[category],
                [field]: value
            }
        });
    };

    const renderTextArea = (
        category: keyof ADLData,
        field: string,
        label: string,
        placeholder: string
    ) => (
        <div className="space-y-2">
            <Label htmlFor={`${category}-${field}`}>{label}</Label>
            <Textarea
                id={`${category}-${field}`}
                value={(data[category] as any)[field]}
                onChange={(e) => updateField(category, field, e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="min-h-[100px]"
            />
            <FormErrorDisplay 
                errors={errors} 
                path={['core', 'functionalStatus', category, field]} 
            />
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Mobility Section */}
            <div>
                <h3 className="text-lg font-medium mb-4">Mobility</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderTextArea('mobility', 'walking', 'Walking', 'Describe walking ability, distance, stability...')}
                    {renderTextArea('mobility', 'balance', 'Balance', 'Describe static and dynamic balance...')}
                    {renderTextArea('mobility', 'assistance', 'Assistance Required', 'Detail any assistance needed...')}
                </div>
            </div>

            {/* Self Care Section */}
            <div>
                <h3 className="text-lg font-medium mb-4">Self Care</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderTextArea('selfCare', 'bathing', 'Bathing', 'Describe bathing/showering ability...')}
                    {renderTextArea('selfCare', 'dressing', 'Dressing', 'Describe ability to dress upper/lower body...')}
                    {renderTextArea('selfCare', 'grooming', 'Grooming', 'Describe personal hygiene abilities...')}
                    {renderTextArea('selfCare', 'toileting', 'Toileting', 'Describe toileting abilities...')}
                    {renderTextArea('selfCare', 'feeding', 'Feeding', 'Describe feeding abilities...')}
                </div>
            </div>

            {/* Transfers Section */}
            <div>
                <h3 className="text-lg font-medium mb-4">Transfers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderTextArea('transfers', 'bedToChair', 'Bed to Chair', 'Describe bed to chair transfer ability...')}
                    {renderTextArea('transfers', 'toiletTransfers', 'Toilet Transfers', 'Describe toilet transfer ability...')}
                    {renderTextArea('transfers', 'carTransfers', 'Car Transfers', 'Describe car transfer ability...')}
                </div>
            </div>

            {/* Home Management Section */}
            <div>
                <h3 className="text-lg font-medium mb-4">Home Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderTextArea('homeManagement', 'cleaning', 'Cleaning', 'Describe ability to clean home...')}
                    {renderTextArea('homeManagement', 'laundry', 'Laundry', 'Describe ability to do laundry...')}
                    {renderTextArea('homeManagement', 'cooking', 'Cooking', 'Describe meal preparation abilities...')}
                    {renderTextArea('homeManagement', 'shopping', 'Shopping', 'Describe ability to shop...')}
                </div>
            </div>

            {/* Cognition Section */}
            <div>
                <h3 className="text-lg font-medium mb-4">Cognition</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderTextArea('cognition', 'attention', 'Attention', 'Describe attention span and focus...')}
                    {renderTextArea('cognition', 'memory', 'Memory', 'Describe memory function...')}
                    {renderTextArea('cognition', 'problemSolving', 'Problem Solving', 'Describe problem-solving abilities...')}
                    {renderTextArea('cognition', 'safety', 'Safety Awareness', 'Describe safety awareness...')}
                </div>
            </div>

            {/* Assessment Scores */}
            <div>
                <h3 className="text-lg font-medium mb-4">Assessment Scores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="barthel">Barthel Index Score</Label>
                        <input
                            type="number"
                            id="barthel"
                            value={data.scores.barthel || ''}
                            onChange={(e) => updateField('scores', 'barthel', parseInt(e.target.value))}
                            min="0"
                            max="100"
                            className="w-full p-2 border rounded"
                            disabled={disabled}
                        />
                        <FormErrorDisplay 
                            errors={errors} 
                            path={['core', 'functionalStatus', 'scores', 'barthel']} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fim">FIM Score</Label>
                        <input
                            type="number"
                            id="fim"
                            value={data.scores.fim || ''}
                            onChange={(e) => updateField('scores', 'fim', parseInt(e.target.value))}
                            min="18"
                            max="126"
                            className="w-full p-2 border rounded"
                            disabled={disabled}
                        />
                        <FormErrorDisplay 
                            errors={errors} 
                            path={['core', 'functionalStatus', 'scores', 'fim']} 
                        />
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                    id="notes"
                    value={data.notes}
                    onChange={(e) => onChange({ ...data, notes: e.target.value })}
                    placeholder="Add any additional observations or notes..."
                    disabled={disabled}
                    className="min-h-[150px]"
                />
                <FormErrorDisplay 
                    errors={errors} 
                    path={['core', 'functionalStatus', 'notes']} 
                />
            </div>
        </div>
    );
};

export default ADLSection;