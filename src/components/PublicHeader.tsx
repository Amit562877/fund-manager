'use client';

import { Wallet } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function PublicHeader() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 text-blue-700 font-bold text-lg">
          <Wallet className="text-blue-600" size={20} />
          FundManager
        </NavLink>
      </div>
    </header>
  );
}