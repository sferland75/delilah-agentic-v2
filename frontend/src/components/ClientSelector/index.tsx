import React from 'react';
import { clientService } from '../../services/clientService';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

const ClientSelector: React.FC<Props> = ({ value, onChange, required, className }) => {
  const [clients, setClients] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await clientService.getAll();
        setClients(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load clients');
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  if (loading) return <div>Loading clients...</div>;
  if (error) return <div>Error: {error}</div>;

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
      {clients.map((client) => (
        <option key={client.id} value={client.id}>
          {client.name}
        </option>
      ))}
    </select>
  );
};

export default ClientSelector;