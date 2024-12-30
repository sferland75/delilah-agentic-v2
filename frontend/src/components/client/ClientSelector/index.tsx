import React from 'react';
import { useQuery } from 'react-query';
import { cn } from '@/lib/utils';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { assessmentService } from '../../../services/assessmentService';

interface Props {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

const ClientSelector: React.FC<Props> = ({ value, onChange, required, className }) => {
  const { data: clients, isLoading, error } = useQuery(['clients'], () => assessmentService.getClients());

  if (isLoading) return <LoadingSpinner size="sm" />;
  if (error) return <div>Error loading clients</div>;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={cn(
        "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
        className
      )}
    >
      <option value="">Select a client...</option>
      {clients?.map((client) => (
        <option key={client.id} value={client.id}>
          {client.name}
        </option>
      ))}
    </select>
  );
};

export default ClientSelector;