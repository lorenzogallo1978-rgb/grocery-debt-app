import React from 'react';
import {
  Users,
  Building2,
  TrendingDown,
  TrendingUp,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from './store';
import {
  customerBalance,
  formatCurrency,
  formatShortDate,
  supplierBalance,
} from './types';
import { SummaryCard, SectionHeading, EmptyState } from './ui';

export const HomeScreen: React.FC = () => {
  const { data, navigate } = useApp();

  const totalCustomerDebt = data.customers.reduce(
    (sum, c) => sum + Math.max(0, customerBalance(c, data.customerTransactions)),
    0
  );
  const totalSupplierDebt = data.suppliers.reduce(
    (sum, s) => sum + Math.max(0, supplierBalance(s, data.supplierTransactions)),
    0
  );

  // Customers who owe us the most
  const topDebtors = [...data.customers]
    .map((c) => ({
      c,
      balance: customerBalance(c, data.customerTransactions),
    }))
    .filter((x) => x.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  // Suppliers we owe the most
  const topSuppliers = [...data.suppliers]
    .map((s) => ({
      s,
      balance: supplierBalance(s, data.supplierTransactions),
    }))
    .filter((x) => x.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  // Recent transactions (both types)
  const recentTxs = [
    ...data.customerTransactions.map((t) => ({
      id: t.id,
      date: t.date,
      amount: t.amount,
      kind: t.kind === 'debt' ? 'دين جديد' : 'دفعة مستلمة',
      party:
        data.customers.find((c) => c.id === t.customerId)?.name || '—',
      isDebt: t.kind === 'debt',
      detail: t.description,
    })),
    ...data.supplierTransactions.map((t) => ({
      id: t.id,
      date: t.date,
      amount: t.amount,
      kind: t.kind === 'goods' ? 'بضاعة بالآجل' : 'دفع للمورد',
      party:
        data.suppliers.find((s) => s.id === t.supplierId)?.companyName || '—',
      isDebt: t.kind === 'goods',
      detail: t.description,
    })),
  ].sort((a, b) => b.date - a.date).slice(0, 6);

  const hasAnyData =
    data.customers.length > 0 || data.suppliers.length > 0;

  return (
    <div className="fade-in">
      {/* Hero header */}
      <div className="bg-gradient-to-bl from-teal-600 via-teal-700 to-emerald-700 text-white px-5 pt-10 pb-20 relative overflow-hidden">
        <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute -right-16 -bottom-24 w-64 h-64 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-white/80">دفتر الحسابات</span>
          </div>
          <h1 className="text-2xl font-extrabold">السلام عليكم 👋</h1>
          <p className="text-white/80 text-sm mt-1">
            هذا ملخص حساباتك اليوم
          </p>
        </div>
      </div>

      <div className="px-4 -mt-14 pb-8">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <SummaryCard
            title="ديون الزبائن (علينا)"
            value={formatCurrency(totalCustomerDebt)}
            subtitle={`${data.customers.length} زبون`}
            gradient="bg-gradient-to-br from-rose-500 to-rose-600"
            icon={<TrendingDown size={20} />}
            onClick={() => navigate({ name: 'customers' })}
          />
          <SummaryCard
            title="مستحقات الموردين (لهم)"
            value={formatCurrency(totalSupplierDebt)}
            subtitle={`${data.suppliers.length} مورد`}
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            icon={<TrendingUp size={20} />}
            onClick={() => navigate({ name: 'suppliers' })}
          />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3 mb-2">
          <button
            onClick={() => navigate({ name: 'customers' })}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2"
          >
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users size={22} />
            </div>
            <span className="text-xs font-bold text-slate-700">الزبائن</span>
          </button>
          <button
            onClick={() => navigate({ name: 'suppliers' })}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2"
          >
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Building2 size={22} />
            </div>
            <span className="text-xs font-bold text-slate-700">الموردين</span>
          </button>
          <button
            onClick={() => {
              // Pick a quick action: open a modal-ish quick-add on customers
              navigate({ name: 'customers' });
            }}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Plus size={22} />
            </div>
            <span className="text-xs font-bold text-slate-700">إضافة</span>
          </button>
        </div>

        {!hasAnyData ? (
          <EmptyState
            icon={<Plus size={36} />}
            title="لا توجد بيانات بعد"
            subtitle="ابدأ بإضافة أول زبون أو مورد لتتبع حساباتك"
            action={
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => navigate({ name: 'customers' })}
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700"
                >
                  إضافة زبون
                </button>
                <button
                  onClick={() => navigate({ name: 'suppliers' })}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50"
                >
                  إضافة مورد
                </button>
              </div>
            }
          />
        ) : (
          <>
            <SectionHeading
              title="أكبر الزبائن مديونية"
              action={
                <button
                  onClick={() => navigate({ name: 'customers' })}
                  className="text-xs font-semibold text-teal-600 flex items-center gap-1"
                >
                  عرض الكل
                  <ArrowLeft size={14} />
                </button>
              }
            />
            {topDebtors.length === 0 ? (
              <div className="bg-white rounded-2xl p-4 text-sm text-slate-500 text-center">
                لا توجد ديون على الزبائن
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {topDebtors.map((x, i) => (
                  <button
                    key={x.c.id}
                    onClick={() =>
                      navigate({ name: 'customer-detail', id: x.c.id })
                    }
                    className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-slate-50 ${
                      i < topDebtors.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                      {x.c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 truncate">
                        {x.c.name}
                      </div>
                      {x.c.phone && (
                        <div className="text-xs text-slate-500 num truncate">
                          {x.c.phone}
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-rose-600 num">
                        {formatCurrency(x.balance)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        دينار
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <SectionHeading
              title="أكبر مستحقات الموردين"
              action={
                <button
                  onClick={() => navigate({ name: 'suppliers' })}
                  className="text-xs font-semibold text-orange-600 flex items-center gap-1"
                >
                  عرض الكل
                  <ArrowLeft size={14} />
                </button>
              }
            />
            {topSuppliers.length === 0 ? (
              <div className="bg-white rounded-2xl p-4 text-sm text-slate-500 text-center">
                لا توجد مستحقات للموردين
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {topSuppliers.map((x, i) => (
                  <button
                    key={x.s.id}
                    onClick={() =>
                      navigate({ name: 'supplier-detail', id: x.s.id })
                    }
                    className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-slate-50 ${
                      i < topSuppliers.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                      {x.s.companyName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 truncate">
                        {x.s.companyName}
                      </div>
                      {x.s.agentName && (
                        <div className="text-xs text-slate-500 truncate">
                          الوكيل: {x.s.agentName}
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-orange-600 num">
                        {formatCurrency(x.balance)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        دينار
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <SectionHeading title="آخر العمليات" />
            {recentTxs.length === 0 ? (
              <div className="bg-white rounded-2xl p-4 text-sm text-slate-500 text-center">
                لا توجد عمليات مسجلة
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {recentTxs.map((t, i) => (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i < recentTxs.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        t.isDebt ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      {t.isDebt ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-800 truncate">
                        {t.party}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t.kind} • {formatShortDate(t.date)}
                      </div>
                    </div>
                    <div
                      className={`font-extrabold num text-sm ${
                        t.isDebt ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {t.isDebt ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
