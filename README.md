# منظومة إدارة الالتزام
## هيئة الهلال الأحمر السعودي — منطقة الرياض

منصة ويب مستقلة تعمل مباشرةً من **GitHub Pages** وتحفظ البيانات في **Google Sheets**.

---

## ⚡ النشر على GitHub Pages (خطوة بخطوة)

### الخطوة 1: رفع الكود على GitHub

```bash
# 1. افتح github.com/new وأنشئ مستودعاً جديداً باسم srca-compliance
# 2. شغّل هذه الأوامر في Terminal داخل مجلد srca-static

git init
git add .
git commit -m "منظومة إدارة الالتزام - الإصدار الأول"
git branch -M main
git remote add origin https://github.com/اسم-مستخدمك/srca-compliance.git
git push -u origin main
```

### الخطوة 2: تفعيل GitHub Pages

1. افتح المستودع على GitHub
2. اذهب إلى **Settings → Pages**
3. في **Source** اختر **GitHub Actions**
4. احفظ الإعدادات

بعد دقيقتين ستجد رابط المنصة:
```
https://اسم-مستخدمك.github.io/srca-compliance/
```

---

## 🔗 ربط Google Sheets

### الخطوة 1: إعداد Google Sheets

1. افتح [Google Sheets](https://sheets.google.com) وأنشئ جدولاً جديداً
2. من القائمة: **Extensions → Apps Script**
3. احذف الكود الموجود والصق محتوى ملف `../srca-scripts/setup_sheets_v2.gs`
4. اضغط **▶ Run** واختر دالة **setupAllSheets**
5. وافق على الصلاحيات المطلوبة

### الخطوة 2: نشر الـ Webhook

1. اضغط **Deploy → New deployment**
2. اختر نوع **Web App**
3. اضبط:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. اضغط **Deploy**
5. **انسخ رابط الـ Web App**

### الخطوة 3: إضافة الرابط في الكود

افتح ملف `src/lib/config.ts` وضع الرابط:

```typescript
export const SHEETS_WEBHOOK_URL =
  "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
```

ثم ارفع التعديل:
```bash
git add .
git commit -m "إضافة رابط Google Sheets"
git push
```

---

## 📁 هيكل المشروع

```
srca-static/
├── src/
│   ├── lib/
│   │   ├── config.ts          ← إعدادات المنصة (رابط Sheets، القطاعات، المفتشون)
│   │   └── sheets.ts          ← API للتواصل مع Google Sheets
│   ├── pages/
│   │   ├── Dashboard.tsx      ← لوحة القائد
│   │   ├── VisitsList.tsx     ← سجل الزيارات
│   │   ├── Correspondences.tsx ← نظام المخاطبات
│   │   └── forms/
│   │       ├── ComprehensiveVisitForm.tsx  ← الزيارة الشاملة (مركز+تموين+سيارات)
│   │       ├── EmergencyDeptForm.tsx       ← أقسام الطوارئ
│   │       ├── BadgeProtectionForm.tsx     ← حماية الشارة
│   │       ├── UniformForm.tsx             ← الزي الرسمي
│   │       └── SpotCheckForm.tsx           ← الوقوف على مركز
│   └── components/
│       ├── Layout.tsx          ← الشريط الجانبي والتخطيط
│       └── FormComponents.tsx  ← مكونات النماذج المشتركة
├── .github/workflows/
│   └── deploy.yml             ← GitHub Actions للنشر التلقائي
└── srca-scripts/
    └── setup_sheets_v2.gs     ← سكريبت Google Apps Script
```

---

## 🛠️ التطوير المحلي

```bash
pnpm install
pnpm run dev
```

افتح المتصفح على: http://localhost:5173

---

## 📊 جداول Google Sheets المُنشأة تلقائياً

| الجدول | المحتوى |
|--------|---------|
| الزيارات_الشاملة | بيانات زيارات المراكز (مركز + تموين + سيارات) |
| أقسام_الطوارئ | زيارات أقسام الطوارئ |
| حماية_الشارة | مخالفات استخدام الشارة |
| الزي_الرسمي | تشييك الزي والبطاقة |
| وقوف_على_مركز | الجاهزية الفورية |
| المخاطبات | المراسلات الرسمية وحالة المعالجة |
| الإحصائيات | ملخص دوري |
