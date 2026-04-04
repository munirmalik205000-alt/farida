import React, { useState } from 'react';
import { Menu, X, Home, Wallet, Smartphone, ShoppingBag, Users, Settings, LogOut } from 'lucide-react';
import { Button } from './ui/button';

const Sidebar = ({ activeTab, setActiveTab, onLogout, userType = 'user' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const userMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'recharge', label: 'Recharge', icon: Smartphone },
    { id: 'packages', label: 'Packages', icon: ShoppingBag },
    { id: 'ecommerce', label: 'E-commerce', icon: ShoppingBag },
    { id: 'mlm', label: 'MLM', icon: Users },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Overview', icon: Home },
    { id: 'requests', label: 'Fund Requests', icon: Wallet },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'packages', label: 'Packages', icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const menuItems = userType === 'admin' ? adminMenuItems : userMenuItems;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-white shadow-lg border border-purple-200"
        data-testid="menu-toggle"
      >
        {isOpen ? <X className="w-6 h-6 text-purple-600" /> : <Menu className="w-6 h-6 text-purple-600" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-purple-100 shadow-lg transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 w-64`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-purple-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Smartpay360
          </h2>
          <p className="text-sm text-slate-500 mt-1">{userType === 'admin' ? 'Admin Panel' : 'User Dashboard'}</p>
        </div>

        <nav className="px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md mb-2 transition-colors ${
                  activeTab === item.id
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-slate-600 hover:bg-purple-50'
                }`}
                data-testid={`sidebar-${item.id}`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md mb-2 text-red-600 hover:bg-red-50 transition-colors mt-4"
            data-testid="sidebar-logout"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
