import React, { useState } from 'react';
import { Bell, Menu, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LogoIcon } from './Logo';

const Topbar = ({ title, onMenuToggle }) => {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'PW';

  return (
    <header className="topbar">
      <button className="topbar-icon-btn mobile-menu-btn" onClick={onMenuToggle} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="topbar-logo-icon-mobile">
          <LogoIcon size={26} />
        </div>
        <div className="topbar-title">{title}</div>
      </div>
      <div className="topbar-spacer" />
      <span className="demo-badge">DEMO MODE</span>
      <button className="topbar-icon-btn" aria-label="Notifications">
        <Bell size={18} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="user-avatar" style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
