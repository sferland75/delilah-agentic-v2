import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-800">
                  Delilah Agentic
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <Link
                  to="/assessments/new"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  New Assessment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;