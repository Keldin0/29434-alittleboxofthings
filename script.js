// ============================================================
// You shouldn't need to edit this file. All content lives in
// content.js. This file just wires everything up.
// ============================================================

const openedItems = new Set();

// ---- Screen elements ----
const coverScreen = document.getElementById('cover');
const boxScreen = document.getElementById('box');
const formScreen = document.getElementById('form-section');
const confirmationScreen = document.getElementById('confirmation');

function showScreen(screen) {
  [coverScreen, boxScreen, formScreen, confirmationScreen].forEach(s => s.classList.add('hidden'));
  screen.classList.remove('hidden');
  window.scrollTo(0, 0);
}

// ---- Init EmailJS ----
if (window.emailjs && GIFT_CONFIG.emailjs.publicKey && GIFT_CONFIG.emailjs.publicKey !== 'YOUR_PUBLIC_KEY') {
  emailjs.init({ publicKey: GIFT_CONFIG.emailjs.publicKey });
}

// ---- Populate cover ----
document.getElementById('cover-heading').textContent = GIFT_CONFIG.coverHeading;
document.getElementById('tap-text').textContent = GIFT_CONFIG.tapText;

var boxImg = document.getElementById('box-img');
boxImg.src = GIFT_CONFIG.coverImage;
boxImg.alt = GIFT_CONFIG.coverImageAlt;

var openingBox = false;
document.getElementById('open-btn').addEventListener('click', () => {
  if (openingBox) return;
  openingBox = true;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function goOpen() {
    coverScreen.classList.add('opening');
    setTimeout(() => {
      coverScreen.classList.remove('opening');
      showScreen(boxScreen);
    }, 450);
  }

  if (reduceMotion) {
    goOpen();
    return;
  }

  boxImg.classList.remove('idle');
  // force reflow so the shake animation can re-trigger reliably
  void boxImg.offsetWidth;
  boxImg.classList.add('is-shaking');

  let shakeDone = false;
  function finishShake() {
    if (shakeDone) return;
    shakeDone = true;
    boxImg.classList.remove('is-shaking');
    goOpen();
  }
  boxImg.addEventListener('animationend', (e) => {
    if (e.animationName === 'boxShake') finishShake();
  }, { once: true });
  // safety net in case the animationend event doesn't fire
  setTimeout(finishShake, 850);
});

// ---- Render items ----
const itemIcons = { note: '📜', gift: '🎁', link: '🔗' };
const itemsGrid = document.getElementById('items-grid');

function updateProgress() {
  document.getElementById('progress-text').textContent =
    `${openedItems.size} of ${GIFT_CONFIG.items.length} opened`;
}

document.getElementById('box-heading').textContent = GIFT_CONFIG.boxHeading;
document.getElementById('go-to-form-btn').textContent = GIFT_CONFIG.goToFormLabel;

GIFT_CONFIG.items.forEach((item, idx) => {
  const tag = document.createElement('div');
  tag.className = 'item-float';
  tag.id = `tag-${item.id}`;
  // Slightly different duration + a negative delay per item so they
  // don't all bob in perfect unison — same idea as the cover box's
  // idle float, just staggered for a more organic feel.
  const duration = (3.8 + (idx % 4) * 0.35).toFixed(2);
  const delay = (idx * 0.4).toFixed(2);
  tag.style.animationDuration = `${duration}s`;
  tag.style.animationDelay = `-${delay}s`;

  const visualHTML = item.type === 'photo'
    ? `<img class="item-thumb" src="${item.image}" alt="${item.label}">`
    : `<span class="item-icon">${itemIcons[item.type] || '🎁'}</span>`;

  tag.innerHTML = `
    <button class="item-tag-btn" aria-label="open ${item.label}">
      ${visualHTML}
      <span class="item-pill">${item.label}</span>
    </button>
  `;
  tag.querySelector('button').addEventListener('click', () => openItem(item));
  itemsGrid.appendChild(tag);
});
updateProgress();

// ---- Modal reveal ----
const modalOverlay = document.getElementById('modal-overlay');
const modalCard = document.querySelector('.modal-card');
const modalContent = document.getElementById('modal-content');

// Splits text on blank lines and wraps each chunk in its own <p>,
// so a blank line in content.js becomes a real paragraph break here —
// no need for <br> or \n in your text fields.
function renderParagraphs(text, className) {
  return text
    .split(/\n\s*\n/)
    .map(p => `<p class="${className}">${p.trim()}</p>`)
    .join('');
}

