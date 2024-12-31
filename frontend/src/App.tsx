import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AssessmentList from './components/assessment/AssessmentList';
import AssessmentForm from './components/assessment/AssessmentForm';
import AssessmentView from './components/assessment/AssessmentView';
import { Layout } from './components/layout/Layout';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/assessments" replace />} />
          <Route path="/assessments" element={<AssessmentList />} />
          <Route path="/assessments/new" element={<AssessmentForm />} />
          <Route path="/assessments/:id" element={<AssessmentView />} />
          <Route path="/assessments/:id/edit" element={<AssessmentForm />} />
        </Routes>
      </Layout>
    </QueryClientProvider>
  );
}

export default App;