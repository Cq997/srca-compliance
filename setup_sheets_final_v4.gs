/**
 * ============================================================
 * منظومة إدارة الالتزام — هيئة الهلال الأحمر السعودي
 * سكريبت Google Apps Script — النسخة الموحّدة النهائية
 * ============================================================
 * الخطوات:
 * 1. افتح Google Sheets جديد
 * 2. Extensions → Apps Script
 * 3. احذف الكود الموجود والصق هذا الكود كاملاً
 * 4. احفظ (Ctrl+S)
 * 5. شغّل دالة setupAllSheets() أولاً لإنشاء الجداول
 * 6. Deploy → New deployment → Web App
 *    Execute as: Me | Who has access: Anyone
 * 7. انسخ رابط الـ Web App وضعه في إعدادات المنصة
 * ============================================================
 */

// ─── الألوان الرسمية لهيئة الهلال الأحمر ─────────────────────
const RED        = "#C0392B";
const DARK_RED   = "#922B21";
const GOLD       = "#D4AC0D";
const DARK_GRAY  = "#2C3E50";
const LIGHT_GRAY = "#F2F3F4";
const WHITE      = "#FFFFFF";
const GREEN      = "#1E8449";
const ORANGE     = "#D35400";
const BLUE       = "#1A5276";
const PURPLE     = "#6C3483";

// ─── الدالة الرئيسية: إنشاء جميع الجداول ────────────────────
function setupAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetLocale("ar");

  createDashboardSheet(ss);
  createComprehensiveVisitSheet(ss);
  createEmergencyDeptSheet(ss);
  createBadgeProtectionSheet(ss);
  createUniformSheet(ss);
  createSpotCheckSheet(ss);
  createCorrespondencesSheet(ss);
  createComplaintsSheet(ss);
  createLookupsSheet(ss);

  // حذف الورقة الافتراضية إن وُجدت
  ["Sheet1", "ورقة1"].forEach(name => {
    const s = ss.getSheetByName(name);
    if (s && ss.getSheets().length > 1) ss.deleteSheet(s);
  });

  SpreadsheetApp.getUi().alert(
    "✅ تم إعداد جميع الجداول بنجاح!\n\n" +
    "الخطوة التالية:\n" +
    "1. اضغط Deploy → New deployment\n" +
    "2. اختر Web App\n" +
    "3. Execute as: Me\n" +
    "4. Who has access: Anyone\n" +
    "5. انسخ رابط الـ Web App وأضفه في إعدادات المنصة"
  );
}

// ═══════════════════════════════════════════════════════════════
// إنشاء الجداول
// ═══════════════════════════════════════════════════════════════

