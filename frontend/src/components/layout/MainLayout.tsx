import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const MainLayout: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#f8f5ec',
        position: 'relative',
      }}
    >
      {/* 1. Independent Fixed Sidebar (Position Fixed, 100vh, never stretches with content) */}
      <Sidebar />

      {/* 2. Main Content Wrapper: Offset by Sidebar width, fixed 100vh with internal scroll */}
      <div
        style={{
          marginLeft: '260px',
          width: 'calc(100vw - 260px)',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: '#f8f5ec',
        }}
      >
        <Navbar />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 32px',
            backgroundColor: '#f8f5ec',
            color: '#482e24',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
