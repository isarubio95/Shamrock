// === Envío del formulario por fetch + modal de confirmación (texto "OK") ===
(function(){
  const form = document.getElementById('contact-form');
  if (!form) return;

  const hint = document.getElementById('form-hint');
  const submitBtn = form.querySelector('button[type="submit"]');

  const okModal  = document.getElementById('formOkModal');
  const backdrop = document.getElementById('courseModalBackdrop');

  function setAriaOpen(el, isOpen){
    el?.setAttribute('aria-hidden', String(!isOpen));
    backdrop?.setAttribute('aria-hidden', String(!isOpen));
  }
  function openOkModal(){
    if (!okModal || !backdrop) return;
    document.body.classList.add('hide-header');           // ← oculta header
    setAriaOpen(okModal, true);
    okModal.classList.add('show');
    backdrop.hidden = false;
    backdrop.classList.add('show');
    if (typeof lockPageScroll === 'function') lockPageScroll();
    okModal.querySelector('[data-dismiss="modal"]')?.focus();
  }
  function closeOkModal(){
    if (!okModal || !backdrop) return;
    document.body.classList.remove('hide-header');        // ← vuelve a mostrar header
    setAriaOpen(okModal, false);
    okModal.classList.remove('show');
    backdrop.classList.remove('show');
    if (typeof unlockPageScroll === 'function') unlockPageScroll();
    setTimeout(()=>{ if(!backdrop.classList.contains('show')) backdrop.hidden = true; }, 200);
  }

  okModal?.querySelectorAll('[data-dismiss="modal"]').forEach(el=>{
    el.addEventListener('click', (e)=>{ e.preventDefault(); closeOkModal(); });
  });
  backdrop?.addEventListener('click', ()=>{ if (okModal?.classList.contains('show')) closeOkModal(); });
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape' && okModal?.classList.contains('show')) closeOkModal(); });
  okModal?.addEventListener('click', (e)=>{ if (!e.target.closest('.modal-content')) closeOkModal(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn?.setAttribute('disabled','disabled');
    const prevText = submitBtn?.textContent;
    if (submitBtn) submitBtn.textContent = 'Enviando…';
    if (hint) hint.textContent = 'Enviando…';

    try {
      const res = await fetch(form.action || 'sendmail.php', {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'text/plain' }, // ← esperamos texto
        cache: 'no-store',
        credentials: 'same-origin'
      });

      const txt = (await res.text()).trim().toUpperCase();
      const ok  = res.ok && (txt.includes('OK') || txt === 'OK');

      if (ok) {
        form.reset();
        if (hint) hint.textContent = 'Mensaje enviado. ¡Gracias!';
        openOkModal();
      } else {
        if (hint) hint.textContent = 'No se pudo enviar. Inténtalo de nuevo.';
        console.warn('Respuesta servidor:', txt);
      }
    } catch (err) {
      if (hint) hint.textContent = 'Error de conexión. Inténtalo más tarde.';
      console.error(err);
    } finally {
      if (submitBtn){
        submitBtn.removeAttribute('disabled');
        if (prevText) submitBtn.textContent = prevText;
      }
    }
  });
})();
