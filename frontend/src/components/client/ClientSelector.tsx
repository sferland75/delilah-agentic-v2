import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { assessmentService } from '../../services/assessmentService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface ClientSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({ value, onChange }) => {
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => assessmentService.getClients()
  });

  if (isLoading) {
    return <div>Loading clients...</div>;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a client" />
      </SelectTrigger>
      <SelectContent>
        {clients?.map((client) => (
          <SelectItem key={client.id} value={client.id}>
            {client.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};