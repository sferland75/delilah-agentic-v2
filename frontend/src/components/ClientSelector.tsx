import React from 'react';

interface ClientSelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ value, onChange, required }) => {
  // TODO: Replace with actual client data from API
  const mockClients = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Bob Johnson' },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      required={required}
    >
      <option value="">Select a client</option>
      {mockClients.map((client) => (
        <option key={client.id} value={client.id}>
          {client.name}
        </option>
      ))}
    </select>
  );
};

export default ClientSelector;