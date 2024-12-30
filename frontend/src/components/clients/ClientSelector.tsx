import React from 'react';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

const ClientSelector: React.FC<Props> = ({ value, onChange }) => {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
            <option value="">Select a client...</option>
            <option value="1">John Doe</option>
            <option value="2">Jane Smith</option>
            {/* Add more options here */}
        </select>
    );
};

export default ClientSelector;