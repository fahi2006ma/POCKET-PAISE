import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import TransactionModal from './TransactionModal';
import SearchModal from './SearchModal';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Global Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTransactionSuccess = () => {
    // Notify children by bumping refreshTrigger
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#faf4ef] text-slate-800 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenAddModal={() => setAddModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopBar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenAddModal={() => setAddModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ refreshTrigger, onOpenAddModal: () => setAddModalOpen(true) }} />
        </main>
      </div>

      {/* Global Modals */}
      <TransactionModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleTransactionSuccess}
      />

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}