function openItem(item) {
  openedItems.add(item.id);
  document.getElementById(`tag-${item.id}`).classList.add('opened');
  updateProgress();

  // Most cards use the paper-grain textured background; an item can opt
  // out with `plainBackground: true` to get a flat color instead.
  modalCard.classList.toggle('modal-card--plain', !!item.plainBackground);

  if (item.type === 'photo') {
    modalContent.innerHTML = `
      <img class="modal-photo" src="${item.image}" alt="${item.label}">
      <p class="modal-caption">${item.caption || ''}</p>
    `;
  } else if (item.type === 'note' || item.type === 'gift') {
    const imageHTML = item.image
      ? `<img class="modal-note-image" src="${item.image}" alt="${item.label}">`
      : '';
    const mapHTML = item.mapEmbedUrl
      ? `<div class="modal-map-wrap"><iframe src="${item.mapEmbedUrl}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`
      : '';
    const paragraphsHTML = renderParagraphs(item.text, 'modal-note-text');
    modalContent.innerHTML = item.imageBelow
      ? `${paragraphsHTML}${imageHTML}${mapHTML}`
      : `${imageHTML}${paragraphsHTML}${mapHTML}`;
  } else if (item.type === 'link') {
    modalContent.innerHTML = `
      <p class="modal-link-label">${item.label}</p>
      <a class="btn btn-primary" href="${item.url}" target="_blank" rel="noopener">${item.linkText || 'open link'}</a>
    `;
  }

  modalOverlay.classList.remove('hidden');
}

document.getElementById('modal-close').addEventListener('click', () => {
  modalOverlay.classList.add('hidden');
});
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
});

// ---- Navigate to form ----
document.getElementById('go-to-form-btn').addEventListener('click', () => showScreen(formScreen));
document.getElementById('back-to-box-btn').addEventListener('click', () => showScreen(boxScreen));

// ---- Render form ----
document.getElementById('form-heading').textContent = GIFT_CONFIG.form.heading;
document.getElementById('form-subheading').textContent = GIFT_CONFIG.form.subheading;

const replyForm = document.getElementById('reply-form');

// Builds the <label> + input markup for one question, appends it to the
// form, and wires up any special interactive behavior it needs. Keeping
// this as one big switch means content.js stays purely declarative —
// no behavior lives there, just data.
function renderQuestion(q) {
  const field = document.createElement('div');
  field.className = 'field';

  if (q.type === 'textarea') {
    field.innerHTML = `
      <label for="${q.id}">${q.label}${q.required ? ' *' : ''}</label>
      <textarea id="${q.id}" name="${q.id}" ${q.required ? 'required' : ''}></textarea>
    `;
    replyForm.appendChild(field);
    return;
  }

  if (q.type === 'text') {
    const infoHTML = q.info
      ? `<span class="info-icon" tabindex="0" role="button" aria-label="more info">i<span class="info-tooltip">${q.info.replace(/\n/g, '<br>')}</span></span>`
      : '';
    field.innerHTML = `
      <label for="${q.id}">${q.label}${q.required ? ' *' : ''}${infoHTML}</label>
      <input type="text" id="${q.id}" name="${q.id}" ${q.required ? 'required' : ''}>
    `;
    replyForm.appendChild(field);
    return;
  }

  if (q.type === 'radio') {
    field.innerHTML = `<label>${q.label}${q.required ? ' *' : ''}</label>`;
    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'radio-options';
    q.options.forEach(opt => {
      const row = document.createElement('label');
      row.className = 'radio-option';
      row.innerHTML = `
        <input type="radio" name="${q.id}" value="${opt.label}">
        <span class="radio-option-text">${opt.label}</span>
        <span class="radio-reaction"></span>
      `;
      optionsWrap.appendChild(row);
      const input = row.querySelector('input');
      const reactionEl = row.querySelector('.radio-reaction');
      input.addEventListener('change', () => {
        optionsWrap.querySelectorAll('.radio-reaction').forEach(r => r.textContent = '');
        if (opt.reaction) reactionEl.textContent = opt.reaction;
        if (opt.emoji) reactionEl.textContent = opt.emoji;
      });
    });
    field.appendChild(optionsWrap);
    replyForm.appendChild(field);
    return;
  }

  if (q.type === 'spice-radio') {
    field.innerHTML = `<label>${q.label}${q.required ? ' *' : ''}</label>`;
    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'radio-options';
    q.options.forEach(opt => {
      const row = document.createElement('label');
      row.className = 'radio-option';
      row.innerHTML = `
        <input type="radio" name="${q.id}" value="${opt.label}" ${opt.dodge ? 'disabled' : ''}>
        <span class="radio-option-text">${opt.label}</span>
        <span class="radio-reaction"></span>
      `;
      optionsWrap.appendChild(row);
      const input = row.querySelector('input');
      const reactionEl = row.querySelector('.radio-reaction');

      if (opt.dodge) {
        // Evades the cursor on hover/approach, and even if a click or tap
        // lands anyway, it never actually gets selected — it just marks
        // itself unavailable instead.
        let rejected = false;
        row.addEventListener('mouseenter', () => {
          if (rejected) return;
          const dx = (40 + Math.random() * 50) * (Math.random() < 0.5 ? -1 : 1);
          const dy = (Math.random() * 18 - 9).toFixed(1);
          const rot = (Math.random() * 12 - 6).toFixed(1);
          row.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
        });
        row.addEventListener('mouseleave', () => {
          if (!rejected) row.style.transform = '';
        });
        row.addEventListener('click', (e) => {
          e.preventDefault();
          if (rejected) return;
          rejected = true;
          row.classList.add('unavailable');
          row.style.transform = '';
          reactionEl.textContent = opt.unavailableText || 'sorry - unavailable';
        });
      } else {
        input.addEventListener('change', () => {
          optionsWrap.querySelectorAll('.radio-option:not(.unavailable) .radio-reaction')
            .forEach(r => r.textContent = '');
          if (opt.reaction) reactionEl.textContent = opt.reaction;
        });
      }
    });
    field.appendChild(optionsWrap);
    replyForm.appendChild(field);
    return;
  }

  if (q.type === 'yesno-fire') {
    field.innerHTML = `<label>${q.label}${q.required ? ' *' : ''}</label>`;
    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'radio-options radio-options-inline';
    optionsWrap.innerHTML = `
      <label class="radio-option">
        <input type="radio" name="${q.id}" value="No">
        <span class="radio-option-text">No</span>
      </label>
      <label class="radio-option">
        <input type="radio" name="${q.id}" value="Yes">
        <span class="radio-option-text">Yes</span>
        <span class="fire-emojis"></span>
      </label>
    `;
    field.appendChild(optionsWrap);
    replyForm.appendChild(field);

    const yesInput = optionsWrap.querySelector('input[value="Yes"]');
    const noInput = optionsWrap.querySelector('input[value="No"]');
    const fireSpan = optionsWrap.querySelector('.fire-emojis');
    let fireTimers = [];

    function playFires() {
      fireTimers.forEach(t => clearTimeout(t));
      fireTimers = [];
      fireSpan.textContent = '';
      for (let i = 0; i < 3; i++) {
        fireTimers.push(setTimeout(() => { fireSpan.textContent += '🔥'; }, i * 350));
      }
    }
    yesInput.addEventListener('change', () => { if (yesInput.checked) playFires(); });
    noInput.addEventListener('change', () => {
      if (noInput.checked) {
        fireTimers.forEach(t => clearTimeout(t));
        fireTimers = [];
        fireSpan.textContent = '';
      }
    });
    return;
  }
}

