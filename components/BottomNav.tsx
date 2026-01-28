
import React from 'react';
import { View } from '../types';

interface BottomNavProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const primaryColor = '#72E8F6';
  
  const navItems = [
    { id: View.HOME, label: 'Início', icon: 'home' },
    { id: View.PIX, label: 'Área Pix', icon: 'sync_alt' },
    { id: View.LOJAS_ABERTAS, label: 'Loja', icon: 'shopping_bag' },
    { id: View.CARTAO, label: 'Cartões', icon: 'credit_card' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-[#EDEDED] flex justify-center py-4 px-2 z-40">
      <div className="w-full max-w-[1200px] flex justify-around">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center gap-1 transition-all flex-1 max-w-[100px]"
              style={{ color: isActive ? primaryColor : '#6B6B6B' }}
            >
              <span className="material-icons-outlined text-[24px]">
                {item.icon}
              </span>
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
