import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Manage and create new assessments</p>
              <Button onClick={() => navigate('/assessments')}>
                View Assessments
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Manage your client information</p>
              <Button onClick={() => navigate('/clients')}>
                View Clients
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Create a new assessment</p>
              <Button onClick={() => navigate('/assessments/new')}>
                New Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;