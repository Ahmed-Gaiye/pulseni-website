(function () {
  // Enquiry form: check the required fields, then send to Formspree (the form's action).
  // With no action set, the page says it is in test mode and nothing is sent.
  var form = document.getElementById('enquiry');
  if (!form) return;
  var endpoint = form.getAttribute('action');
  var sendBtn = form.querySelector('.enquiry-send');
  var sendError = document.getElementById('send-error');
  var MESSAGES = {
    name: 'Enter your name.',
    email: 'Enter an email address we can reply to.',
    role: 'Tell us your industry or role.',
    idea: 'Tell us what you would like to build.',
    route: 'Choose how you would like to work with us.'
  };

  if (!endpoint) form.querySelector('.test-mode').hidden = false;

  // Buttons can pre-pick the route: start/?route=prototype | paid | partner | unsure
  var pick = { prototype: 'Start with a 2-week prototype', paid: 'Paid development', partner: 'Explore an equity partnership', unsure: "I'm not sure yet" }[new URLSearchParams(location.search).get('route')];
  if (pick) {
    var r = form.querySelector('[name="route"][value="' + pick + '"]');
    if (r) r.checked = true;
  }

  function setError(name, text) {
    var box = document.getElementById('e-' + name);
    if (box) box.textContent = text || '';
    form.querySelectorAll('[name="' + name + '"]').forEach(function (el) {
      if (text) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    });
  }

  function check() {
    var first = null;
    Object.keys(MESSAGES).forEach(function (name) {
      var el = form.querySelector('[name="' + name + '"]');
      var ok = el.type === 'radio'
        ? !!form.querySelector('[name="' + name + '"]:checked')
        : el.value.trim() !== '' && el.checkValidity();
      setError(name, ok ? '' : MESSAGES[name]);
      if (!ok && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  }

  form.querySelectorAll('input, textarea').forEach(function (el) {
    el.addEventListener(el.type === 'radio' ? 'change' : 'input', function () { setError(el.name, ''); });
  });

  function done() {
    var panel = document.getElementById('enquiry-done');
    var first = form.elements.name.value.trim().split(' ')[0];
    panel.querySelector('.done-name').textContent = first ? ', ' + first : '';
    form.hidden = true;
    panel.hidden = false;
    panel.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    sendError.textContent = '';
    if (!check()) return;
    if (!endpoint) {
      var note = form.querySelector('.test-mode');
      note.textContent = 'Test mode: everything you entered is fine, but nothing was sent because the form isn\'t connected yet.';
      note.setAttribute('role', 'status');
      return;
    }
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending…';
    fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (res) { if (!res.ok) throw new Error('send failed'); done(); })
      .catch(function () {
        sendError.textContent = "Couldn't send. Check your connection and try again, or email hello@pulseni.com.";
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send enquiry';
      });
  });
})();
