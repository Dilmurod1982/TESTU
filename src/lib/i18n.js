import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const ru = {
  nav: { features: "Возможности", about: "О платформе", contact: "Контакты", login: "Вход", register: "Регистрация" },
  hero: {
    badge: "Платформа для университетов",
    title: "Современное тестирование для студентов",
    subtitle: "TESTU помогает преподавателям создавать тесты и комнаты, а студентам — присоединяться по коду комнаты.",
    ctaRegister: "Начать бесплатно",
    ctaLogin: "У меня есть аккаунт",
  },
  features: {
    title: "Почему TESTU", subtitle: "Всё, что нужно университету",
    f1: { title: "Тесты онлайн", text: "Создавайте тесты с любым числом вопросов." },
    f2: { title: "Комнаты по коду", text: "Студенты входят по коду комнаты." },
    f3: { title: "Роли и права", text: "Суперадмин, админ, учитель, студент." },
    f4: { title: "Мультиязычность", text: "Узбекский, русский, английский." },
    f5: { title: "Темы", text: "Светлая, тёмная, системная." },
    f6: { title: "Адаптивность", text: "Удобно на любом устройстве." },
  },
  about: { title: "О TESTU", text: "Платформа создана для университетов." },
  cta: { title: "Готовы попробовать?", text: "Зарегистрируйтесь как студент.", register: "Регистрация", login: "Войти" },
  footer: { tagline: "Современная платформа тестирования.", contacts: "Контакты", legal: "Правовая информация" },
  auth: {
    loginTitle: "Вход в TESTU", loginSubtitle: "Введите email и пароль",
    password: "Пароль", loginBtn: "Войти", or: "или", google: "Войти через Google", apple: "Войти через Apple",
    noAccount: "Нет аккаунта?", haveAccount: "Уже есть аккаунт?",
    registerTitle: "Регистрация", registerSubtitle: "Создайте аккаунт студента",
    lastName: "Фамилия", firstName: "Имя", middleName: "Отчество",
    selectGroup: "Выберите группу", registerBtn: "Зарегистрироваться",
  },
  dashboard: { home: "Главная", logout: "Выйти" },
};

const en = {
  nav: { features: "Features", about: "About", contact: "Contact", login: "Login", register: "Sign up" },
  hero: {
    badge: "University platform",
    title: "Modern testing for students",
    subtitle: "TESTU helps teachers create tests and rooms, while students join by room code.",
    ctaRegister: "Get started",
    ctaLogin: "I have an account",
  },
  features: {
    title: "Why TESTU", subtitle: "Everything a university needs",
    f1: { title: "Online tests", text: "Create tests with any number of questions." },
    f2: { title: "Rooms by code", text: "Students join by room code." },
    f3: { title: "Roles & rights", text: "Superadmin, admin, teacher, student." },
    f4: { title: "Multilingual", text: "Uzbek, Russian, English." },
    f5: { title: "Themes", text: "Light, dark, system." },
    f6: { title: "Responsive", text: "Great on any device." },
  },
  about: { title: "About TESTU", text: "Built for universities." },
  cta: { title: "Ready to try?", text: "Sign up as a student.", register: "Sign up", login: "Login" },
  footer: { tagline: "Modern testing platform.", contacts: "Contacts", legal: "Legal" },
  auth: {
    loginTitle: "Login to TESTU", loginSubtitle: "Enter email and password",
    password: "Password", loginBtn: "Login", or: "or", google: "Continue with Google", apple: "Continue with Apple",
    noAccount: "No account?", haveAccount: "Already have an account?",
    registerTitle: "Sign up", registerSubtitle: "Create a student account",
    lastName: "Last name", firstName: "First name", middleName: "Middle name",
    selectGroup: "Select group", registerBtn: "Sign up",
  },
  dashboard: { home: "Home", logout: "Log out" },
};

