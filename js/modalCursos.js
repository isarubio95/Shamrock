/* ===== Modal cursos ===== */
(function(){
  const modal    = document.getElementById('courseModal');
  const backdrop = document.getElementById('courseModalBackdrop');
  const titleEl  = document.getElementById('courseModalTitle');
  const descEl   = document.getElementById('courseModalDesc');
  const imgEl    = document.getElementById('courseModalImg');

  if(!modal || !backdrop || !titleEl || !descEl || !imgEl) return;

  // Evita submit/navegación accidental
  document.querySelectorAll('.course-card .btn').forEach(btn=>{
    if (!btn.getAttribute('type')) btn.setAttribute('type','button');
    btn.addEventListener('click', e => e.preventDefault());
  });

  // Obtiene la clave base desde data-i18n de la card (p.ej. "courses.kids")
  function getBaseKeyFromCard(card){
    return card.querySelector('.course-title')?.dataset.i18n || null;
  }

  function fillModalFromCard(card){
    const baseKey = getBaseKeyFromCard(card); // "courses.kids"
    const lang = document.documentElement.getAttribute('lang') || 'es';
    const dict = I18N[lang] || I18N.es;

    if (baseKey){
      modal.dataset.courseKey = baseKey; // guardar para re-traducir si cambia el idioma
      titleEl.textContent = dict[`${baseKey}.title`] || dict[baseKey] || card.querySelector('.course-title')?.textContent?.trim() || 'Curso';
      descEl.textContent  = dict[`${baseKey}.desc`] || '';
    } else {
      delete modal.dataset.courseKey;
      titleEl.textContent = card.querySelector('.course-title')?.textContent?.trim() || 'Curso';
      descEl.textContent  = '';
    }

    const img = card.querySelector('.media img');
    imgEl.src = img?.getAttribute('src') || '';
    imgEl.alt = img?.getAttribute('alt') || titleEl.textContent;
  }

  // Scroll lock sin “salto” (reutiliza las mismas funciones)
  let openerBtn = null;
  function setAriaOpen(isOpen){
    modal.setAttribute('aria-hidden', String(!isOpen));
    backdrop.setAttribute('aria-hidden', String(!isOpen));
  }

  function openModal(){
    setAriaOpen(true);
    modal.classList.add('show');
    backdrop.hidden = false;
    backdrop.classList.add('show');
    lockPageScroll();
    document.body.classList.add('hide-header');
    modal.querySelector('[data-dismiss="modal"]')?.focus();
  }

  function closeModal(){
    setAriaOpen(false);
    modal.classList.remove('show');
    backdrop.classList.remove('show');
    unlockPageScroll();
    document.body.classList.remove('hide-header');
    setTimeout(()=>{ if(!backdrop.classList.contains('show')) backdrop.hidden = true; }, 200);
    openerBtn?.focus();
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.course-card .btn');
    if (!btn) return;
    e.preventDefault();
    openerBtn = btn;

    const card = btn.closest('.course-card');
    if (!card) return;

    fillModalFromCard(card);
    openModal();
  });

  modal.querySelectorAll('[data-dismiss="modal"]').forEach(el=>{
    el.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  });
  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('show')) closeModal(); });
  modal.addEventListener('click', (e) => { const dlg = e.target.closest('.modal-content'); if (!dlg) closeModal(); });

  // === Quiero más info: cerrar, ir a #contacto y enfocar campo "name" ===
  const masInfoBtn = document.getElementById('masInfo');
  if (masInfoBtn){
    masInfoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();     
    const target = document.getElementById('contacto');
    target?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
        const nameInput = document.querySelector('#name, [name="name"]');
        if (nameInput && typeof nameInput.focus === 'function') {
        try { nameInput.focus({ preventScroll: true }); }
        catch { nameInput.focus(); }
        }
    }, 50); // pequeño delay para asegurar que la sección ya está a la vista
    });
  }
})();