// ─── لوحة الإحصائيات الرئيسية ────────────────────────────────
function createDashboardSheet(ss) {
  let sheet = ss.getSheetByName("لوحة_الإحصائيات");
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet("لوحة_الإحصائيات", 0);
  sheet.setRightToLeft(true);
  sheet.setTabColor(RED);

  // العنوان الرئيسي
  sheet.setRowHeight(1, 65);
  sheet.getRange("A1:L1").merge()
    .setValue("منظومة إدارة الالتزام — هيئة الهلال الأحمر السعودي — منطقة الرياض")
    .setBackground(DARK_RED).setFontColor(WHITE)
    .setFontSize(16).setFontWeight("bold")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  sheet.setRowHeight(2, 38);
  sheet.getRange("A2:L2").merge()
    .setValue("لوحة الإحصائيات والمتابعة")
    .setBackground(RED).setFontColor(GOLD)
    .setFontSize(13).setFontWeight("bold")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  // بطاقات الإحصاء
  sheet.setRowHeight(4, 42);
  const statCols = [
    ["A4:B4", "إجمالي الزيارات",      "=COUNTA(الزيارة_الشاملة!A:A)-2"],
    ["C4:D4", "زيارات هذا الشهر",     "=COUNTIFS(الزيارة_الشاملة!D:D,\">=\"&DATE(YEAR(TODAY()),MONTH(TODAY()),1))"],
    ["E4:F4", "متوسط الدرجات",        "=IFERROR(ROUND(AVERAGE(الزيارة_الشاملة!AE:AE),1),0)"],
    ["G4:H4", "مخاطبات مفتوحة",       "=COUNTIF(المخاطبات!G:G,\"مفتوحة\")"],
    ["I4:J4", "قيد المعالجة",         "=COUNTIF(المخاطبات!G:G,\"قيد المعالجة\")"],
    ["K4:L4", "مخاطبات مغلقة",        "=COUNTIF(المخاطبات!G:G,\"مغلقة\")"]
  ];

  statCols.forEach(([range, label]) => {
    sheet.getRange(range).merge()
      .setValue(label)
      .setBackground(DARK_GRAY).setFontColor(WHITE)
      .setFontWeight("bold").setHorizontalAlignment("center")
      .setVerticalAlignment("middle");
  });

  sheet.setRowHeight(5, 55);
  statCols.forEach(([range, , formula]) => {
    const valRange = range.replace("4", "5");
    sheet.getRange(valRange).merge()
      .setFormula(formula)
      .setFontSize(22).setFontWeight("bold")
      .setHorizontalAlignment("center").setVerticalAlignment("middle")
      .setFontColor(RED);
  });

  // جدول آخر الزيارات
  sheet.setRowHeight(7, 38);
  sheet.getRange("A7:L7").merge()
    .setValue("آخر الزيارات المسجلة")
    .setBackground(RED).setFontColor(WHITE)
    .setFontSize(12).setFontWeight("bold")
    .setHorizontalAlignment("center");

  const visitHeaders = ["#","القطاع","المركز","التاريخ","المفتش","درجة المركز","درجة التموين","درجة السيارات","الدرجة الإجمالية","الحالة","ملاحظات","تاريخ الإدخال"];
  sheet.getRange(8, 1, 1, visitHeaders.length).setValues([visitHeaders])
    .setBackground(DARK_GRAY).setFontColor(WHITE)
    .setFontWeight("bold").setHorizontalAlignment("center");

  sheet.setFrozenRows(8);
  sheet.setColumnWidths(1, 12, 120);
  sheet.setColumnWidth(1, 45);
  sheet.setColumnWidth(11, 200);
  applyBorders(sheet, "A8:L8");
}

// ─── ورقة الزيارة الشاملة ────────────────────────────────────
function createComprehensiveVisitSheet(ss) {
  let sheet = ss.getSheetByName("الزيارة_الشاملة");
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet("الزيارة_الشاملة");
  sheet.setRightToLeft(true);
  sheet.setTabColor(RED);

  setSheetTitle(sheet, "نموذج الزيارة الشاملة للمركز الإسعافي (مركز + تموين طبي + سيارات إسعاف)");

  const headers = [
    // بيانات أساسية (1-7)
    "رقم الزيارة", "القطاع", "المركز", "تاريخ الزيارة",
    "وقت البداية", "وقت النهاية", "المفتش",
    // بيانات المركز (8-14)
    "نوع المركز", "نظام الملكية", "نظام المناوبة", "قوة المركز",
    "عدد الوحدات العاملة", "عدد سيارات الإسعاف العاملة", "عدد سيارات الاحتياط",
    // درجات المركز (15-21)
    "درجة الخدمات العامة", "درجة الفناء الخارجي", "درجة المبنى",
    "درجة استراحة الموظفين", "درجة المرافق", "درجة الأمن والسلامة",
    "إجمالي درجة المركز",
    // درجات التموين (22-25)
    "درجة المستودع", "درجة الأجهزة الطبية", "درجة المستهلكات",
    "إجمالي درجة التموين",
    // درجات السيارات (26-30)
    "درجة الموقف الخارجي", "درجة النظافة", "درجة الجاهزية الطبية",
    "درجة الجاهزية الميكانيكية", "إجمالي درجة السيارات",
    // الإجمالي والملاحظات (31-36)
    "الدرجة الإجمالية الموحدة", "ملاحظات",
    "تاريخ الإدخال في النظام",
    "بيانات المركز (JSON)", "بيانات التموين (JSON)", "بيانات السيارات (JSON)"
  ];

  sheet.getRange(2, 1, 1, headers.length).setValues([headers])
    .setFontColor(WHITE).setFontWeight("bold")
    .setHorizontalAlignment("center").setWrap(true);
  sheet.setRowHeight(2, 50);
  sheet.setFrozenRows(2);

  // تلوين مجموعات الأعمدة
  sheet.getRange(2, 1,  1, 7).setBackground(BLUE);        // بيانات أساسية
  sheet.getRange(2, 8,  1, 7).setBackground("#117A65");   // بيانات المركز
  sheet.getRange(2, 15, 1, 7).setBackground(GREEN);       // درجات المركز
  sheet.getRange(2, 22, 1, 4).setBackground(PURPLE);      // درجات التموين
  sheet.getRange(2, 26, 1, 5).setBackground("#935116");   // درجات السيارات
  sheet.getRange(2, 31, 1, 6).setBackground(DARK_RED);    // الإجمالي

  for (let i = 1; i <= headers.length; i++) sheet.setColumnWidth(i, 135);
  sheet.setColumnWidth(1,  80);
  sheet.setColumnWidth(32, 250);
  sheet.setColumnWidth(34, 300);
  sheet.setColumnWidth(35, 300);
  sheet.setColumnWidth(36, 300);

  applyBorders(sheet, `A2:${columnLetter(headers.length)}2`);
}

// ─── ورقة أقسام الطوارئ ──────────────────────────────────────
function createEmergencyDeptSheet(ss) {
  let sheet = ss.getSheetByName("أقسام_الطوارئ");
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet("أقسام_الطوارئ");
  sheet.setRightToLeft(true);
  sheet.setTabColor(PURPLE);

  setSheetTitle(sheet, "نموذج زيارة أقسام الطوارئ — التحقق من إغلاق وتأمين سيارات الإسعاف");

  const headers = [
    "رقم الزيارة", "القطاع", "المركز", "اسم المستشفى", "اسم قسم الطوارئ",
    "تاريخ الزيارة", "المفتش", "عدد السيارات المفحوصة",
    "عدد السيارات المؤمنة", "عدد السيارات غير المؤمنة",
    "الدرجة الإجمالية", "ملاحظات",
    "تاريخ الإدخال", "بيانات التفصيل (JSON)"
  ];
  setHeaderRow(sheet, 2, headers, PURPLE);
}

// ─── ورقة حماية الشارة ───────────────────────────────────────
function createBadgeProtectionSheet(ss) {
  let sheet = ss.getSheetByName("حماية_الشارة");
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet("حماية_الشارة");
  sheet.setRightToLeft(true);
  sheet.setTabColor(RED);

  setSheetTitle(sheet, "نموذج حماية شارة هيئة الهلال الأحمر السعودي");

  const headers = [
    "رقم الزيارة", "القطاع", "اسم المنشأة", "نوع المنشأة", "عنوان المنشأة",
    "تاريخ الزيارة", "المفتش", "هل يوجد استخدام غير مشروع للشارة؟",
    "تفاصيل المخالفة", "الإجراء المتخذ", "الدرجة الإجمالية",
    "ملاحظات", "تاريخ الإدخال", "بيانات التفصيل (JSON)"
  ];
  setHeaderRow(sheet, 2, headers, DARK_RED);
}

// ─── ورقة الزي الرسمي ────────────────────────────────────────
function createUniformSheet(ss) {
  let sheet = ss.getSheetByName("الزي_الرسمي");
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet("الزي_الرسمي");
  sheet.setRightToLeft(true);
  sheet.setTabColor("#2471A3");

  setSheetTitle(sheet, "نموذج الالتزام بالزي الرسمي وبطاقة العمل");

  const headers = [
    "رقم الزيارة", "القطاع", "الموقع", "نوع الموقع",
    "تاريخ الزيارة", "المفتش",
    "عدد الموظفين المفحوصين", "عدد الملتزمين", "عدد غير الملتزمين",
    "الدرجة الإجمالية", "ملاحظات",
    "تاريخ الإدخال", "بيانات التفصيل (JSON)"
  ];
  setHeaderRow(sheet, 2, headers, BLUE);
}

// ─── ورقة الوقوف على مركز ────────────────────────────────────
function createSpotCheckSheet(ss) {
  let sheet = ss.getSheetByName("وقوف_على_مركز");
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet("وقوف_على_مركز");
  sheet.setRightToLeft(true);
  sheet.setTabColor(GREEN);

  setSheetTitle(sheet, "نموذج الوقوف على مركز إسعافي — التحقق الشامل من الجاهزية");

  const headers = [
    "رقم الزيارة", "القطاع", "المركز", "تاريخ الزيارة", "المفتش",
    "حالة الجاهزية الإجمالية", "الدرجة الإجمالية",
    "المشكلات الحرجة", "التوصيات", "ملاحظات",
    "تاريخ الإدخال", "بيانات التفصيل (JSON)"
  ];
  setHeaderRow(sheet, 2, headers, GREEN);
}

// ─── ورقة المخاطبات ──────────────────────────────────────────
function createCorrespondencesSheet(ss) {
  let sheet = ss.getSheetByName("المخاطبات");
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet("المخاطبات");
  sheet.setRightToLeft(true);
  sheet.setTabColor(ORANGE);

  setSheetTitle(sheet, "سجل المخاطبات الإدارية — متابعة الملاحظات والمخالفات");

  const headers = [
    "رقم المخاطبة", "الرقم المرجعي", "القطاع", "المركز",
    "الجهة المُخاطَبة", "الموضوع", "الحالة", "الأولوية",
    "تاريخ الإنشاء", "تاريخ الاستحقاق",
    "منشئ المخاطبة", "نص المخاطبة",
    "تاريخ آخر متابعة", "ملاحظات المتابعة"
  ];
  setHeaderRow(sheet, 2, headers, "#784212");

  // قائمة منسدلة للحالة
  sheet.getRange("G3:G10000").setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["مفتوحة", "قيد المعالجة", "معالجة", "مغلقة"], true)
      .build()
  );

  // قائمة منسدلة للأولوية
  sheet.getRange("H3:H10000").setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["عاجل", "عالي", "عادي", "منخفض"], true)
      .build()
  );
}

// ─── ورقة الشكاوى والمخالفات ────────────────────────────────
function createComplaintsSheet(ss) {
  let sheet = ss.getSheetByName("الشكاوى_والمخالفات");
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet("الشكاوى_والمخالفات");
  sheet.setRightToLeft(true);
  sheet.setTabColor(RED);

  setSheetTitle(sheet, "سجل الشكاوى والمخالفات — منظومة إدارة الالتزام");

  const headers = [
    "الرقم", "النوع", "المصدر", "رقم المعاملة",
    "الموضوع", "القطاع", "المركز",
    "القائم بالفحص", "اسم المعني/المخالف",
    "تاريخ الرصد", "النتيجة",
    "رقم مداد", "تاريخ النتيجة النهائية",
    "الوصف", "ملاحظات", "تاريخ الإدخال"
  ];
  setHeaderRow(sheet, 2, headers, RED);

  // قوائم منسدلة
  sheet.getRange("B3:B10000").setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["شكوى", "مخالفة"], true)
      .build()
  );
  sheet.getRange("K3:K10000").setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["اشتباه وجود مخالفة", "عدم وجود مخالفة", "عدم ثبوت المخالفة", "تحت الإجراء"], true)
      .build()
  );
}

// ─── ورقة البيانات المرجعية ───────────────────────────────────
function createLookupsSheet(ss) {
  let sheet = ss.getSheetByName("البيانات_المرجعية");
  if (sheet) ss.deleteSheet(sheet);
  sheet = ss.insertSheet("البيانات_المرجعية");
  sheet.setRightToLeft(true);
  sheet.setTabColor(DARK_GRAY);

  setSheetTitle(sheet, "البيانات المرجعية — القطاعات والمراكز والمفتشون");

  // القطاعات الداخلية (5 قطاعات)
  sheet.getRange("A2").setValue("القطاعات الداخلية")
    .setBackground(DARK_GRAY).setFontColor(WHITE).setFontWeight("bold");
  const internalSectors = [
    ["قطاع شمال الرياض"],
    ["قطاع جنوب الرياض"],
    ["قطاع شرق الرياض"],
    ["قطاع غرب الرياض"],
    ["قطاع وسط الرياض"]
  ];
  sheet.getRange(3, 1, internalSectors.length, 1).setValues(internalSectors);

  // القطاعات الخارجية (14 قطاعاً)
  sheet.getRange("C2").setValue("القطاعات الخارجية")
    .setBackground(DARK_GRAY).setFontColor(WHITE).setFontWeight("bold");
  const externalSectors = [
    ["قطاع الخرج"],
    ["قطاع المزاحمية"],
    ["قطاع الدوادمي"],
    ["قطاع الأفلاج"],
    ["قطاع وادي الدواسر"],
    ["قطاع السليل"],
    ["قطاع الدرعية"],
    ["قطاع الزلفي"],
    ["قطاع المجمعة"],
    ["قطاع القويعية"],
    ["قطاع شمال غرب الرياض"],
    ["قطاع جنوب غرب الرياض"],
    ["قطاع شمال شرق الرياض"],
    ["قطاع جنوب شرق الرياض"]
  ];
  sheet.getRange(3, 3, externalSectors.length, 1).setValues(externalSectors);

  // المراكز الداخلية
  sheet.getRange("E2").setValue("مراكز شمال الرياض")
    .setBackground(RED).setFontColor(WHITE).setFontWeight("bold");
  const northCenters = [
    ["الصحافة"], ["جامعة نورة"], ["الأمانة"], ["الرمال"],
    ["الملقا"], ["النفل"], ["المونسية"], ["النرجس"], ["البيان"]
  ];
  sheet.getRange(3, 5, northCenters.length, 1).setValues(northCenters);

  sheet.getRange("G2").setValue("مراكز جنوب الرياض")
    .setBackground(RED).setFontColor(WHITE).setFontWeight("bold");
  const southCenters = [
    ["طريق الخرج"], ["الشفا"], ["الحائر"], ["ديراب"],
    ["الخالدية"], ["الدار البيضاء"], ["منفوحة"], ["عكاظ"],
    ["المنصورة"], ["الإسكان"]
  ];
  sheet.getRange(3, 7, southCenters.length, 1).setValues(southCenters);

  sheet.getRange("I2").setValue("مراكز شرق الرياض")
    .setBackground(RED).setFontColor(WHITE).setFontWeight("bold");
  const eastCenters = [
    ["الجنادرية"], ["النسيم"], ["الحمراء"], ["الروضة"], ["السلي"],
    ["السلام"], ["إشبيلية"], ["النسيم الغربي"], ["السعادة"],
    ["الندوة"], ["النهضة"], ["الخليج"], ["النظيم"], ["حي الملك فيصل"]
  ];
  sheet.getRange(3, 9, eastCenters.length, 1).setValues(eastCenters);

  sheet.getRange("K2").setValue("مراكز غرب الرياض")
    .setBackground(RED).setFontColor(WHITE).setFontWeight("bold");
  const westCenters = [
    ["طويق"], ["السويدي"], ["عليشة"], ["العريجاء"], ["سلطانة"],
    ["لبن"], ["القدية المطور"], ["نمار"], ["طويق 2"], ["لبن الغربي"], ["عرقة"]
  ];
  sheet.getRange(3, 11, westCenters.length, 1).setValues(westCenters);

  sheet.getRange("M2").setValue("مراكز وسط الرياض")
    .setBackground(RED).setFontColor(WHITE).setFontWeight("bold");
  const centralCenters = [
    ["الضباب"], ["المصيف"], ["الربوة"], ["العروبة"], ["الملز"],
    ["حي الملك فهد"], ["النخيل"], ["حي الملك عبدالله"],
    ["السليمانية"], ["الشورى"]
  ];
  sheet.getRange(3, 13, centralCenters.length, 1).setValues(centralCenters);

  sheet.setColumnWidths(1, 14, 160);
}

// ═══════════════════════════════════════════════════════════════
// استقبال البيانات من المنصة (Webhook)
// ═══════════════════════════════════════════════════════════════