GIFT_CONFIG.form.questions.forEach(renderQuestion);

// Info tooltips (the little "i" circles) toggle open on tap, for mobile
// where there's no hover — and close when you tap anywhere else.
replyForm.querySelectorAll('.info-icon').forEach(icon => {
  icon.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = icon.classList.contains('tapped');
    replyForm.querySelectorAll('.info-icon.tapped').forEach(i => i.classList.remove('tapped'));
    if (!isOpen) icon.classList.add('tapped');
  });
});
document.addEventListener('click', () => {
  replyForm.querySelectorAll('.info-icon.tapped').forEach(i => i.classList.remove('tapped'));
});

const submitBtn = document.createElement('button');
submitBtn.type = 'submit';
submitBtn.className = 'btn btn-primary';
submitBtn.textContent = GIFT_CONFIG.form.submitLabel;
submitBtn.style.marginTop = '8px';
replyForm.appendChild(submitBtn);

const formError = document.getElementById('form-error');

replyForm.addEventListener('submit', (e) => {
  e.preventDefault();
  formError.classList.add('hidden');

  const cfg = GIFT_CONFIG.emailjs;

  // Collect answers into a single readable summary + individual fields,
  // matching common EmailJS template variables. Text/textarea questions
  // read straight from their input; every other type (radio-based) reads
  // whichever same-named radio is checked.
  const answers = {};
  const summaryLines = [];
  GIFT_CONFIG.form.questions.forEach(q => {
    let val;
    if (q.type === 'text' || q.type === 'textarea') {
      val = document.getElementById(q.id).value.trim();
    } else {
      const checked = replyForm.querySelector(`input[name="${q.id}"]:checked`);
      val = checked ? checked.value : '';
    }
    answers[q.id] = val;
    summaryLines.push(`${q.label}: ${val || '(no answer)'}`);
  });

  const templateParams = {
    ...answers,
    from_name: answers.name || 'Someone',
    summary: summaryLines.join('\n'),
    opened_count: `${openedItems.size} of ${GIFT_CONFIG.items.length}`
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'sending...';

  emailjs.send(cfg.serviceId, cfg.templateId, templateParams)
    .then(() => {
      document.getElementById('sent-heading').textContent = GIFT_CONFIG.form.sentHeading;
      document.getElementById('sent-body').textContent = GIFT_CONFIG.form.sentBody;
      showScreen(confirmationScreen);
    })
    .catch(err => {
      console.error(err);
      formError.textContent = 'Something went wrong sending this — please try again.';
      formError.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = GIFT_CONFIG.form.submitLabel;
    });
});
