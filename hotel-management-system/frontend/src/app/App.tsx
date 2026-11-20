import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { QueryProvider } from './providers/QueryProvider';
import { router } from './router';

export const App: React.FC = () => {
  return (
    <QueryProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryProvider>
  );
};

export default App;