const uzLatn = {
  nav: { features: "Imkoniyatlar", about: "Platforma haqida", contact: "Aloqa", login: "Kirish", register: "Ro'yxatdan o'tish" },
  hero: {
    badge: "Universitet platformasi",
    title: "Talabalar uchun zamonaviy testlash",
    subtitle: "TESTU o'qituvchilarga test va xonalar yaratishda yordam beradi, talabalar xona kodi orqali qo'shiladi.",
    ctaRegister: "Boshlash",
    ctaLogin: "Mening akkauntim bor",
  },
  features: {
    title: "Nega TESTU", subtitle: "Universitet uchun hamma narsa",
    f1: { title: "Onlayn testlar", text: "Istalgan miqdordagi savolli testlar." },
    f2: { title: "Kod bo'yicha xonalar", text: "Talabalar xona kodi orqali kiradi." },
    f3: { title: "Rollar va huquqlar", text: "Superadmin, admin, o'qituvchi, talaba." },
    f4: { title: "Ko'p tillilik", text: "O'zbek, rus, ingliz." },
    f5: { title: "Mavzular", text: "Yorug', qorong'i, tizim." },
    f6: { title: "Moslashuvchan", text: "Har qanday qurilmada qulay." },
  },
  about: { title: "TESTU haqida", text: "Universitetlar uchun yaratilgan platforma." },
  cta: { title: "Sinab ko'rishga tayyormisiz?", text: "Talaba sifatida ro'yxatdan o'ting.", register: "Ro'yxatdan o'tish", login: "Kirish" },
  footer: { tagline: "Zamonaviy test platformasi.", contacts: "Kontaktlar", legal: "Huquqiy ma'lumot" },
  auth: {
    loginTitle: "TESTU ga kirish", loginSubtitle: "Email va parolni kiriting",
    password: "Parol", loginBtn: "Kirish", or: "yoki", google: "Google orqali kirish", apple: "Apple orqali kirish",
    noAccount: "Akkauntingiz yo'qmi?", haveAccount: "Akkauntingiz bormi?",
    registerTitle: "Ro'yxatdan o'tish", registerSubtitle: "Talaba akkauntini yarating",
    lastName: "Familiya", firstName: "Ism", middleName: "Otasining ismi",
    selectGroup: "Guruhni tanlang", registerBtn: "Ro'yxatdan o'tish",
  },
  dashboard: { home: "Asosiy", logout: "Chiqish" },
};

const uzCyrl = {
  nav: { features: "Имкониятлар", about: "Платформа ҳақида", contact: "Алоқа", login: "Кириш", register: "Рўйхатдан ўтиш" },
  hero: {
    badge: "Университет платформаси",
    title: "Талабалар учун замонавий тестлаш",
    subtitle: "TESTU ўқитувчиларга тест ва хоналар яратишда ёрдам беради, талабалар хона коди орқали қўшилади.",
    ctaRegister: "Бошлаш",
    ctaLogin: "Менинг аккаунтим бор",
  },
  features: {
    title: "Нега TESTU", subtitle: "Университет учун ҳамма нарса",
    f1: { title: "Онлайн тестлар", text: "Исталган миқдордаги саволли тестлар." },
    f2: { title: "Код бўйича хоналар", text: "Талабалар хона коди орқали киради." },
    f3: { title: "Роллар ва ҳуқуқлар", text: "Суперадмин, админ, ўқитувчи, талаба." },
    f4: { title: "Кўп тиллилик", text: "Ўзбек, рус, инглиз." },
    f5: { title: "Мавзулар", text: "Ёруғ, қоронғи, тизим." },
    f6: { title: "Мослашувчан", text: "Ҳар қандай қурилмада қулай." },
  },
  about: { title: "TESTU ҳақида", text: "Университетлар учун яратилган платформа." },
  cta: { title: "Синаб кўришга тайёрмисиз?", text: "Талаба сифатида рўйхатдан ўтинг.", register: "Рўйхатдан ўтиш", login: "Кириш" },
  footer: { tagline: "Замонавий тест платформаси.", contacts: "Контактлар", legal: "Ҳуқуқий маълумот" },
  auth: {
    loginTitle: "TESTU га кириш", loginSubtitle: "Email ва паролни киритинг",
    password: "Парол", loginBtn: "Кириш", or: "ёки", google: "Google орқали кириш", apple: "Apple орқали кириш",
    noAccount: "Аккаунтингиз йўқми?", haveAccount: "Аккаунтингиз борми?",
    registerTitle: "Рўйхатдан ўтиш", registerSubtitle: "Талаба аккаунтини яратинг",
    lastName: "Фамилия", firstName: "Исм", middleName: "Отасининг исми",
    selectGroup: "Гуруҳни танланг", registerBtn: "Рўйхатдан ўтиш",
  },
  dashboard: { home: "Асосий", logout: "Чиқиш" },
};

const resources = {
    ru: { translation: ru },
    en: { translation: en },
    uzLatn: { translation: uzLatn },   // было "uz-latn"
    uzCyrl: { translation: uzCyrl },   // было "uz-cyrl"
  };

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("testu-lang") || "ru",
  fallbackLng: "ru",
  supportedLngs: ["ru", "en", "uzLatn", "uzCyrl"],   // без дефисов
  nonExplicitSupportedLngs: false,
  load: "currentOnly",
  interpolation: { escapeValue: false },
});

// Диагностика: проверяем, что ресурсы на месте, но НЕ используем getFixedT
// для принятия решений — он не загружает языки автоматически.
i18n.on("initialized", () => {
  console.log("[i18n] initialized, language =", i18n.language);
  console.log("[i18n] has uz-latn:", i18n.hasResourceBundle("uz-latn", "translation"));
  console.log("[i18n] has uz-cyrl:", i18n.hasResourceBundle("uz-cyrl", "translation"));
});

i18n.on("languageChanged", (lng) => {
  console.log("[i18n] languageChanged ->", lng);
  console.log("[i18n] resolvedLanguage =", i18n.resolvedLanguage);
});

export default i18n;