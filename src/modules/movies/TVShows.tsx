import React from 'react';
import { Navbar } from '@/components/global/Navbar';
import { Sidebar } from '@/components/global/Sidebar';

export const TVShows: React.FC = () => {
  const handleSearch = (query: string) => {
    window.location.href = `/movies?search=${encodeURIComponent(query)}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar onSearch={handleSearch} />
      <Sidebar />
      
      <main className="ml-64 pt-20 p-8">
        <h1 className="text-3xl font-bold mb-6">TV Shows</h1>
        <div className="text-center py-12 text-white/60">
          Coming soon...
        </div>
      </main>
    </div>
  );
};