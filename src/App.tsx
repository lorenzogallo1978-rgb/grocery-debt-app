import React from 'react';
import { Home, Users, Building2, Settings } from 'lucide-react';
import { AppProvider, useApp } from './store';
import { HomeScreen } from './HomeScreen';
import { CustomersScreen, CustomerDetailScreen } from './CustomersScreen';
import { SuppliersScreen, SupplierDetailScreen } from './SuppliersScreen';
import { SettingsScreen } from './SettingsScreen';
import { TabKey, Screen } from './types';
import { Toast } from './ui';

const TABS: {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  screen: Screen;
}[] = [
  { key: 'home', label: 'الرئيسية', icon: <Home size={22} />, screen: { name: 'home' } },
  { key: 'customers', label: 'الزبائن', icon: <Users size={22} />, screen: { name: 'customers' } },
  { key: 'suppliers', label: 'الموردين', icon: <Building2 size={22} />, screen: { name: 'suppliers' } },
  { key: 'settings', label: 'الإعدادات', icon: <Settings size={22} />, screen: { name: 'settings' } },
];

const Router: React.FC = () => {
  const { screen, navigate, toast } = useApp();

  let view: React.ReactNode;
  let activeTab: TabKey = 'home';

  switch (screen.name) {
    case 'home':
      view = <HomeScreen />;
      activeTab = 'home';
      break;
    case 'customers':
      view = <CustomersScreen />;
      activeTab = 'customers';
      break;
    case 'customer-detail':
      view = <CustomerDetailScreen id={screen.id} />;
      activeTab = 'customers';
      break;
    case 'suppliers':
      view = <SuppliersScreen />;
      activeTab = 'suppliers';
      break;
    case 'supplier-detail':
      view = <SupplierDetailScreen id={screen.id} />;
      activeTab = 'suppliers';
      break;
    case 'settings':
      view = <SettingsScreen />;
      activeTab = 'settings';
      break;
    default:
      view = <HomeScreen />;
  }

  return (
    <div className="min-h-full flex flex-col">
      <main className="flex-1 pb-20 max-w-3xl mx-auto w-full">{view}</main>
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-3xl mx-auto grid grid-cols-4">
          {TABS.map((t) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => navigate(t.screen)}
                className={`flex flex-col items-center gap-1 py-2.5 transition-colors ${
                  active ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div
                  className={`w-10 h-8 flex items-center justify-center rounded-lg transition-colors ${
                    active ? 'bg-teal-50' : ''
                  }`}
                >
                  {t.icon}
                </div>
                <span className={`text-[11px] font-semibold ${active ? 'font-bold' : ''}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* iPhone safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
      <Toast message={toast} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
