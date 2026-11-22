(() => {
  if (window.__nxIconPickerLoaded) return;
  window.__nxIconPickerLoaded = true;
  const $ = id => document.getElementById(id);

  function resizeToDataUrl(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => {
        const img = new Image();
        img.onload = () => {
          const cv = document.createElement('canvas');
          cv.width = 320; cv.height = 320;
          const ctx = cv.getContext('2d');
          const s = Math.max(320 / img.width, 320 / img.height);
          const dw = img.width * s, dh = img.height * s;
          ctx.drawImage(img, (320 - dw) / 2, (320 - dh) / 2, dw, dh);
          res(cv.toDataURL('image/webp', 0.86));
        };
        img.onerror = rej;
        img.src = fr.result;
      };
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }

  function mountPicker() {
    const iconIn = $('appIconIn');
    if (!iconIn || $('nxIconPickWrap')) return;
    const wrap = document.createElement('div');
    wrap.id = 'nxIconPickWrap';
    wrap.className = 'flex items-center gap-2.5 p-2 rounded-xl bg-black/60 border border-fuchsia-500/35';
    wrap.innerHTML = `<img id='nxIconPrevThumb' class='w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-900 shrink-0'><label class='flex-1 py-2 px-3 rounded-lg bg-fuchsia-600/30 border border-fuchsia-400/50 text-center cursor-pointer'><span class='block text-xs font-black text-fuchsia-200'>Pick Icon Photo From Phone</span><span class='block text-[9px] text-fuchsia-300/80'>Auto-crops &amp; saves image directly to card</span><input id='nxIconFileIn' type='file' accept='image/*' class='hidden'></label>`;
    iconIn.insertAdjacentElement('beforebegin', wrap);

    const syncThumb = () => { if ($('nxIconPrevThumb')) $('nxIconPrevThumb').src = iconIn.value || ''; };
    iconIn.addEventListener('input', syncThumb);
    const obs = new MutationObserver(syncThumb);
    if ($('nxEditModal')) obs.observe($('nxEditModal'), { attributes: true, attributeFilter: ['class'] });

    $('nxIconFileIn').onchange = async e => {
      const f = e.target.files?.[0];
      if (!f) return;
      try {
        const dataUrl = await resizeToDataUrl(f);
        iconIn.value = dataUrl;
        syncThumb();
      } catch { alert('Could not load image.'); }
      e.target.value = '';
    };
  }

  mountPicker();
})();