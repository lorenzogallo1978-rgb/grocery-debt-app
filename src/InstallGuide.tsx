import React, { useEffect, useState } from 'react';
import { Smartphone, Download, ExternalLink, Package, Zap, Copy, Check } from 'lucide-react';

// Type for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallGuide: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [openMethod, setOpenMethod] = useState<number | null>(1);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));

    // Detect if already running as standalone app
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-ignore
      window.navigator.standalone === true
    ) {
      setInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const doInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Smartphone size={16} className="text-teal-600" />
        <h3 className="font-bold text-slate-800">
          تحميل التطبيق كـ APK على أندرويد
        </h3>
      </div>

      <div className="p-4">
        {/* Install as PWA button */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-2xl p-4 mb-4 relative overflow-hidden">
          <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Zap size={22} />
              </div>
              <div className="flex-1">
                <div className="font-bold mb-1">
                  الطريقة الأسرع: تثبيت مباشر
                </div>
                <p className="text-xs text-white/90 leading-relaxed">
                  يمكنك تثبيت التطبيق مباشرة على شاشة هاتفك الأندرويد دون
                  الحاجة لملف APK. يعمل بنفس طريقة التطبيقات العادية وبدون
                  إنترنت.
                </p>
              </div>
            </div>
            {installed ? (
              <div className="mt-3 bg-white/20 rounded-xl py-2.5 text-center font-bold text-sm flex items-center justify-center gap-2">
                <Check size={18} />
                التطبيق مُثبَّت على جهازك
              </div>
            ) : deferredPrompt ? (
              <button
                onClick={doInstall}
                className="mt-3 w-full bg-white text-teal-700 rounded-xl py-2.5 font-bold text-sm hover:bg-white/95 flex items-center justify-center gap-2"
              >
                <Download size={18} />
                تثبيت التطبيق الآن
              </button>
            ) : (
              <div className="mt-3 bg-white/15 rounded-xl p-3 text-xs text-white/95 leading-relaxed">
                افتح الموقع من متصفح <b>Chrome</b> على الأندرويد، ثم اضغط
                على قائمة النقاط الثلاث ⋮ واختر «<b>تثبيت التطبيق</b>» أو
                «<b>إضافة إلى الشاشة الرئيسية</b>».
              </div>
            )}
          </div>
        </div>

        {/* Method 1: PWABuilder */}
        <Accordion
          open={openMethod === 1}
          onToggle={() => setOpenMethod(openMethod === 1 ? null : 1)}
          icon={<Package size={18} />}
          title="الطريقة 1: توليد APK عبر PWABuilder (الأسهل)"
          badge="مُوصى به"
          color="teal"
        >
          <ol className="text-sm text-slate-700 space-y-2.5 leading-relaxed list-decimal pr-5">
            <li>
              انشر التطبيق على أي استضافة مجانية مع HTTPS مثل{' '}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noreferrer"
                className="text-teal-600 font-bold underline"
              >
                Vercel
              </a>{' '}
              أو{' '}
              <a
                href="https://pages.github.com"
                target="_blank"
                rel="noreferrer"
                className="text-teal-600 font-bold underline"
              >
                GitHub Pages
              </a>{' '}
              أو{' '}
              <a
                href="https://www.netlify.com"
                target="_blank"
                rel="noreferrer"
                className="text-teal-600 font-bold underline"
              >
                Netlify
              </a>
              .
            </li>
            <li>
              ادخل على موقع{' '}
              <a
                href="https://www.pwabuilder.com"
                target="_blank"
                rel="noreferrer"
                className="text-teal-600 font-bold underline inline-flex items-center gap-1"
              >
                pwabuilder.com
                <ExternalLink size={12} />
              </a>{' '}
              وضع رابط تطبيقك.
            </li>
            <li>
              اضغط <b>Package For Stores</b> ثم اختر <b>Android</b>.
            </li>
            <li>
              حمّل الحزمة، ستحصل على ملف <b>app-release-signed.apk</b> جاهز
              للتثبيت على أي هاتف أندرويد.
            </li>
            <li>
              انقل الملف إلى هاتفك وثبّته (فعّل «تثبيت مصادر غير معروفة» من
              إعدادات الأندرويد).
            </li>
          </ol>
          <div className="mt-3 bg-teal-50 rounded-xl p-3 text-xs text-teal-800">
            💡 هذه الطريقة تنشئ APK فعلي يمكنك رفعه على متجر Google Play أيضاً.
          </div>
        </Accordion>

        {/* Method 2: Capacitor */}
        <Accordion
          open={openMethod === 2}
          onToggle={() => setOpenMethod(openMethod === 2 ? null : 2)}
          icon={<Package size={18} />}
          title="الطريقة 2: توليد APK محلياً باستخدام Capacitor"
          badge="متقدم"
          color="indigo"
        >
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">
            تحتاج إلى تثبيت <b>Node.js</b> و <b>Android Studio</b> على
            الكمبيوتر، ثم نفّذ الأوامر التالية:
          </p>
          <CodeBlock
            id="cap1"
            code={`# 1) داخل مجلد المشروع
npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init "دفتر الحسابات" com.grocery.ledger --web-dir=dist

# 2) ابنِ التطبيق ثم أضف منصة أندرويد
npm run build
npx cap add android
npx cap copy android

# 3) افتح المشروع في Android Studio
npx cap open android`}
            onCopy={copy}
            copied={copied === 'cap1'}
          />
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            من Android Studio: اختر <b>Build → Build Bundle(s) / APK(s) →
            Build APK(s)</b>. ستجد الملف في:
          </p>
          <CodeBlock
            id="cap2"
            code={`android/app/build/outputs/apk/debug/app-debug.apk`}
            onCopy={copy}
            copied={copied === 'cap2'}
          />
        </Accordion>

        {/* Method 3: Bubblewrap */}
        <Accordion
          open={openMethod === 3}
          onToggle={() => setOpenMethod(openMethod === 3 ? null : 3)}
          icon={<Package size={18} />}
          title="الطريقة 3: توليد APK عبر Bubblewrap CLI"
          badge="مطورين"
          color="orange"
        >
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">
            أداة رسمية من Google لتغليف PWA كتطبيق أندرويد (TWA):
          </p>
          <CodeBlock
            id="bw"
            code={`npm i -g @bubblewrap/cli

# ينشئ مشروع من ملف manifest
bubblewrap init --manifest="https://your-site.com/manifest.webmanifest"

# يبني ملف APK جاهز للتثبيت
bubblewrap build`}
            onCopy={copy}
            copied={copied === 'bw'}
          />
          <div className="mt-3 bg-orange-50 rounded-xl p-3 text-xs text-orange-800">
            تحتاج Java 8+ و Android SDK. سينشئ ملف <b>app-release-signed.apk</b>.
          </div>
        </Accordion>

        <div className="mt-4 bg-slate-50 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
          <div className="font-bold text-slate-800 mb-1">📱 ملاحظات مهمة:</div>
          <ul className="space-y-1 list-disc pr-4">
            <li>التطبيق يعمل بدون إنترنت بعد التثبيت.</li>
            <li>جميع البيانات محفوظة على جهازك فقط (لا يوجد سيرفر).</li>
            <li>يُنصح بأخذ نسخة احتياطية دورية من قسم «النسخ الاحتياطي».</li>
            <li>الأيقونة والاسم يمكن تخصيصهما من ملف <code>manifest.webmanifest</code>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// --- Helpers ---
const Accordion: React.FC<{
  open: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  title: string;
  badge?: string;
  color?: 'teal' | 'orange' | 'indigo';
  children: React.ReactNode;
}> = ({ open, onToggle, icon, title, badge, color = 'teal', children }) => {
  const colorClasses: Record<string, string> = {
    teal: 'bg-teal-100 text-teal-700',
    orange: 'bg-orange-100 text-orange-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  };
  return (
    <div className="border border-slate-200 rounded-xl mb-2 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-3 text-right hover:bg-slate-50"
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-slate-800 truncate">{title}</div>
        </div>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClasses[color]}`}>
            {badge}
          </span>
        )}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

const CodeBlock: React.FC<{
  code: string;
  id: string;
  onCopy: (text: string, id: string) => void;
  copied: boolean;
}> = ({ code, id, onCopy, copied }) => (
  <div className="relative bg-slate-900 rounded-xl p-3 pl-10 mt-2" dir="ltr">
    <pre className="text-xs text-slate-100 overflow-x-auto whitespace-pre font-mono leading-relaxed">
      {code}
    </pre>
    <button
      onClick={() => onCopy(code, id)}
      className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
      title="نسخ"
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
    </button>
  </div>
);
