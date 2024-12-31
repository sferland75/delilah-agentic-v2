import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormErrorDisplay } from '@/components/common/FormErrorDisplay';
import { ValidationErrors } from '@/validation/assessmentValidation';

interface DemographicData {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    contact: {
        phone: string;
        email: string;
        preferredMethod: 'phone' | 'email';
    };
    emergency: {
        name: string;
        relationship: string;
        phone: string;
    };
    insurance: {
        provider: string;
        policyNumber: string;
        groupNumber?: string;
    };
}

interface Props {
    data: DemographicData;
    onChange: (value: DemographicData) => void;
    errors?: ValidationErrors;
    disabled?: boolean;
}

export const DemographicSection: React.FC<Props> = ({
    data,
    onChange,
    errors = {},
    disabled = false
}) => {
    const updateField = (path: string[], value: any) => {
        const newData = { ...data };
        let current: any = newData;
        
        // Navigate to the nested object
        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
                current[path[i]] = {};
            }
            current = current[path[i]];
        }
        
        // Set the value
        current[path[path.length - 1]] = value;
        onChange(newData);
    };

    return (
        <div className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                        id="fullName"
                        value={data.fullName}
                        onChange={(e) => updateField(['fullName'], e.target.value)}
                        disabled={disabled}
                    />
                    <FormErrorDisplay 
                        errors={errors} 
                        path={['core', 'clientInfo', 'demographics', 'fullName']} 
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                        id="dateOfBirth"
                        type="date"
                        value={data.dateOfBirth}
                        onChange={(e) => updateField(['dateOfBirth'], e.target.value)}
                        disabled={disabled}
                    />
                    <FormErrorDisplay 
                        errors={errors} 
                        path={['core', 'clientInfo', 'demographics', 'dateOfBirth']} 
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select
                        id="gender"
                        value={data.gender}
                        onChange={(e) => updateField(['gender'], e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2"
                        disabled={disabled}
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    <FormErrorDisplay 
                        errors={errors} 
                        path={['core', 'clientInfo', 'demographics', 'gender']} 
                    />
                </div>
            </div>

            {/* Address */}
            <div>
                <h3 className="text-lg font-medium mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                            id="street"
                            value={data.address.street}
                            onChange={(e) => updateField(['address', 'street'], e.target.value)}
                            disabled={disabled}
                        />
                        <FormErrorDisplay 
                            errors={errors} 
                            path={['core', 'clientInfo', 'demographics', 'address', 'street']} 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            value={data.address.city}
                            onChange={(e) => updateField(['address', 'city'], e.target.value)}
                            disabled={disabled}
                        />
                        <FormErrorDisplay 
                            errors={errors} 
                            path={['core', 'clientInfo', 'demographics', 'address', 'city']} 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                            id="state"
                            value={data.address.state}
                            onChange={(e) => updateField(['address', 'state'], e.target.value)}
                            disabled={disabled}
                        />
                        <FormErrorDisplay 
                            errors={errors} 
                            path={['core', 'clientInfo', 'demographics', 'address', 'state']} 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                            id="zipCode"
                            value={data.address.zipCode}
                            onChange={(e) => updateField(['address', 'zipCode'], e.target.value)}
                            disabled={disabled}
                        />
                        <FormErrorDisplay 
                            errors={errors} 
                            path={['core', 'clientInfo', 'demographics', 'address', 'zipCode']} 
                        />
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div>
                <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={data.contact.phone}
                            onChange={(e) => updateField(['contact', 'phone'], e.target.value)}
                            disabled={disabled}
                        />
                        <FormErrorDisplay 
                            errors={errors} 
                            path={['core', 'clientInfo', 'demographics', 'contact', 'phone']} 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.contact.email}
                            onChange={(e) => updateField(['contact', 'email'], e.target.value)}
                            disabled={disabled}
                        />
                        <FormErrorDisplay 
                            errors={errors} 
                            path={['core', 'clientInfo', 'demographics', 'contact', 'email']} 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Preferred Contact Method</Label>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="phone"
                                    checked={data.contact.preferredMethod === 'phone'}
                                    onChange={(e) => updateField(['contact', 'preferredMethod'], e.target.value)}
                                    disabled={disabled}
                                    className="mr-2"
                                />
                                Phone
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="email"
                                    checked={data.contact.preferredMethod === 'email'}
                                    onChange={(e) => updateField(['contact', 'preferredMethod'], e.target.value)}
                                    disabled={disabled}
                                    className="mr-2"
                                />
                                Email
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Emergency Contact */}
            <div>
                <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="emergencyName">Name</Label>
                        <Input
                            id="emergencyName"
                            value={data.emergency.name}
                            onChange={(e) => updateField(['emergency', 'name'], e.target.value)}
                            disabled={disabled}
                        />
                        <FormErrorDisplay 
                            errors={errors} 
                            path={['core', 'clientInfo', 'demographics', 'emergency', 'name']} 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="emergencyRelationship">Relationship</Label>
                        <Input
                            id="emergencyRelationship"
                            value={data.emergency.relationship}
                            onChange={(e) => updateField(['emergency', 'relationship'], e.target.value)}
                            disabled={disabled}
                        />
                        <FormErrorDisplay 
                            errors={errors} 
                            path={['core', 'clientInfo', 'demographics', 'emergency', 'relationship']} 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Phone</Label>
                        <Input
                            id="emergencyPhone"
                            type="tel"
                            value={data.emergency.phone}
                            onChange={(e) => updateField(['emergency', 'phone'], e.target.value)}
                            disabled={disabled}
                        />
                        <FormErrorDisplay 
                            errors={errors} 
                            path={['core', 'clientInfo', 'demographics', 'emergency', 'phone']} 
                        />
                    </div>
                </div>
            </div>

            {/* Insurance Information */}
            <div>
                <h3 className="text-lg font-medium mb-4">Insurance Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="insuranceProvider">Provider</Label>
                        <Input
                            id="insuranceProvider"
                            value={data.insurance.provider}
                            onChange={(e) => updateField(['insurance', 'provider'], e.target.value)}
                            disabled={disabled}
                        />
                        <FormErrorDisplay 
                            errors={errors} 
                            path={['core', 'clientInfo', 'demographics', 'insurance', 'provider']} 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="policyNumber">Policy Number</Label>
                        <Input
                            id="policyNumber"
                            value={data.insurance.policyNumber}
                            onChange={(e) => updateField(['insurance', 'policyNumber'], e.target.value)}
                            disabled={disabled}
                        />
                        <FormErrorDisplay 
                            errors={errors} 
                            path={['core', 'clientInfo', 'demographics', 'insurance', 'policyNumber']} 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="groupNumber">Group Number (Optional)</Label>
                        <Input
                            id="groupNumber"
                            value={data.insurance.groupNumber || ''}
                            onChange={(e) => updateField(['insurance', 'groupNumber'], e.target.value)}
                            disabled={disabled}
                        />
                        <FormErrorDisplay 
                            errors={errors} 
                            path={['core', 'clientInfo', 'demographics', 'insurance', 'groupNumber']} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemographicSection;