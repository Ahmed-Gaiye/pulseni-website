(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Hero story: plays once when it comes into view, with a replay button ----------
  var story = document.getElementById('story');
  var replay = story && story.querySelector('.replay');
  if (story && !reduce) {
    if ('IntersectionObserver' in window) {
      var seen = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { story.classList.add('run'); seen.disconnect(); }
      }, { threshold: 0.4 });
      seen.observe(story);
    } else {
      story.classList.add('run');
    }
  }
  if (replay && !reduce) {
    replay.hidden = false;
    replay.addEventListener('click', function () {
      story.classList.remove('run');
      void story.offsetWidth; // restart the CSS animations
      story.classList.add('run');
    });
  }

  // ---------- Two routes: the small card animations play once when the section comes into view ----------
  var routes = document.getElementById('routes');
  if (routes && !reduce) {
    if ('IntersectionObserver' in window) {
      var routesSeen = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { routes.classList.add('in-view'); routesSeen.disconnect(); }
      }, { threshold: 0.25 });
      routesSeen.observe(routes.querySelector('.route-grid'));
    } else {
      routes.classList.add('in-view');
    }
  }

  // ---------- How we work: plays the four steps in turn while on screen; tap a step to jump; pause button ----------
  var journey = document.querySelector('.journey');
  var stage = document.querySelector('.j-stage');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.j-steps li'));
  var toggle = document.querySelector('.j-toggle');
  if (journey && stage && steps.length) {
    var current = 0;
    var show = function (n) {
      current = (n + steps.length) % steps.length;
      stage.setAttribute('data-step', String(current + 1));
      steps.forEach(function (li, k) {
        li.classList.remove('on');
        if (k === current) { void li.offsetWidth; li.classList.add('on'); } // restart its progress bar
        li.querySelector('button').setAttribute('aria-current', k === current ? 'step' : 'false');
      });
    };
    steps.forEach(function (li, k) {
      li.querySelector('button').addEventListener('click', function () { show(k); });
      li.querySelector('.j-bar i').addEventListener('animationend', function () { show(current + 1); });
    });
    show(0);
    if (!reduce) {
      journey.classList.add('auto', 'offscreen');
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          journey.classList.toggle('offscreen', !entries[0].isIntersecting);
        }, { threshold: 0.35 }).observe(stage);
      } else {
        journey.classList.remove('offscreen');
      }
      if (toggle) {
        toggle.hidden = false;
        toggle.addEventListener('click', function () {
          var paused = journey.classList.toggle('paused');
          toggle.classList.toggle('is-paused', paused);
          toggle.querySelector('span').textContent = paused ? 'Play' : 'Pause';
        });
      }
    }
  }

  // ---------- App screens: slide through each product's screens ----------
  // Moves only while it is on screen and not paused; the button stops it for good.
  document.querySelectorAll('[data-autoplay]').forEach(function (box) {
    var imgs = box.children; // phone screenshots, or the views of a browser mock-up
    var button = box.closest('.stage') && box.closest('.stage').querySelector('.play');
    if (reduce || imgs.length < 2) return;
    var i = 0, paused = false, onScreen = true;
    if (button) {
      button.hidden = false;
      button.addEventListener('click', function () {
        paused = !paused;
        button.classList.toggle('paused', paused);
        button.setAttribute('aria-label', paused ? 'Play the app screens' : 'Pause the app screens');
      });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { onScreen = entries[0].isIntersecting; }, { threshold: 0.5 }).observe(box);
    }
    setInterval(function () {
      if (paused || !onScreen || document.hidden) return;
      i = (i + 1) % imgs.length;
      box.style.setProperty('--i', i);
    }, 3400);
  });

  // ---------- Prices in pounds, dollars or euros ----------
  // Picks a sensible currency from the browser's language; the visitor's choice is remembered on this device.
  var amounts = document.querySelectorAll('.amt');
  var curButtons = document.querySelectorAll('[data-cur]');
  if (amounts.length) {
    var setCur = function (c) {
      amounts.forEach(function (a) { a.textContent = a.getAttribute('data-' + c); });
      curButtons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cur') === c ? 'true' : 'false'); });
    };
    var saved = null;
    try { saved = localStorage.getItem('pulseni-cur'); } catch (e) {}
    var lang = (navigator.language || '').toLowerCase();
    var guess = 'gbp';
    if (/^en-(us|ca|au|nz|sg|in)$/.test(lang)) guess = 'usd';
    else if (lang === 'en-ie' || /^(de|fr|es|it|nl|pt|fi|el|sk|sl|et|lv|lt)(-|$)/.test(lang)) guess = 'eur';
    setCur(['gbp', 'usd', 'eur'].indexOf(saved) > -1 ? saved : guess);
    curButtons.forEach(function (b) {
      b.addEventListener('click', function () {
        var c = b.getAttribute('data-cur');
        setCur(c);
        try { localStorage.setItem('pulseni-cur', c); } catch (e) {}
      });
    });
  }

  // ---------- Gentle entrance as sections scroll into view ----------
  var targets = Array.prototype.slice.call(document.querySelectorAll(
    'main .label, main h2:not(.article h2):not(.post-card h2), main .intro, .examples li, .route-help, .faq-section .faq, .about p, .contact-card'));
  targets.forEach(function (el) {
    el.classList.add('reveal');
    if (el.matches('.examples li, .faq-section .faq')) {
      var idx = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.setProperty('--d', Math.min(idx, 5) * 80 + 'ms');
    }
  });
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  targets.forEach(function (el) { io.observe(el); });
})();
