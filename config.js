/*  AirAI – Shared Config
    Edit version / cloak defaults here. Every page pulls from this file. */

var APP_VERSION = 'v2.2.5';

/* ── Panic / Tab-Cloak System ────────────────────────────── */
var _panicActive = false;
var _panicPopHandler = null;

function panicEngage() {
  if (_panicActive) return;
  _panicActive = true;
  var els = document.body.children;
  for (var i = 0; i < els.length; i++) {
    if (els[i].className !== 'panic-cover') {
      els[i].setAttribute('data-ph', els[i].style.display || '');
      els[i].style.display = 'none';
    }
  }
  var f = document.createElement('iframe');
  f.className = 'panic-cover';
  f.src = localStorage.getItem('airai_cloakUrl') || 'https://www.hcpss.me/';
  f.style.cssText = 'border:none;width:100vw;height:100vh;position:fixed;top:0;left:0;z-index:999999;background:#fff;';
  document.body.appendChild(f);
  document.title = localStorage.getItem('airai_cloakTitle') || 'HCPSS';
  history.pushState(null, '', window.location.href);
  _panicPopHandler = function () { history.pushState(null, '', window.location.href); };
  window.addEventListener('popstate', _panicPopHandler);
}

function panicDisengage() {
  if (!_panicActive) return;
  var c = document.querySelector('.panic-cover');
  if (c) c.remove();
  var els = document.querySelectorAll('[data-ph]');
  for (var i = 0; i < els.length; i++) {
    els[i].style.display = els[i].getAttribute('data-ph');
    els[i].removeAttribute('data-ph');
  }
  document.title = localStorage.getItem('airai_cloakRestoreTitle') || 'Math Notes';
  if (_panicPopHandler) {
    window.removeEventListener('popstate', _panicPopHandler);
    _panicPopHandler = null;
  }
  _panicActive = false;
}

/* ── Panic-key listener (? to engage, / to disengage) ──── */
document.addEventListener('keydown', function (e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.key === '?' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); panicEngage(); }
  if (e.key === '/' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); panicDisengage(); }
});

/* ── Auto-populate version badges ──────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  var els = document.querySelectorAll('[data-version]');
  for (var i = 0; i < els.length; i++) {
    els[i].textContent = APP_VERSION;
  }
});
