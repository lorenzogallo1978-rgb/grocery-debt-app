import React, { useMemo, useState } from 'react';
import { Plus, Phone, Edit2, Trash2, FileText, Building2 } from 'lucide-react';
import { useApp } from './store';
import {
  Supplier,
  supplierBalance,
  formatCurrency,
} from './types';
import {
  Modal,
  ConfirmDialog,
  EmptyState,
  Field,
  inputClass,
  SearchBar,
  FAB,
  PageHeader,
} from './ui';

// ---------------- Supplier List ----------------
export const SuppliersScreen: React.FC = () => {
  const { data, navigate, addSupplier, updateSupplier, deleteSupplier, showToast } =
    useApp();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Supplier | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data.suppliers;
    return data.suppliers.filter(
      (s) =>
        s.companyName.toLowerCase().includes(q) ||
        s.agentName.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q)
    );
  }, [data.suppliers, search]);

  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (s: Supplier) => {
    setEditing(s);
    setShowForm(true);
  };
  const handleSave = (values: {
    companyName: string;
    agentName: string;
    phone: string;
    notes: string;
  }) => {
    if (!values.companyName.trim()) {
      showToast('الرجاء إدخال اسم الشركة / المورد');
      return;
    }
    if (editing) {
      updateSupplier(editing.id, values);
      showToast('تم تحديث المورد');
    } else {
      addSupplier(values);
      showToast('تم إضافة المورد');
    }
    setShowForm(false);
  };
  const handleDelete = () => {
    if (confirmDel) {
      deleteSupplier(confirmDel.id);
      showToast('تم حذف المورد');
      setConfirmDel(null);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="الموردين"
        action={
          <button
            onClick={openAdd}
            className="text-sm font-bold text-orange-600 flex items-center gap-1"
          >
            <Plus size={16} />
            إضافة
          </button>
        }
      />

      <div className="px-4 py-4 pb-28">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="بحث بالاسم أو الوكيل أو الهاتف..."
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Building2 size={36} />}
            title={search ? 'لا توجد نتائج' : 'لا يوجد موردين'}
            subtitle={
              search
                ? 'جرّب البحث بكلمة أخرى'
                : 'ابدأ بإضافة أول مورد لتتبع بضاعتك بالآجل'
            }
            action={
              !search && (
                <button
                  onClick={openAdd}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700"
                >
                  + إضافة مورد
                </button>
              )
            }
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {filtered.map((s, i) => {
              const balance = supplierBalance(s, data.supplierTransactions);
              const owed = balance > 0;
              return (
                <button
                  key={s.id}
                  onClick={() =>
                    navigate({ name: 'supplier-detail', id: s.id })
                  }
                  className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-slate-50 ${
                    i < filtered.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {s.companyName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="font-bold text-slate-800 truncate">
                      {s.companyName}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {s.agentName ? `الوكيل: ${s.agentName}` : s.phone ? `📞 ${s.phone}` : '—'}
                    </div>
                  </div>
                  <div className="text-left">
                    <div
                      className={`font-extrabold num text-sm ${
                        owed ? 'text-orange-600' : balance < 0 ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {formatCurrency(Math.abs(balance))}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      {balance === 0 ? 'مسدّد' : owed ? 'مستحق' : 'له رصيد'}
                    </div>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(s);
                    }}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
                  >
                    <Edit2 size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <FAB onClick={openAdd} label="مورد جديد">
        <Plus size={20} />
      </FAB>

      {showForm && (
        <SupplierFormModal
          supplier={editing}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
      <ConfirmDialog
        open={!!confirmDel}
        title="حذف المورد؟"
        message={`سيتم حذف "${confirmDel?.companyName}" وجميع عملياته. لا يمكن التراجع.`}
        confirmLabel="حذف"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
};

// ---------------- Supplier Form Modal ----------------
const SupplierFormModal: React.FC<{
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (v: {
    companyName: string;
    agentName: string;
    phone: string;
    notes: string;
  }) => void;
}> = ({ supplier, onClose, onSave }) => {
  const [companyName, setCompanyName] = useState(supplier?.companyName || '');
  const [agentName, setAgentName] = useState(supplier?.agentName || '');
  const [phone, setPhone] = useState(supplier?.phone || '');
  const [notes, setNotes] = useState(supplier?.notes || '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ companyName, agentName, phone, notes });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={supplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
    >
      <form onSubmit={submit}>
        <Field label="اسم الشركة / المورد" required>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="مثال: شركة الأمل التجارية"
            className={inputClass}
            autoFocus
          />
        </Field>
        <Field label="اسم الوكيل / المندوب">
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="مثال: أحمد علي"
            className={inputClass}
          />
        </Field>
        <Field label="رقم الهاتف">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07xxxxxxxxx"
            className={inputClass}
            dir="ltr"
          />
        </Field>
        <Field label="ملاحظات">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="عنوان، تخصص، ملاحظات..."
            rows={3}
            className={inputClass}
          />
        </Field>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700"
          >
            {supplier ? 'حفظ التعديلات' : 'إضافة'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ---------------- Supplier Detail ----------------
export const SupplierDetailScreen: React.FC<{ id: string }> = ({ id }) => {
  const {
    data,
    goBack,
    updateSupplier,
    deleteSupplier,
    addSupplierTx,
    deleteSupplierTx,
    showToast,
  } = useApp();
  const supplier = data.suppliers.find((s) => s.id === id);
  const [showTxForm, setShowTxForm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelSupplier, setConfirmDelSupplier] = useState(false);
  const [confirmDelTx, setConfirmDelTx] = useState<string | null>(null);

  if (!supplier) {
    return (
      <div className="p-6 text-center text-slate-500">
        المورد غير موجود
        <div className="mt-4">
          <button
            onClick={goBack}
            className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-bold"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  const txs = data.supplierTransactions
    .filter((t) => t.supplierId === id)
    .sort((a, b) => b.date - a.date);
  const balance = supplierBalance(supplier, data.supplierTransactions);
  const owed = balance > 0;

  const handleAddTx = (values: {
    kind: 'goods' | 'payment';
    amount: number;
    description: string;
    invoice: string;
    date: number;
  }) => {
    addSupplierTx({
      supplierId: id,
      kind: values.kind,
      amount: values.amount,
      description: values.description,
      invoice: values.invoice,
      date: values.date,
    });
    showToast(values.kind === 'goods' ? 'تم تسجيل البضاعة' : 'تم تسجيل الدفعة');
    setShowTxForm(false);
  };

  const handleDeleteTx = () => {
    if (confirmDelTx) {
      deleteSupplierTx(confirmDelTx);
      showToast('تم حذف العملية');
      setConfirmDelTx(null);
    }
  };

  const handleDeleteSupplier = () => {
    deleteSupplier(id);
    showToast('تم حذف المورد');
    goBack();
  };

  const openWhatsApp = () => {
    const lines = [
      `كشف حساب المورد: ${supplier.companyName}`,
      `الوكيل: ${supplier.agentName || '-'}`,
      `الهاتف: ${supplier.phone || '-'}`,
      `المستحق الحالي: ${formatCurrency(Math.abs(balance))} ${
        balance === 0 ? '(مسدّد)' : owed ? '(علينا)' : '(لهم رصيد)'
      }`,
      '',
      '—— العمليات ——',
      ...txs.map(
        (t) =>
          `${t.kind === 'goods' ? '📦 بضاعة' : '💰 دفعة'}: ${formatCurrency(
            t.amount
          )} ${t.invoice ? `- فاتورة ${t.invoice}` : ''} - ${
            t.description || '—'
          } - ${new Date(t.date).toLocaleString('ar-EG')}`
      ),
    ];
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="تفاصيل المورد"
        onBack={goBack}
        action={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowEdit(true)}
              className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => setConfirmDelSupplier(true)}
              className="w-9 h-9 rounded-full hover:bg-rose-50 flex items-center justify-center text-rose-600"
            >
              <Trash2 size={18} />
            </button>
          </div>
        }
      />

      <div className="px-4 py-4 pb-28">
        {/* Profile card */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="flex items-center gap-3 mb-4 relative">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              {supplier.companyName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-extrabold truncate">
                {supplier.companyName}
              </div>
              {supplier.agentName && (
                <div className="text-sm text-white/90">
                  الوكيل: {supplier.agentName}
                </div>
              )}
              {supplier.phone && (
                <a
                  href={`tel:${supplier.phone}`}
                  className="text-sm text-white/80 num inline-flex items-center gap-1 mt-0.5"
                >
                  <Phone size={14} />
                  {supplier.phone}
                </a>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="text-xs text-white/80 font-semibold mb-1">
              {balance === 0
                ? 'الرصيد (مسدّد)'
                : owed
                ? 'إجمالي المستحق للمورد'
                : 'الرصيد لصالح المورد'}
            </div>
            <div className="text-3xl font-extrabold num">
              {formatCurrency(Math.abs(balance))}
              <span className="text-sm font-bold mr-1 opacity-80">دينار</span>
            </div>
          </div>
          {supplier.notes && (
            <div className="relative mt-3 text-sm text-white/90 bg-white/10 rounded-xl p-3">
              {supplier.notes}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => setShowTxForm(true)}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">عملية جديدة</div>
              <div className="font-bold text-slate-800 text-sm">
                بضاعة / دفعة
              </div>
            </div>
          </button>
          <button
            onClick={openWhatsApp}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">مشاركة</div>
              <div className="font-bold text-slate-800 text-sm">
                كشف حساب
              </div>
            </div>
          </button>
        </div>

        {/* Transactions */}
        <div className="mt-6 mb-3">
          <h2 className="text-base font-bold text-slate-800">
            سجل العمليات ({txs.length})
          </h2>
        </div>

        {txs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
              <FileText size={28} />
            </div>
            <p className="text-sm text-slate-500">
              لا توجد عمليات بعد لهذا المورد
            </p>
            <button
              onClick={() => setShowTxForm(true)}
              className="mt-4 px-5 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700"
            >
              + تسجيل عملية
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {txs.map((t, i) => {
              const isGoods = t.kind === 'goods';
              return (
                <div
                  key={t.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i < txs.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isGoods
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    {isGoods ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-800">
                      {isGoods ? 'بضاعة بالآجل' : 'دفع للمورد'}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {t.description || '—'}
                      {t.invoice && ` • فاتورة ${t.invoice}`}
                    </div>
                    <div className="text-[11px] text-slate-400 num mt-0.5">
                      {new Date(t.date).toLocaleString('ar-EG', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>
                  <div className="text-left">
                    <div
                      className={`font-extrabold num text-sm ${
                        isGoods ? 'text-orange-600' : 'text-emerald-600'
                      }`}
                    >
                      {isGoods ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </div>
                    <button
                      onClick={() => setConfirmDelTx(t.id)}
                      className="text-[11px] text-slate-400 hover:text-rose-600 mt-0.5"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <FAB onClick={() => setShowTxForm(true)} label="عملية جديدة">
        <Plus size={20} />
      </FAB>

      {showTxForm && (
        <SupplierTxFormModal
          balance={balance}
          onClose={() => setShowTxForm(false)}
          onSave={handleAddTx}
        />
      )}
      {showEdit && (
        <SupplierFormModal
          supplier={supplier}
          onClose={() => setShowEdit(false)}
          onSave={(v) => {
            updateSupplier(supplier.id, v);
            showToast('تم تحديث البيانات');
            setShowEdit(false);
          }}
        />
      )}
      <ConfirmDialog
        open={!!confirmDelTx}
        title="حذف العملية؟"
        message="هل تريد حذف هذه العملية؟"
        confirmLabel="حذف"
        danger
        onConfirm={handleDeleteTx}
        onCancel={() => setConfirmDelTx(null)}
      />
      <ConfirmDialog
        open={confirmDelSupplier}
        title="حذف المورد؟"
        message={`سيتم حذف "${supplier.companyName}" وجميع عملياته نهائياً.`}
        confirmLabel="حذف"
        danger
        onConfirm={handleDeleteSupplier}
        onCancel={() => setConfirmDelSupplier(false)}
      />
    </div>
  );
};

// Supplier tx form
const SupplierTxFormModal: React.FC<{
  balance: number;
  onClose: () => void;
  onSave: (v: {
    kind: 'goods' | 'payment';
    amount: number;
    description: string;
    invoice: string;
    date: number;
  }) => void;
}> = ({ balance, onClose, onSave }) => {
  const [kind, setKind] = useState<'goods' | 'payment'>('goods');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [invoice, setInvoice] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    onSave({
      kind,
      amount: n,
      description: description.trim(),
      invoice: invoice.trim(),
      date: new Date(date).getTime() || Date.now(),
    });
  };

  return (
    <Modal open onClose={onClose} title="تسجيل عملية">
      <form onSubmit={submit}>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setKind('goods')}
            className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${
              kind === 'goods'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-transparent text-slate-600'
            }`}
          >
            بضاعة بالآجل (علينا)
          </button>
          <button
            type="button"
            onClick={() => setKind('payment')}
            className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${
              kind === 'payment'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-transparent text-slate-600'
            }`}
          >
            دفع للمورد (سددنا)
          </button>
        </div>

        {balance !== 0 && (
          <div
            className={`mb-4 p-3 rounded-xl text-sm font-semibold ${
              balance > 0
                ? 'bg-orange-50 text-orange-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            المستحق الحالي:{' '}
            <span className="num">{formatCurrency(Math.abs(balance))}</span>{' '}
            {balance > 0 ? '(علينا)' : '(رصيد لهم)'}
          </div>
        )}

        <Field label="المبلغ" required>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={inputClass}
            autoFocus
            min="0"
            step="0.01"
          />
        </Field>
        <Field label="رقم الفاتورة / التفاصيل">
          <input
            type="text"
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
            placeholder="مثال: فاتورة رقم 1234"
            className={inputClass}
          />
        </Field>
        <Field label="البيان / الأصناف">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="مثال: زيت، سكر، سمون..."
            className={inputClass}
          />
        </Field>
        <Field label="التاريخ والوقت">
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className={`flex-1 py-3 rounded-xl text-white font-semibold ${
              kind === 'goods'
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            حفظ
          </button>
        </div>
      </form>
    </Modal>
  );
};
