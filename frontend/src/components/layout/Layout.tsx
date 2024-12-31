import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    let breadcrumbs = [];
    let currentPath = '';

    for (const path of paths) {
      currentPath += `/${path}`;
      const name = path.charAt(0).toUpperCase() + path.slice(1);
      breadcrumbs.push({
        name: name === 'Assessments' ? 'Assessment Management' : name,
        path: currentPath,
      });
    }

    return breadcrumbs;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Assessment Module</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <nav className="flex px-4 sm:px-6 lg:px-8 py-3 bg-white border-b" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          {getBreadcrumbs().map((breadcrumb, index) => (
            <li key={breadcrumb.path}>
              <div className="flex items-center">
                {index > 0 && (
                  <svg
                    className="mr-4 h-5 w-5 flex-shrink-0 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                )}
                <button
                  onClick={() => navigate(breadcrumb.path)}
                  className={`text-sm font-medium ${
                    index === getBreadcrumbs().length - 1
                      ? 'text-gray-500 cursor-default'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {breadcrumb.name}
                </button>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer - if needed */}
      <footer className="bg-white border-t mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            Assessment Module © {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;