// ─── استقبال طلبات POST (حفظ البيانات) ──────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const timestamp = new Date().toLocaleString("ar-SA");

    switch (data.type || data.action) {
      case "comprehensive_visit":
        appendComprehensiveVisit(ss, data, timestamp);
        break;
      case "emergency_dept":
        appendEmergencyDept(ss, data, timestamp);
        break;
      case "badge_protection":
        appendBadgeProtection(ss, data, timestamp);
        break;
      case "uniform_check":
        appendUniform(ss, data, timestamp);
        break;
      case "spot_check":
        appendSpotCheck(ss, data, timestamp);
        break;
      case "correspondence":
        appendCorrespondence(ss, data, timestamp);
        break;
      case "complaint":
        appendComplaint(ss, data, timestamp);
        break;
      default:
        return jsonResponse({ success: false, error: "نوع غير معروف: " + (data.type || data.action) });
    }

    return jsonResponse({ success: true, timestamp });

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// ─── استقبال طلبات GET (قراءة البيانات) ─────────────────────
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "";
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    switch (action) {
      case "dashboard_stats":
        return jsonResponse(getDashboardStats(ss));
      case "all_visits":
        return jsonResponse(getAllVisits(ss));
      case "get_correspondences":
        return jsonResponse(getCorrespondences(ss));
      case "get_complaints":
        return jsonResponse(getComplaints(ss));
      case "complaints_stats":
        return jsonResponse(getComplaintsStats(ss));
      default:
        return jsonResponse({ success: true, message: "SRCA Compliance Webhook — جاهز ✅" });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// ═══════════════════════════════════════════════════════════════
// دوال إضافة البيانات
// ═══════════════════════════════════════════════════════════════

function appendComprehensiveVisit(ss, data, ts) {
  const sheet = ss.getSheetByName("الزيارة_الشاملة");
  if (!sheet) return;

  const row = [
    data.visitId        || "",
    data.sectorName     || "",
    data.centerName     || "",
    data.visitDate      || "",
    data.visitStartTime || "",
    data.visitEndTime   || "",
    data.inspectorName  || "",
    // بيانات المركز
    data.centerType           || "",
    data.ownershipType        || "",
    data.rotationSystem       || "",
    data.centerStrength       || "",
    data.workingUnitsCount    || 0,
    data.workingAmbulancesCount || 0,
    data.reserveAmbulancesCount || 0,
    // درجات المركز
    data.generalServicesScore    || 0,
    data.externalYardScore       || 0,
    data.buildingFacilitiesScore || 0,
    data.staffRestAreaScore      || 0,
    data.utilitiesScore          || 0,
    data.safetySecurityScore     || 0,
    data.centerTotalScore        || 0,
    // درجات التموين
    data.warehouseScore       || 0,
    data.medicalDevicesScore  || 0,
    data.consumablesScore     || 0,
    data.medicalTotalScore    || 0,
    // درجات السيارات
    data.parkingExternalScore      || 0,
    data.cleanlinessScore          || 0,
    data.medicalReadinessScore     || 0,
    data.mechanicalReadinessScore  || 0,
    data.ambulanceTotalScore       || 0,
    // الإجمالي
    data.overallScore || 0,
    data.notes        || "",
    ts,
    JSON.stringify(data.centerData    || {}),
    JSON.stringify(data.medicalData   || {}),
    JSON.stringify(data.ambulanceData || {})
  ];

  sheet.appendRow(row);
  colorizeScoreRow(sheet, sheet.getLastRow(), 31);
}

function appendEmergencyDept(ss, data, ts) {
  const sheet = ss.getSheetByName("أقسام_الطوارئ");
  if (!sheet) return;
  const checked   = data.ambulancesChecked || [];
  const secured   = checked.filter(a => a.secured).length;
  const unsecured = checked.filter(a => !a.secured).length;
  sheet.appendRow([
    data.visitId || "", data.sectorName || "", data.centerName || "",
    data.hospitalName || "", data.emergencyDeptName || "",
    data.visitDate || "", data.inspectorName || "",
    checked.length, secured, unsecured,
    data.totalScore || 0, data.notes || "",
    ts, JSON.stringify(data.checkItems || {})
  ]);
}

function appendBadgeProtection(ss, data, ts) {
  const sheet = ss.getSheetByName("حماية_الشارة");
  if (!sheet) return;
  sheet.appendRow([
    data.visitId || "", data.sectorName || "", data.facilityName || "",
    data.facilityType || "", data.facilityAddress || "",
    data.visitDate || "", data.inspectorName || "",
    data.hasViolation ? "نعم" : "لا",
    data.violationDetails || "", data.actionTaken || "",
    data.totalScore || 0, data.notes || "",
    ts, JSON.stringify(data.checkItems || {})
  ]);
}

function appendUniform(ss, data, ts) {
  const sheet = ss.getSheetByName("الزي_الرسمي");
  if (!sheet) return;
  const staff     = data.staffChecked || [];
  const compliant = staff.filter(s => s.compliant).length;
  sheet.appendRow([
    data.visitId || "", data.sectorName || "", data.location || "",
    data.locationType || "", data.visitDate || "", data.inspectorName || "",
    staff.length, compliant, staff.length - compliant,
    data.totalScore || 0, data.notes || "",
    ts, JSON.stringify(data.checkItems || {})
  ]);
}

function appendSpotCheck(ss, data, ts) {
  const sheet = ss.getSheetByName("وقوف_على_مركز");
  if (!sheet) return;
  sheet.appendRow([
    data.visitId || "", data.sectorName || "", data.centerName || "",
    data.visitDate || "", data.inspectorName || "",
    data.overallReadiness || "", data.totalScore || 0,
    data.criticalIssues || "", data.recommendations || "",
    data.notes || "", ts,
    JSON.stringify(data.checkItems || {})
  ]);
}

function appendComplaint(ss, data, ts) {
  const sheet = ss.getSheetByName("الشكاوى_والمخالفات");
  if (!sheet) return;
  sheet.appendRow([
    data.id || "",
    data.type || "",
    data.source || "",
    data.refNumber || data.id || "",
    data.subject || "",
    data.sectorName || "",
    data.centerName || "",
    data.inspectorName || data.detectorName || "",   // القائم بالفحص
    data.violatorName || "",                         // اسم المعني/المخالف
    data.detectionDate || "",
    data.result || "",
    data.madaadNumber || "",                         // رقم مداد
    data.resultDate || "",                           // تاريخ النتيجة النهائية
    data.description || "",
    data.resultNotes || data.notes || "",
    ts
  ]);
}

function appendCorrespondence(ss, data, ts) {
  const sheet = ss.getSheetByName("المخاطبات");
  if (!sheet) return;
  const violations = Array.isArray(data.violations)
    ? data.violations.join(" | ")
    : (data.violations || "");
  sheet.appendRow([
    data.corrId || data.id || "", data.referenceNumber || "",
    data.sectorName || "", data.centerName || "",
    data.toEntity || data.toDepartment || "",
    data.subject || "", data.status || "مفتوحة",
    data.priority || "عادي",
    data.createdAt || data.visitDate || "",
    data.dueDate || data.deadline || "",
    data.createdByName || data.inspectorName || "",
    data.body || data.requiredActions || "",
    "", ""
  ]);
}

// ═══════════════════════════════════════════════════════════════
// دوال قراءة البيانات
// ═══════════════════════════════════════════════════════════════

function getDashboardStats(ss) {
  const sheet = ss.getSheetByName("الزيارة_الشاملة");
  if (!sheet) return { stats: {}, recentVisits: [], complaintsStats: {} };
  const data = sheet.getDataRange().getValues();
  if (data.length <= 2) return { stats: { totalVisits: 0, avgScore: 0, excellentCount: 0, poorCount: 0 }, recentVisits: [], complaintsStats: {} };

  const rows   = data.slice(2); // تخطي صف العنوان وصف الرؤوس
  const scores = rows.map(r => Number(r[30]) || 0);
  const avgScore      = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const excellentCount = scores.filter(s => s >= 90).length;
  const goodCount      = scores.filter(s => s >= 75 && s < 90).length;
  const poorCount      = scores.filter(s => s < 60).length;

  const recentVisits = rows.slice(-10).reverse().map(r => ({
    visitId:      r[0],
    sectorName:   r[1],
    centerName:   r[2],
    visitDate:    r[3],
    inspectorName: r[6],
    centerScore:  r[20],
    medicalScore: r[24],
    ambulanceScore: r[29],
    overallScore: r[30]
  }));

  // إحصائيات الشكاوى والمخالفات
  const complaintsStats = getComplaintsStats(ss);

  return { stats: { totalVisits: rows.length, avgScore, excellentCount, goodCount, poorCount }, recentVisits, complaintsStats };
}

function getComplaintsStats(ss) {
  const sheet = ss.getSheetByName("الشكاوى_والمخالفات");
  if (!sheet) return { total: 0, complaints: 0, violations: 0, underAction: 0, suspicion: 0, noViolation: 0, notProven: 0 };
  const rows = sheet.getDataRange().getValues().slice(2).filter(r => r[0]);
  const total       = rows.length;
  const complaints  = rows.filter(r => r[1] === "شكوى").length;
  const violations  = rows.filter(r => r[1] === "مخالفة").length;
  const underAction = rows.filter(r => r[17] === "تحت الإجراء").length;
  const suspicion   = rows.filter(r => r[17] === "اشتباه وجود مخالفة").length;
  const noViolation = rows.filter(r => r[17] === "عدم وجود مخالفة").length;
  const notProven   = rows.filter(r => r[17] === "عدم ثبوت المخالفة").length;
  return { total, complaints, violations, underAction, suspicion, noViolation, notProven };
}

function getComplaints(ss) {
  const sheet = ss.getSheetByName("الشكاوى_والمخالفات");
  if (!sheet) return { complaints: [] };
  const rows = sheet.getDataRange().getValues().slice(2);
  const complaints = rows.filter(r => r[0]).map(r => ({
    id:            r[0],
    type:          r[1],
    source:        r[2],
    subject:       r[3],
    sectorName:    r[5],
    centerName:    r[6],
    inspectorName: r[7],
    date:          r[8],
    refNumber:     r[10],
    result:        r[17],
    notes:         r[18],
    createdAt:     r[20]
  }));
  return { complaints };
}

function getAllVisits(ss) {
  const sources = [
    { name: "الزيارة_الشاملة", type: "comprehensive_visit", sectorCol: 1, centerCol: 2, inspectorCol: 6, dateCol: 3, scoreCol: 30 },
    { name: "أقسام_الطوارئ",   type: "emergency_dept",      sectorCol: 1, centerCol: 2, inspectorCol: 6, dateCol: 5, scoreCol: 10 },
    { name: "وقوف_على_مركز",   type: "spot_check",          sectorCol: 1, centerCol: 2, inspectorCol: 4, dateCol: 3, scoreCol: 6  },
    { name: "حماية_الشارة",    type: "badge_protection",    sectorCol: 1, centerCol: 2, inspectorCol: 6, dateCol: 5, scoreCol: 10 },
    { name: "الزي_الرسمي",     type: "uniform_check",       sectorCol: 1, centerCol: 2, inspectorCol: 5, dateCol: 4, scoreCol: 9  },
  ];

  const allVisits = [];
  sources.forEach(({ name, type, sectorCol, centerCol, inspectorCol, dateCol, scoreCol }) => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;
    const rows = sheet.getDataRange().getValues().slice(2);
    rows.forEach(r => {
      if (!r[0]) return;
      allVisits.push({
        visitId:       r[0],
        visitType:     type,
        sectorName:    r[sectorCol],
        centerName:    r[centerCol],
        inspectorName: r[inspectorCol],
        visitDate:     r[dateCol],
        overallScore:  r[scoreCol]
      });
    });
  });

  allVisits.sort((a, b) => String(b.visitDate).localeCompare(String(a.visitDate)));
  return { visits: allVisits };
}

