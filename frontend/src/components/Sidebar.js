import React, { useState } from 'react';
import { Menu, X, Home, Wallet, Smartphone, ShoppingBag, Users, Settings, LogOut } from 'lucide-react';
import { Button } from './ui/button';

const Sidebar = ({ activeTab, setActiveTab, onLogout, userType = 'user' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const userMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'recharge', label: 'Recharge', icon: Smartphone },
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
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-50 md:hidden p-3 rounded-lg bg-white shadow-lg border-2 border-purple-200 hover:bg-purple-50 transition-colors"
        data-testid="menu-toggle"
      >
        {isOpen ? <X className="w-6 h-6 text-purple-600" /> : <Menu className="w-6 h-6 text-purple-600" />}
      </button>

      {/* Desktop Sidebar - Always visible on desktop, slide on mobile */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 shadow-2xl transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 w-72`}
      >
        {/* Logo Section */}
        <div className="p-8 border-b border-purple-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xl flex items-center justify-center">
              <Wallet className="w-7 h-7 text-purple-200" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Smartpay360
              </h2>
            </div>
          </div>
          <p className="text-sm text-purple-200 ml-1">
            {userType === 'admin' ? 'Admin Panel' : 'User Dashboard'}
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-purple-900 shadow-lg font-semibold'
                    : 'text-purple-100 hover:bg-white/10 hover:text-white'
                }`}
                data-testid={`sidebar-${item.id}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : ''}`} />
                <span className="text-base">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-700/50">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-red-200 hover:bg-red-500/20 hover:text-white transition-all"
            data-testid="sidebar-logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-base font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
