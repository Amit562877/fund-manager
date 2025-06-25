'use client';

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Wallet,
  LineChart,
  Target,
  CreditCard,
  Calculator,
  BookOpen,
  Menu,
  X,
  User,
  LogOut,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuthStore } from '../store/authStore';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const clearUser = useAuthStore((state) => state.clearUser);

  const handleLogout = async () => {
    await signOut(auth);
    clearUser();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LineChart size={16} /> },
    { to: '/budget', label: 'Budget Planning', icon: <Target size={16} /> },
    { to: '/emi', label: 'EMI Manager', icon: <CreditCard size={16} /> },
    { to: '/interest', label: 'Interest Tracker', icon: <Calculator size={16} /> },
    { to: '/khatabook', label: 'Khata Book', icon: <BookOpen size={16} /> },
    { to: '/checklist', label: 'Checklist', icon: <Menu size={16} /> },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 text-blue-700 font-bold text-lg">
          <Wallet className="text-blue-600" size={20} />
          FundManager
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2 bg-blue-50 p-2 rounded-xl shadow-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-blue-600'
                }`
              }
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Profile & Logout Button (desktop) */}
        <div className="hidden md:flex gap-4 items-center">
          <NavLink
            to="/profile"
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
          >
            <User size={16} /> Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:underline"
            title="Logout"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow px-4 pb-4">
          <nav className="flex flex-col gap-2 mt-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:text-blue-600'
                  }`
                }
              >
                {item.icon} {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-2">
            <NavLink
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
            >
              <User size={16} /> Profile
            </NavLink>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-2 text-sm font-medium text-red-600 hover:underline mt-2"
              title="Logout"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}