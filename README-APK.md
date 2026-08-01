# 📱 كيفية توليد ملف APK للتطبيق

## ✅ ما تم تجهيزه لك مسبقاً
- ✅ Capacitor مثبّت ومضبوط (`capacitor.config.ts`)
- ✅ اسم التطبيق: **دفتر الحسابات**
- ✅ Package ID: `com.grocery.ledger`
- ✅ الأيقونة جاهزة في `public/icon-512.png`
- ✅ Splash Screen بلون التطبيق `#0f766e`
- ✅ PWA يعمل بدون إنترنت

---

## 🚀 الطريقة الأسرع: PWABuilder (بدون تنصيب أي شيء)

1. حمّل مجلد `dist/` (بعد تنفيذ `npm run build`) وارفعه على أي استضافة مجانية:
   - [Vercel](https://vercel.com/new) — الأسهل، اسحب المجلد فقط
   - [Netlify Drop](https://app.netlify.com/drop) — اسحب المجلد
   - [GitHub Pages](https://pages.github.com)

2. ادخل على [pwabuilder.com](https://www.pwabuilder.com) وضع رابط موقعك.

3. اضغط **Package For Stores → Android → Generate**.

4. حمّل الملف — ستحصل على **`app-release-signed.apk`** جاهز للتثبيت. ✅

---

## 🛠️ الطريقة المحلية: باستخدام Capacitor + Android Studio

### المتطلبات (تنصيب لمرة واحدة):
- [Node.js 18+](https://nodejs.org)
- [Android Studio](https://developer.android.com/studio) (يتضمن Android SDK + JDK)

### الأوامر (3 خطوات فقط):

```bash
# 1) بناء نسخة الإنتاج
npm run build

# 2) إضافة منصة أندرويد (لمرة واحدة فقط)
npx cap add android

# 3) نسخ ملفات الويب وفتح المشروع
npx cap sync android
npx cap open android
```

سيفتح **Android Studio** تلقائياً. من القائمة العلوية:

**Build → Build Bundle(s) / APK(s) → Build APK(s)**

ستجد ملف APK في:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ⚡ توليد APK من سطر الأوامر (بدون فتح Android Studio)

بعد تنفيذ `npx cap add android` مرة واحدة:

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug        # لينكس / ماك
# أو
gradlew.bat assembleDebug      # ويندوز
```

ملف APK سيكون في نفس المسار أعلاه.

---

## 🔐 توليد APK موقّع للنشر على متجر Play

```bash
cd android
./gradlew assembleRelease
```

قبل ذلك، أنشئ keystore:
```bash
keytool -genkey -v -keystore my-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
```

ثم أضف بيانات التوقيع في `android/app/build.gradle` تحت `signingConfigs`.

---

## 📥 تثبيت APK على هاتفك

1. انقل ملف `.apk` إلى الهاتف عبر USB أو Google Drive أو WhatsApp.
2. من إعدادات الأندرويد: **الأمان → السماح بتنصيب مصادر مجهولة** (فعّلها لتطبيق الملفات).
3. افتح الملف واضغط **تثبيت**.

---

## 🔄 كل مرة تحدّث فيها الكود

```bash
npm run build
npx cap sync android
# ثم أعد البناء من Android Studio أو gradlew assembleDebug
```

---

## 💡 نصيحة

الطريقة **الأسهل والأسرع** هي [PWABuilder](https://www.pwabuilder.com) — لا تحتاج تنصيب أي شيء على جهازك، فقط ارفع الموقع واحصل على APK جاهز خلال دقيقتين. 🎉
