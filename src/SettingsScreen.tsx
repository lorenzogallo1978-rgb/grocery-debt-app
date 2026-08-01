import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  Database,
  Trash2,
  Printer,
  Info,
  UserPlus,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useApp } from './store';
import {
  customerBalance,
  formatCurrency,
  supplierBalance,
} from './types';
import { ConfirmDialog, PageHeader } from './ui';
import { InstallGuide } from './InstallGuide';

export const SettingsScreen: React.FC = () => {
  const { data, exportBackup, importBackup, clearAll, showToast } = useApp();
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importBackup(file);
      showToast('تم استعادة النسخة الاحتياطية');
    } catch (err) {
      console.error(err);
      showToast('فشل استيراد الملف');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClear = () => {
    clearAll();
    showToast('تم حذف جميع البيانات');
    setConfirmClear(false);
  };

  // Generate full PDF report (customers + suppliers)
  const exportFullPdf = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Grocery Ledger Report', pageW / 2, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Generated: ${new Date().toLocaleString('en-US')}`,
      pageW / 2,
      26,
      { align: 'center' }
    );

    // Customers section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Customers (Debtors)', 14, 38);

    const customerRows = data.customers.map((c) => {
      const b = customerBalance(c, data.customerTransactions);
      return [
        c.name,
        c.phone || '-',
        data.customerTransactions.filter((t) => t.customerId === c.id).length.toString(),
        `${formatCurrency(Math.abs(b))} ${b > 0 ? '(Owes)' : b < 0 ? '(Credit)' : '(Settled)'}`,
      ];
    });

    autoTable(doc, {
      startY: 42,
      head: [['Name', 'Phone', 'Transactions', 'Balance']],
      body: customerRows,
      styles: { halign: 'left', fontSize: 9 },
      headStyles: { fillColor: [13, 118, 110] },
    });

    // Suppliers section
    // @ts-ignore
    const afterCustomers = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Suppliers (Payables)', 14, afterCustomers);

    const supplierRows = data.suppliers.map((s) => {
      const b = supplierBalance(s, data.supplierTransactions);
      return [
        s.companyName,
        s.agentName || '-',
        s.phone || '-',
        `${formatCurrency(Math.abs(b))} ${b > 0 ? '(Owed)' : b < 0 ? '(Credit)' : '(Settled)'}`,
      ];
    });

    autoTable(doc, {
      startY: afterCustomers + 4,
      head: [['Company', 'Agent', 'Phone', 'Balance']],
      body: supplierRows,
      styles: { halign: 'left', fontSize: 9 },
      headStyles: { fillColor: [234, 88, 12] },
    });

    doc.save(`grocery-ledger-${new Date().toISOString().slice(0, 10)}.pdf`);
    showToast('تم تصدير التقرير');
  };

  // Export customer statement
  const exportCustomersPdf = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Statements', pageW / 2, 16, { align: 'center' });

    let firstPage = true;
    data.customers.forEach((c) => {
      const txs = data.customerTransactions
        .filter((t) => t.customerId === c.id)
        .sort((a, b) => a.date - b.date);
      const balance = customerBalance(c, data.customerTransactions);

      if (!firstPage) doc.addPage();
      firstPage = false;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${c.name} - ${c.phone || '-'}`, 14, 14);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Balance: ${formatCurrency(Math.abs(balance))}`, 14, 20);

      const rows = txs.map((t) => [
        new Date(t.date).toLocaleString('en-US'),
        t.kind === 'debt' ? 'Debt' : 'Payment',
        t.description || '-',
        formatCurrency(t.amount),
      ]);

      autoTable(doc, {
        startY: 24,
        head: [['Date', 'Type', 'Description', 'Amount']],
        body: rows,
        styles: { halign: 'left', fontSize: 9 },
        headStyles: { fillColor: [13, 118, 110] },
      });
    });

    if (data.customers.length === 0) {
      doc.text('No customers found.', 14, 30);
    }

    doc.save(`customers-${new Date().toISOString().slice(0, 10)}.pdf`);
    showToast('تم تصدير كشوف الزبائن');
  };

  const exportSuppliersPdf = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Supplier Statements', pageW / 2, 16, { align: 'center' });

    let firstPage = true;
    data.suppliers.forEach((s) => {
      const txs = data.supplierTransactions
        .filter((t) => t.supplierId === s.id)
        .sort((a, b) => a.date - b.date);
      const balance = supplierBalance(s, data.supplierTransactions);

      if (!firstPage) doc.addPage();
      firstPage = false;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${s.companyName} (${s.agentName || '-'})`, 14, 14);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Balance: ${formatCurrency(Math.abs(balance))}`, 14, 20);

      const rows = txs.map((t) => [
        new Date(t.date).toLocaleString('en-US'),
        t.kind === 'goods' ? 'Goods' : 'Payment',
        t.invoice || '-',
        t.description || '-',
        formatCurrency(t.amount),
      ]);

      autoTable(doc, {
        startY: 24,
        head: [['Date', 'Type', 'Invoice', 'Description', 'Amount']],
        body: rows,
        styles: { halign: 'left', fontSize: 9 },
        headStyles: { fillColor: [234, 88, 12] },
      });
    });

    if (data.suppliers.length === 0) {
      doc.text('No suppliers found.', 14, 30);
    }

    doc.save(`suppliers-${new Date().toISOString().slice(0, 10)}.pdf`);
    showToast('تم تصدير كشوف الموردين');
  };

  // Export Excel-like CSV (UTF-8 with BOM for Arabic support)
  const exportCsv = (type: 'customers' | 'suppliers') => {
    const BOM = '\uFEFF';
    let csv = '';
    if (type === 'customers') {
      csv = 'الاسم,الهاتف,عدد العمليات,الرصيد\n';
      data.customers.forEach((c) => {
        const bal = customerBalance(c, data.customerTransactions);
        const count = data.customerTransactions.filter(
          (t) => t.customerId === c.id
        ).length;
        csv += `"${c.name}","${c.phone}",${count},${bal.toFixed(2)}\n`;
      });
    } else {
      csv = 'الشركة,الوكيل,الهاتف,عدد العمليات,الرصيد\n';
      data.suppliers.forEach((s) => {
        const bal = supplierBalance(s, data.supplierTransactions);
        const count = data.supplierTransactions.filter(
          (t) => t.supplierId === s.id
        ).length;
        csv += `"${s.companyName}","${s.agentName}","${s.phone}",${count},${bal.toFixed(
          2
        )}\n`;
      });
    }
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('تم تصدير الملف');
  };

  return (
    <div className="fade-in">
      <PageHeader title="الإعدادات" />

      <div className="px-4 py-4 pb-28">
        {/* Install as APK guide */}
        <InstallGuide />

        {/* Stats overview */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Info size={16} className="text-teal-600" />
            ملخص البيانات
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-teal-50 rounded-xl p-3">
              <div className="text-xs text-teal-700 font-semibold">الزبائن</div>
              <div className="text-2xl font-extrabold text-teal-800 num">
                {data.customers.length}
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl p-3">
              <div className="text-xs text-orange-700 font-semibold">الموردين</div>
              <div className="text-2xl font-extrabold text-orange-800 num">
                {data.suppliers.length}
              </div>
            </div>
            <div className="bg-rose-50 rounded-xl p-3">
              <div className="text-xs text-rose-700 font-semibold">عمليات الزبائن</div>
              <div className="text-2xl font-extrabold text-rose-800 num">
                {data.customerTransactions.length}
              </div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3">
              <div className="text-xs text-amber-700 font-semibold">عمليات الموردين</div>
              <div className="text-2xl font-extrabold text-amber-800 num">
                {data.supplierTransactions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Printer size={16} className="text-slate-600" />
            <h3 className="font-bold text-slate-800">التصدير والطباعة</h3>
          </div>
          <div className="p-2">
            <button
              onClick={exportFullPdf}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-right"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-slate-800">
                  تقرير شامل (PDF)
                </div>
                <div className="text-xs text-slate-500">
                  كشوف جميع الزبائن والموردين
                </div>
              </div>
              <Download size={16} className="text-slate-400" />
            </button>
            <button
              onClick={exportCustomersPdf}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-right"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <UserPlus size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-slate-800">
                  كشوف الزبائن (PDF)
                </div>
                <div className="text-xs text-slate-500">
                  كشف حساب لكل زبون
                </div>
              </div>
              <Download size={16} className="text-slate-400" />
            </button>
            <button
              onClick={exportSuppliersPdf}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-right"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-slate-800">
                  كشوف الموردين (PDF)
                </div>
                <div className="text-xs text-slate-500">
                  كشف حساب لكل مورد
                </div>
              </div>
              <Download size={16} className="text-slate-400" />
            </button>
            <button
              onClick={() => exportCsv('customers')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-right"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-slate-800">
                  تصدير الزبائن (Excel / CSV)
                </div>
                <div className="text-xs text-slate-500">
                  ملف متوافق مع Excel
                </div>
              </div>
              <Download size={16} className="text-slate-400" />
            </button>
            <button
              onClick={() => exportCsv('suppliers')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-right"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileSpreadsheet size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-slate-800">
                  تصدير الموردين (Excel / CSV)
                </div>
                <div className="text-xs text-slate-500">
                  ملف متوافق مع Excel
                </div>
              </div>
              <Download size={16} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Backup */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Database size={16} className="text-slate-600" />
            <h3 className="font-bold text-slate-800">النسخ الاحتياطي</h3>
          </div>
          <div className="p-2">
            <button
              onClick={() => {
                exportBackup();
                showToast('تم تنزيل النسخة الاحتياطية');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-right"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Download size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-slate-800">
                  تصدير نسخة احتياطية
                </div>
                <div className="text-xs text-slate-500">
                  حفظ البيانات كملف JSON
                </div>
              </div>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-right"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Upload size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-slate-800">
                  استعادة نسخة احتياطية
                </div>
                <div className="text-xs text-slate-500">
                  استيراد بيانات من ملف
                </div>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Trash2 size={16} className="text-rose-500" />
            <h3 className="font-bold text-slate-800">منطقة الخطر</h3>
          </div>
          <div className="p-2">
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 rounded-xl text-right text-rose-600"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">
                  حذف جميع البيانات
                </div>
                <div className="text-xs text-rose-500/80">
                  سيؤدي هذا إلى مسح كل الزبائن والموردين والعمليات
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>دفتر الحسابات - الإصدار 1.0</p>
          <p className="mt-1">يعمل بدون إنترنت - بياناتك محفوظة على جهازك</p>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="حذف جميع البيانات؟"
        message="سيتم حذف جميع الزبائن والموردين والعمليات نهائياً. يُنصح بأخذ نسخة احتياطية أولاً."
        confirmLabel="حذف الكل"
        danger
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
};