function getCorrespondences(ss) {
  const sheet = ss.getSheetByName("المخاطبات");
  if (!sheet) return { correspondences: [] };
  const rows = sheet.getDataRange().getValues().slice(2);
  const correspondences = rows.filter(r => r[0]).map(r => ({
    corrId:          r[0],
    referenceNumber: r[1],
    sectorName:      r[2],
    centerName:      r[3],
    toDepartment:    r[4],
    subject:         r[5],
    status:          r[6],
    priority:        r[7],
    createdAt:       r[8],
    dueDate:         r[9],
    createdByName:   r[10],
    body:            r[11]
  }));
  return { correspondences };
}

// ═══════════════════════════════════════════════════════════════
// دوال مساعدة
// ═══════════════════════════════════════════════════════════════

function setSheetTitle(sheet, title) {
  sheet.setRowHeight(1, 55);
  const lastCol = Math.min(sheet.getMaxColumns(), 20);
  sheet.getRange(1, 1, 1, lastCol).merge()
    .setValue(title)
    .setBackground(DARK_RED).setFontColor(WHITE)
    .setFontSize(13).setFontWeight("bold")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
}

function setHeaderRow(sheet, row, headers, bgColor) {
  sheet.getRange(row, 1, 1, headers.length).setValues([headers])
    .setBackground(bgColor || DARK_GRAY).setFontColor(WHITE)
    .setFontWeight("bold").setHorizontalAlignment("center").setWrap(true);
  sheet.setRowHeight(row, 48);
  sheet.setFrozenRows(row);
  for (let i = 1; i <= headers.length; i++) sheet.setColumnWidth(i, 145);
  applyBorders(sheet, `A${row}:${columnLetter(headers.length)}${row}`);
}

function applyBorders(sheet, range) {
  sheet.getRange(range).setBorder(
    true, true, true, true, true, true,
    "#CCCCCC", SpreadsheetApp.BorderStyle.SOLID
  );
}

function colorizeScoreRow(sheet, row, scoreCol) {
  const score = Number(sheet.getRange(row, scoreCol).getValue()) || 0;
  const color = score >= 90 ? "#D5F5E3"
              : score >= 75 ? "#EBF5FB"
              : score >= 60 ? "#FEF9E7"
              : "#FADBD8";
  sheet.getRange(row, 1, 1, scoreCol).setBackground(color);
}

function columnLetter(n) {
  let letter = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
