interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface InsuranceInfo {
  provider: string;
  policyNumber: string;
}

export interface Client {
  id: string;
  name: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: EmergencyContact;
  medicalHistory: string;
  insuranceInfo: InsuranceInfo;
  status: 'active' | 'inactive' | 'discharged';
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormData {
  name: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: EmergencyContact;
  medicalHistory: string;
  insuranceInfo: InsuranceInfo;
}