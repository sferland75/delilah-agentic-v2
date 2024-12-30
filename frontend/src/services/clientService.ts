import { Client, ClientFormData } from '../types/client';

// Mock data for development
const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    dateOfBirth: '1965-06-15',
    email: 'john.smith@email.com',
    phone: '604-555-0123',
    address: '123 Main St, Vancouver, BC',
    emergencyContact: {
      name: 'Mary Smith',
      relationship: 'Spouse',
      phone: '604-555-0124'
    },
    medicalHistory: 'Hip replacement, hypertension',
    insuranceInfo: {
      provider: 'Extended Health',
      policyNumber: 'EH123456'
    },
    status: 'active',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    dateOfBirth: '1978-03-22',
    email: 'sarah.j@email.com',
    phone: '604-555-0125',
    address: '456 Oak Drive, Surrey, BC',
    emergencyContact: {
      name: 'Tom Johnson',
      relationship: 'Spouse',
      phone: '604-555-0126'
    },
    medicalHistory: 'Work-related back injury',
    insuranceInfo: {
      provider: 'WorkSafe BC',
      policyNumber: 'WCB789012'
    },
    status: 'active',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z'
  },
  {
    id: '3',
    name: 'Robert Chen',
    dateOfBirth: '1982-11-08',
    email: 'robert.c@email.com',
    phone: '604-555-0127',
    address: '789 Pine Street, Burnaby, BC',
    emergencyContact: {
      name: 'Lisa Chen',
      relationship: 'Sister',
      phone: '604-555-0128'
    },
    medicalHistory: 'Stroke rehabilitation',
    insuranceInfo: {
      provider: 'BC Medical',
      policyNumber: 'BCM345678'
    },
    status: 'active',
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-15T13:45:00Z'
  }
];

class ClientService {
  // For development, use mock data
  private mockClients = [...MOCK_CLIENTS];

  async getAll(): Promise<Client[]> {
    return this.mockClients;
  }

  async getById(id: string): Promise<Client> {
    const client = this.mockClients.find(c => c.id === id);
    if (!client) throw new Error('Client not found');
    return client;
  }

  async create(data: ClientFormData): Promise<Client> {
    const newClient: Client = {
      ...data,
      id: (this.mockClients.length + 1).toString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.mockClients.push(newClient);
    return newClient;
  }

  async update(id: string, data: Partial<ClientFormData>): Promise<Client> {
    const index = this.mockClients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Client not found');

    const updatedClient = {
      ...this.mockClients[index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.mockClients[index] = updatedClient;
    return updatedClient;
  }

  async delete(id: string): Promise<void> {
    const index = this.mockClients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Client not found');

    this.mockClients.splice(index, 1);
  }
}

export const clientService = new ClientService();