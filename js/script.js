/* =========================
   SHAMROCK – script.js (clean)
   ========================= */

/* === Scroll lock sin movimiento (para menú móvil / modal) === */
let __scrollLockY = null;
function lockPageScroll(){
  if (__scrollLockY !== null) return;                // ya bloqueado
  __scrollLockY = window.pageYOffset || document.documentElement.scrollTop || 0;

  // Evita cualquier animación de scroll mientras bloqueamos
  const prevScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';

  // Fijamos el body sin provocar “salto”
  document.body.style.position = 'fixed';
  document.body.style.top = `-${__scrollLockY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  // (No usamos overflow:hidden para evitar rarezas en iOS)
  document.body.classList.add('body-lock');

  // Restauramos el scroll-behavior (por si la hoja lo usa en anclas)
  document.documentElement.style.scrollBehavior = prevScrollBehavior || '';
}
function unlockPageScroll(){
  if (__scrollLockY === null) return;

  // Quitamos el “fixed” y restauramos exactamente la posición previa
  document.body.classList.remove('body-lock');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';

  const y = __scrollLockY;
  __scrollLockY = null;

  // Volver exactamente al mismo punto, instantáneo (sin “reubicación” visible)
  const prevScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';
  window.scrollTo(0, y);
  document.documentElement.style.scrollBehavior = prevScrollBehavior || '';
}

/* --- Menú móvil --- */
(function(){
  const btn = document.getElementById('btn-menu');
  const nav = document.getElementById('main-nav');
  const backdrop = document.getElementById('nav-backdrop');
  const mq = window.matchMedia('(max-width: 860px)');

  if(!btn || !nav || !backdrop) return;

  function afterTransitionEnableClicks(e){
    if (e && e.target !== nav) return; // sólo la transición del propio .nav
    nav.classList.remove('is-opening');
    nav.classList.add('is-ready');
    nav.removeEventListener('transitionend', afterTransitionEnableClicks);
  }

  function openMenu(){
    nav.classList.remove('is-ready');
    nav.classList.add('is-opening');

    // Abrimos el panel en el siguiente frame (para que aplique la transición)
    requestAnimationFrame(()=>{
      nav.classList.add('is-open');
      nav.addEventListener('transitionend', afterTransitionEnableClicks);
    });

    // Backdrop oscurecido visible (no blanco)
    backdrop.hidden = false;
    backdrop.classList.add('is-open');

    btn.setAttribute('aria-expanded','true');

    // Bloquear scroll sin desplazamiento
    lockPageScroll();
  }

  function closeMenu(){
    nav.classList.remove('is-open','is-opening','is-ready');
    nav.removeEventListener('transitionend', afterTransitionEnableClicks);

    backdrop.classList.remove('is-open');
    btn.setAttribute('aria-expanded','false');

    // Desbloquear scroll manteniendo la posición exacta
    unlockPageScroll();

    // Tras la transición, ocultamos el backdrop para no atrapar clics
    setTimeout(()=>{ if(!backdrop.classList.contains('is-open')) backdrop.hidden = true; }, 260);
  }

  function toggleMenu(){ nav.classList.contains('is-open') ? closeMenu() : openMenu(); }

  // Botón hamburguesa: nunca deja que la página se mueva
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  backdrop.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
  });

  // Al pulsar opciones del menú, cerramos y dejamos que el enlace navegue
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      closeMenu();
      // Navegación normal (ancla o link) — no tocamos el scroll manualmente
    });
  });

  // Escape cierra el menú sin mover la página
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });

  // Si cambia el breakpoint, cerramos y recalculamos header
  mq.addEventListener('change', () => { closeMenu() });
})();

/* === Auto-hide header (fixed) === */
(function(){
  const header = document.querySelector('.site-header');
  const nav    = document.getElementById('main-nav');
  if(!header) return;

  const getY = () => window.pageYOffset || document.documentElement.scrollTop || 0;
  let lastY = getY();
  let raf = false;

  const show = () => header.classList.remove('is-hidden');
  const hide = () => header.classList.add('is-hidden');

  function onScrollCore(){
    const y = getY();

    // Si el menú móvil/overlay bloquea el scroll, mantenlo visible y no actúes
    const menuOpen = nav && nav.classList.contains('is-open');
    const bodyLocked = document.body.classList.contains('body-lock') || (document.body.style.position === 'fixed');
    if (menuOpen || bodyLocked) { show(); lastY = y; return; }

    // Siempre visible pegado al top
    if (y <= 2){ show(); lastY = y; return; }

    // Dirección de scroll
    if (y > lastY + 2){        // bajando
      hide();
    } else if (y < lastY - 2){ // subiendo
      show();
    }
    lastY = y;
  }

  function onScrollRaf(){
    if (raf) return;
    raf = true;
    requestAnimationFrame(() => { onScrollCore(); raf = false; });
  }

  window.addEventListener('scroll', onScrollRaf, { passive:true });
  window.addEventListener('resize', () => { show(); });

  // Enlaces internos: muestra antes de desplazar (por si estaba oculto)
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    show();
  });
})();

/* --- Switch de idioma (píldoras) --- */
function setActiveLangPill(lang) {
  document.querySelectorAll('.lang-switch .lang').forEach(x => {
    x.classList.toggle('lang--active', x.dataset.lang === lang);
  });
}

/* ===== I18N ===== */
const I18N = {
  es: {
    "_title":"SHAMROCK — English Language Solutions",
    "nav.home":"Inicio","nav.courses":"Cursos","nav.contact":"Contacto",
    "hero.brand":"SHAMROCK","hero.tagline":"English Language Solutions",
    "hero.lead":"Aprender, mejorar, perfeccionar o simplemente disfrutar. Cualquier motivación que tengas hay una solución para ti.",
    "hero.cta":"VER CURSOS ↗",

    "offer.title":"¿QUÉ OFRECEMOS?",
    "offer.experience.title":"Amplia Experiencia",
    "offer.experience.desc":"Profesionales con más de 25 años de experiencia.",
    "offer.teachers.title":"Profesorado Nativo y Bilingüe",
    "offer.teachers.desc":"Clases dinámicas orientadas a objetivos reales.",
    "offer.certs.title":"Preparación de Certificados",
    "offer.certs.desc":"Cambridge, Trinity, IELTS, Aptis, TOEFL, EOI.",
    "offer.business.title":"Planes para Empresas",
    "offer.business.desc":"Formación in-company adaptada a tu sector.",
    "offer.schedules.title":"Horarios Flexibles",
    "offer.schedules.desc":"Modalidad presencial y online, individuales y grupos.",
    "offer.method.title":"Metodología Propia",
    "offer.method.desc":"Materiales prácticos y seguimiento continuo.",
    "offer.assessment.title":"Evaluaciones Periódicas",
    "offer.assessment.desc":"Informes de progreso con recomendaciones.",
    "offer.care.title":"Atención Cercana",
    "offer.care.desc":"Trato personalizado para cada estudiante.",
    "contact.title":"CONTACTO","contact.alt":"También puedes contactarnos a través de:","contact.phone":" Teléfono","contact.addressLabel":"Visítenos en Calle 7 Infantes de Lara nº 16",

    /* Modal (títulos/desc) */
    "courses.title":"NUESTROS CURSOS",
    "courses.more": 'Saber más <span aria-hidden="true">↗</span>',
    "courses.inmersive.title":"Experiencia Inmersiva",
    "courses.inmersive.desc":"Práctica continua en un entorno 100% en inglés: clases, talleres y actividades culturales.",
    "courses.preteens.title":"Jóvenes (7-11 años)",
    "courses.preteens.desc":"Actividades en grupo para estimular la comunicación en inglés.",
    "courses.teens.title":"Adolescentes",
    "courses.teens.desc":"Enfocado en exámenes escolares y comunicación fluida.",
    "courses.adults.title":"Adultos",
    "courses.adults.desc":"Clases prácticas adaptadas a tu nivel y objetivos.",
    "courses.business.title":"Empresas",
    "courses.business.desc":"Formación in-company adaptada al sector de tu empresa.",
    "courses.exams.title":"Exámenes Oficiales",
    "courses.exams.desc":"Preparación para Cambridge, IELTS, TOEFL y más.",

    "form.title":"Estamos encantados de ayudarte","form.name":"Nombre","form.email":"Correo","form.phone":"Teléfono","form.message":"Mensaje","form.send":"ENVIAR ↗","form.privacy":'Acepto la <a href="/politica-privacidad" target="_blank">Política de privacidad</a>',
    "footer.hours":"Horario","footer.hours.morning":"Mañanas: 10:00 – 14:00","footer.hours.afternoon":"Tardes: 16:30 – 20:00","footer.where":"Dónde encontrarnos","footer.address.line":"C/ Siete Infantes de Lara, 16","footer.address.map":"Ver en Google Maps","footer.contact":"Contacto","footer.links":"Enlaces de interés","footer.link.certs":"Preparación para certificados","footer.link.business":"Inglés para empresas","footer.link.private":"Clases particulares","footer.rights":"Todos los derechos reservados.",
    "form.ok.title":"¡Mensaje enviado!",
    "form.ok.body":"Gracias por contactarnos. Te responderemos lo antes posible.",
    "modal.close": "Cerrar",
    "modal.moreInfo": "Quiero más info",
  },
  en: {
    "_title":"SHAMROCK — English Language Solutions",
    "nav.home":"Home","nav.courses":"Courses","nav.contact":"Contact",
    "hero.brand":"SHAMROCK","hero.tagline":"English Language Solutions",
    "hero.lead":"Learn, improve, polish or simply enjoy. Whatever your motivation, there’s a solution for you.",
    "hero.cta":"SEE COURSES ↗",

    "offer.title":"WHAT DO WE OFFER?",
    "offer.experience.title":"Extensive Experience",
    "offer.experience.desc":"Professionals with over 25 years’ experience.",
    "offer.teachers.title":"Native & Bilingual Teachers",
    "offer.teachers.desc":"Dynamic classes focused on real goals.",
    "offer.certs.title":"Exam Preparation",
    "offer.certs.desc":"Cambridge, Trinity, IELTS, Aptis, TOEFL, EOI.",
    "offer.business.title":"Corporate Plans",
    "offer.business.desc":"In-company training tailored to your sector.",
    "offer.schedules.title":"Flexible Schedules",
    "offer.schedules.desc":"In-person & online, one-to-one and groups.",
    "offer.method.title":"Our Methodology",
    "offer.method.desc":"Practical materials and continuous follow-up.",
    "offer.assessment.title":"Regular Assessments",
    "offer.assessment.desc":"Progress reports with recommendations.",
    "offer.care.title":"Close Attention",
    "offer.care.desc":"Personalized care for every student.",

    "contact.title":"CONTACT","contact.alt":"You can also contact us via:","contact.phone":" Phone","contact.addressLabel":"Visit us at Calle 7 Infantes de Lara nº 16",

    /* Modal (títulos/desc) */
    "courses.title":"OUR COURSES",
    "courses.more": 'Learn more <span aria-hidden="true">↗</span>',
    "courses.inmersive.title": "Immersive Experience","courses.inmersive.desc": "Continuous practice in a 100% English environment: classes, workshops, and cultural activities.",
    "courses.preteens.title":"Juniors (7–11)",
    "courses.preteens.desc":"Group activities to stimulate communication in English.",
    "courses.teens.title":"Teens",
    "courses.teens.desc":"Focused on school exams and fluent communication.",
    "courses.adults.title":"Adults",
    "courses.adults.desc":"Practical classes adapted to your level and goals.",
    "courses.business.title":"Business",
    "courses.business.desc":"In-company training tailored to your sector.",
    "courses.exams.title":"Official Exams",
    "courses.exams.desc":"Preparation for Cambridge, IELTS, TOEFL and more.",

    "form.title":"We’re happy to help","form.name":"Name","form.email":"Email","form.phone":"Phone","form.message":"Message","form.send":"SEND ↗","form.privacy":'I accept the <a href="/privacy-policy" target="_blank">Privacy Policy</a>',
    "footer.hours":"Hours","footer.hours.morning":"Mornings: 10:00 – 14:00","footer.hours.afternoon":"Afternoons: 16:30 – 20:00","footer.where":"Find us","footer.address.line":"C/ Siete Infantes de Lara, 16","footer.address.map":"Open in Google Maps","footer.contact":"Contact","footer.links":"Useful links","footer.link.certs":"Exam preparation","footer.link.business":"Business English","footer.link.private":"Private lessons","footer.rights":"All rights reserved.",
    "form.ok.title":"Message sent!",
    "form.ok.body":"Thanks for contacting us. We’ll get back to you shortly.",
    "modal.close": "Close",
    "modal.moreInfo": "More info",
  }
};

const DEFAULT_LANG = "es";

// 2) Mejora applyLang para que acepte claves base (fallback a ".title")
function applyLang(lang) {
  const dict = I18N[lang] || I18N[DEFAULT_LANG];
  document.documentElement.setAttribute('lang', lang);
  if (dict._title) document.title = dict._title;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    // intento directo, luego ".title", luego ".label"
    const val = dict[key] ?? dict[`${key}.title`] ?? dict[`${key}.label`];
    if (val != null) el.innerHTML = val;
  });

  // Si hay una modal abierta, re-tradúcela usando la clave guardada
  const modal = document.getElementById('courseModal');
  if (modal?.classList.contains('show') && modal.dataset.courseKey){
    const titleEl = document.getElementById('courseModalTitle');
    const descEl  = document.getElementById('courseModalDesc');
    const baseKey = modal.dataset.courseKey; // p.ej. "courses.teens"
    titleEl.textContent = dict[`${baseKey}.title`] || dict[baseKey] || titleEl.textContent;
    descEl.textContent  = dict[`${baseKey}.desc`]  || descEl.textContent;
  }

  setActiveLangPill(lang);
  localStorage.setItem('lang', lang);
}

function initLang() {
  const p = new URLSearchParams(location.search).get('lang');
  const stored = localStorage.getItem('lang');
  const initial = (p === 'en' || p === 'es') ? p : (stored || DEFAULT_LANG);
  applyLang(initial);
}

document.querySelectorAll('.lang-switch .lang').forEach(el => {
  el.addEventListener('click', () => {
    const lang = el.dataset.lang;
    if (lang === 'es' || lang === 'en') applyLang(lang);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  initLang();
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});

/* --- Reubicación del título en sección "one" --- */
(function () {
  const mq2 = window.matchMedia('(max-width: 980px)');
  const section = document.querySelector('.one');
  const grid = section?.querySelector('.one-grid');
  const features = section?.querySelector('.one-features');
  const title = features?.querySelector('h2');
  const list = features?.querySelector('.feature-list');
  if (!section || !grid || !features || !title || !list) return;

  function place(e) {
    if (e.matches) section.insertBefore(title, grid);
    else features.insertBefore(title, list);
  }
  place(mq2);
  mq2.addEventListener('change', place);
})();