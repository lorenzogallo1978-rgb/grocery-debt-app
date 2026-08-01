import React, { useMemo, useState } from 'react';
import { Plus, UserPlus, Phone, Edit2, Trash2, FileText } from 'lucide-react';
import { useApp } from './store';
import {
  Customer,
  customerBalance,
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

// ---------------- Customer List ----------------
export const CustomersScreen: React.FC = () => {
  const { data, navigate, addCustomer, updateCustomer, deleteCustomer, showToast } =
    useApp();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data.customers;
    return data.customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [data.customers, search]);

  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setShowForm(true);
  };
  const handleSave = (values: {
    name: string;
    phone: string;
    notes: string;
  }) => {
    if (!values.name.trim()) {
      showToast('الرجاء إدخال اسم الزبون');
      return;
    }
    if (editing) {
      updateCustomer(editing.id, values);
      showToast('تم تحديث الزبون');
    } else {
      addCustomer(values);
      showToast('تم إضافة الزبون');
    }
    setShowForm(false);
  };
  const handleDelete = () => {
    if (confirmDel) {
      deleteCustomer(confirmDel.id);
      showToast('تم حذف الزبون');
      setConfirmDel(null);
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="الزبائن"
        action={
          <button
            onClick={openAdd}
            className="text-sm font-bold text-teal-600 flex items-center gap-1"
          >
            <UserPlus size={16} />
            إضافة
          </button>
        }
      />

      <div className="px-4 py-4 pb-28">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="بحث بالاسم أو رقم الهاتف..."
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon={<UserPlus size={36} />}
            title={search ? 'لا توجد نتائج' : 'لا يوجد زبائن'}
            subtitle={
              search
                ? 'جرّب البحث بكلمة أخرى'
                : 'ابدأ بإضافة أول زبون لتسجيل حساباته'
            }
            action={
              !search && (
                <button
                  onClick={openAdd}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700"
                >
                  + إضافة زبون
                </button>
              )
            }
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {filtered.map((c, i) => {
              const balance = customerBalance(c, data.customerTransactions);
              const hasDebt = balance > 0;
              return (
                <button
                  key={c.id}
                  onClick={() =>
                    navigate({ name: 'customer-detail', id: c.id })
                  }
                  className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-slate-50 ${
                    i < filtered.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="font-bold text-slate-800 truncate">
                      {c.name}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {c.phone && (
                        <Phone size={12} className="text-slate-400" />
                      )}
                      <span className="text-xs text-slate-500 num truncate">
                        {c.phone || '—'}
                      </span>
                    </div>
                  </div>
                  <div className="text-left">
                    <div
                      className={`font-extrabold num text-sm ${
                        hasDebt ? 'text-rose-600' : balance < 0 ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {formatCurrency(Math.abs(balance))}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      {balance === 0
                        ? 'مسدّد'
                        : hasDebt
                        ? 'مدين'
                        : 'له رصيد'}
                    </div>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(c);
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

      <FAB onClick={openAdd} label="زبون جديد">
        <Plus size={20} />
      </FAB>

      {showForm && (
        <CustomerFormModal
          customer={editing}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
      <ConfirmDialog
        open={!!confirmDel}
        title="حذف الزبون؟"
        message={`سيتم حذف "${confirmDel?.name}" وجميع عملياته. لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
};

// ---------------- Customer Form Modal ----------------
const CustomerFormModal: React.FC<{
  customer: Customer | null;
  onClose: () => void;
  onSave: (v: { name: string; phone: string; notes: string }) => void;
}> = ({ customer, onClose, onSave }) => {
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [notes, setNotes] = useState(customer?.notes || '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, phone, notes });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={customer ? 'تعديل بيانات الزبون' : 'إضافة زبون جديد'}
    >
      <form onSubmit={submit}>
        <Field label="اسم الزبون" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: محمد أحمد"
            className={inputClass}
            autoFocus
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
            placeholder="ملاحظات إضافية..."
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
            className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
          >
            {customer ? 'حفظ التعديلات' : 'إضافة'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ---------------- Customer Detail ----------------
export const CustomerDetailScreen: React.FC<{ id: string }> = ({ id }) => {
  const { data, goBack, updateCustomer, deleteCustomer, addCustomerTx, deleteCustomerTx, showToast } =
    useApp();
  const customer = data.customers.find((c) => c.id === id);
  const [showTxForm, setShowTxForm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelCustomer, setConfirmDelCustomer] = useState(false);
  const [confirmDelTx, setConfirmDelTx] = useState<string | null>(null);

  if (!customer) {
    return (
      <div className="p-6 text-center text-slate-500">
        الزبون غير موجود
        <div className="mt-4">
          <button
            onClick={goBack}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-bold"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  const txs = data.customerTransactions
    .filter((t) => t.customerId === id)
    .sort((a, b) => b.date - a.date);
  const balance = customerBalance(customer, data.customerTransactions);
  const hasDebt = balance > 0;

  const handleAddTx = (values: {
    kind: 'debt' | 'payment';
    amount: number;
    description: string;
    date: number;
  }) => {
    addCustomerTx({
      customerId: id,
      kind: values.kind,
      amount: values.amount,
      description: values.description,
      date: values.date,
    });
    showToast(values.kind === 'debt' ? 'تم تسجيل الدين' : 'تم تسجيل الدفعة');
    setShowTxForm(false);
  };

  const handleDeleteTx = () => {
    if (confirmDelTx) {
      deleteCustomerTx(confirmDelTx);
      showToast('تم حذف العملية');
      setConfirmDelTx(null);
    }
  };

  const handleDeleteCustomer = () => {
    deleteCustomer(id);
    showToast('تم حذف الزبون');
    goBack();
  };

  const openWhatsApp = () => {
    const lines = [
      `كشف حساب: ${customer.name}`,
      `الهاتف: ${customer.phone || '-'}`,
      `الرصيد الحالي: ${formatCurrency(Math.abs(balance))} ${
        balance === 0 ? '(مسدّد)' : hasDebt ? '(مدين)' : '(له رصيد)'
      }`,
      '',
      '—— العمليات ——',
      ...txs.map(
        (t) =>
          `${t.kind === 'debt' ? '📕 دين' : '📗 دفعة'}: ${formatCurrency(
            t.amount
          )} - ${t.description || '—'} - ${new Date(t.date).toLocaleString(
            'ar-EG'
          )}`
      ),
    ];
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="تفاصيل الزبون"
        onBack={goBack}
        action={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowEdit(true)}
              className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600"
              aria-label="تعديل"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => setConfirmDelCustomer(true)}
              className="w-9 h-9 rounded-full hover:bg-rose-50 flex items-center justify-center text-rose-600"
              aria-label="حذف"
            >
              <Trash2 size={18} />
            </button>
          </div>
        }
      />

      <div className="px-4 py-4 pb-28">
        {/* Profile card */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="flex items-center gap-3 mb-4 relative">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              {customer.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="text-xl font-extrabold">{customer.name}</div>
              {customer.phone && (
                <a
                  href={`tel:${customer.phone}`}
                  className="text-sm text-white/80 num inline-flex items-center gap-1 mt-0.5"
                >
                  <Phone size={14} />
                  {customer.phone}
                </a>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="text-xs text-white/80 font-semibold mb-1">
              {balance === 0
                ? 'الرصيد (مسدّد)'
                : hasDebt
                ? 'إجمالي الدين المتبقي'
                : 'الرصيد لصالح الزبون'}
            </div>
            <div className="text-3xl font-extrabold num">
              {formatCurrency(Math.abs(balance))}
              <span className="text-sm font-bold mr-1 opacity-80">دينار</span>
            </div>
          </div>
          {customer.notes && (
            <div className="relative mt-3 text-sm text-white/80 bg-white/10 rounded-xl p-3">
              {customer.notes}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => setShowTxForm(true)}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">عملية جديدة</div>
              <div className="font-bold text-slate-800 text-sm">
                تسجيل دين / دفعة
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

        {/* Transactions list */}
        <div className="mt-6 mb-3 flex items-center justify-between">
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
              لا توجد عمليات بعد لهذا الزبون
            </p>
            <button
              onClick={() => setShowTxForm(true)}
              className="mt-4 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700"
            >
              + تسجيل عملية
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {txs.map((t, i) => {
              const isDebt = t.kind === 'debt';
              return (
                <div
                  key={t.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i < txs.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isDebt
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    {isDebt ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-800">
                      {isDebt ? 'دين (شراء بالآجل)' : 'دفعة مستلمة'}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {t.description || '—'}
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
                        isDebt ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {isDebt ? '+' : '-'}
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
        <CustomerTxFormModal
          balance={balance}
          onClose={() => setShowTxForm(false)}
          onSave={handleAddTx}
        />
      )}
      {showEdit && (
        <CustomerFormModal
          customer={customer}
          onClose={() => setShowEdit(false)}
          onSave={(v) => {
            updateCustomer(customer.id, v);
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
        open={confirmDelCustomer}
        title="حذف الزبون؟"
        message={`سيتم حذف "${customer.name}" وجميع عملياته نهائياً.`}
        confirmLabel="حذف"
        danger
        onConfirm={handleDeleteCustomer}
        onCancel={() => setConfirmDelCustomer(false)}
      />
    </div>
  );
};

// Customer transaction form
const CustomerTxFormModal: React.FC<{
  balance: number;
  onClose: () => void;
  onSave: (v: {
    kind: 'debt' | 'payment';
    amount: number;
    description: string;
    date: number;
  }) => void;
}> = ({ balance, onClose, onSave }) => {
  const [kind, setKind] = useState<'debt' | 'payment'>('debt');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    onSave({
      kind,
      amount: n,
      description: description.trim(),
      date: new Date(date).getTime() || Date.now(),
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="تسجيل عملية"
    >
      <form onSubmit={submit}>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setKind('debt')}
            className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${
              kind === 'debt'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-transparent text-slate-600'
            }`}
          >
            تسجيل دين (عليه)
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
            تسجيل دفعة (سدد)
          </button>
        </div>

        {balance !== 0 && (
          <div
            className={`mb-4 p-3 rounded-xl text-sm font-semibold ${
              balance > 0
                ? 'bg-rose-50 text-rose-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            الرصيد الحالي:{' '}
            <span className="num">{formatCurrency(Math.abs(balance))}</span>{' '}
            {balance > 0 ? '(مدين)' : '(له رصيد)'}
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
        <Field label="البيان / الأصناف">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="مثال: خبز، حليب، أرز..."
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
              kind === 'debt'
                ? 'bg-rose-600 hover:bg-rose-700'
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

