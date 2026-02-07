# Google Apps Script – AirAI CDN Proxy

Deploy this as a Google Apps Script **Web App** to serve the site through Google's servers.

## Setup

1. Go to [script.google.com](https://script.google.com) → **New project**
2. Replace the default code with the code below
3. Update `GITHUB_PAGES` and `JSDELIVR_CDN` if your repo changes
4. **Deploy → New deployment → Web app → Anyone → Deploy**
5. Copy the deployed URL

> **Re-deploying:** Deploy → Manage deployments → ✏️ pencil → Version: **New version** → Deploy

---

## code.gs

```javascript
var GITHUB_PAGES = 'https://kodymcmonagle808-cmd.github.io/airai-chat-app/';
var JSDELIVR_CDN = 'https://cdn.jsdelivr.net/gh/kodymcmonagle808-cmd/airai-chat-app@main/';

function doGet(e) {
  // Default straight to login.html (skip index.html — it's just the cloaking launcher)
  var page = e.parameter.p || 'login.html';

  // External fetch for proxy page
  if (e.parameter.fetch) {
    try {
      var extResp = UrlFetchApp.fetch(e.parameter.fetch, {
        muteHttpExceptions: true,
        followRedirects: true
      });
      var extHtml = extResp.getContentText();
      return HtmlService.createHtmlOutput(extHtml)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    } catch (err) {
      return HtmlService.createHtmlOutput('<h1>Error fetching URL</h1><p>' + err.message + '</p>');
    }
  }

  var scriptUrl = ScriptApp.getService().getUrl();
  var loaderHtml = '<!DOCTYPE html><html><head>'
    + '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">'
    + '<style>'
    + '*{margin:0;padding:0;box-sizing:border-box;}'
    + 'body{background:#fafbfc;display:flex;align-items:center;justify-content:center;height:100vh;font-family:"Inter",system-ui,-apple-system,sans-serif;}'
    + '.loader-wrap{text-align:center;}'
    + '.spinner{width:40px;height:40px;margin:0 auto 20px;border:3px solid #e5e7eb;border-top-color:#2563eb;border-radius:50%;animation:spin .8s linear infinite;}'
    + '@keyframes spin{to{transform:rotate(360deg)}}'
    + '.ld{color:#374151;font-size:1rem;font-weight:500;letter-spacing:.01em;}'
    + '.sub{color:#9ca3af;font-size:.8rem;margin-top:6px;}'
    + '</style>'
    + '</head><body><div class="loader-wrap"><div class="spinner"></div><div class="ld">Loading Math Notes</div><div class="sub">Please wait…</div></div>'
    + '<script>'
    + 'google.script.run.withSuccessHandler(function(html){'
    + '  document.open();document.write(html);document.close();'
    + '}).getPage("' + page + '");'
    + '</script></body></html>';

  return HtmlService.createHtmlOutput(loaderHtml)
    .setTitle('Math Notes')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getPage(page) {
  var scriptUrl = ScriptApp.getService().getUrl();
  var url = GITHUB_PAGES + page;
  var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  var html = resp.getContentText();

  // Inject PROXY_BASE variable FIRST (other code checks for it)
  var proxyScript = '<script>var PROXY_BASE = "' + scriptUrl + '";</script>';
  html = html.replace('<head>', '<head>' + proxyScript);

  // Inject <base href> for CSS / images / fonts from jsDelivr
  html = html.replace('<head>' + proxyScript, '<head>' + proxyScript + '<base href="' + JSDELIVR_CDN + '">');

  // Disable the fish-movement about:blank cloaking in login.html
  // (We're already proxied through Google, no need to cloak)
  // This injects an early-return so the fishCloakDetector no-ops.
  // Does NOT affect about:blank in proxys.html, links.html, unblocked-games.html
  html = html.replace(
    '(function fishCloakDetector() {',
    '(function fishCloakDetector() { if(typeof PROXY_BASE!=="undefined") return;'
  );

  // Rewrite iframe.src = 'page.html' → top.location.href = 'SCRIPT?p=page.html'
  // Uses top.location so navigation escapes Google's HtmlService sandbox iframe
  html = html.replace(
    /iframe\.src\s*=\s*'([^']+\.html)(\?[^']*)?' /g,
    function(match, file, query) {
      var sep = '?p=' + file;
      if (query) sep += '&' + query.substring(1);
      return "top.location.href = '" + scriptUrl + sep + "' ";
    }
  );

  // Rewrite iframe.src = "page.html" (double quotes)
  html = html.replace(
    /iframe\.src\s*=\s*"([^"]+\.html)(\?[^"]*)?"/g,
    function(match, file, query) {
      var sep = '?p=' + file;
      if (query) sep += '&' + query.substring(1);
      return 'top.location.href = "' + scriptUrl + sep + '" ';
    }
  );

  // Rewrite window.location.href = 'page.html' → top.location.href (single quotes)
  html = html.replace(
    /window\.location\.href\s*=\s*'([^']+\.html[^']*)'/g,
    function(match, target) {
      if (target.indexOf('http') === 0) return match;
      var hasQuery = target.indexOf('?');
      if (hasQuery > -1) {
        var file = target.substring(0, hasQuery);
        var qs = target.substring(hasQuery + 1);
        return "top.location.href = '" + scriptUrl + "?p=" + file + "&" + qs + "'";
      }
      return "top.location.href = '" + scriptUrl + "?p=" + target + "'";
    }
  );

  // Rewrite window.location.href = "page.html" → top.location.href (double quotes)
  html = html.replace(
    /window\.location\.href\s*=\s*"([^"]+\.html[^"]*)"/g,
    function(match, target) {
      if (target.indexOf('http') === 0) return match;
      var hasQuery = target.indexOf('?');
      if (hasQuery > -1) {
        var file = target.substring(0, hasQuery);
        var qs = target.substring(hasQuery + 1);
        return 'top.location.href = "' + scriptUrl + '?p=' + file + '&' + qs + '"';
      }
      return 'top.location.href = "' + scriptUrl + '?p=' + target + '"';
    }
  );

  // Safety-net: intercept clicks on any remaining .html links
  var clickInterceptor = '<script>'
    + 'document.addEventListener("click", function(e) {'
    + '  var a = e.target.closest("a");'
    + '  if (a && a.href && a.href.indexOf(".html") > -1 && a.href.indexOf("' + scriptUrl + '") === -1) {'
    + '    e.preventDefault();'
    + '    var file = a.href.split("/").pop();'
    + '    top.location.href = "' + scriptUrl + '?p=" + file;'
    + '  }'
    + '});'
    + '</script>';
  var bodyCloseIndex = html.toLowerCase().lastIndexOf('</body>');
  if (bodyCloseIndex > -1) {
    html = html.slice(0, bodyCloseIndex) + clickInterceptor + html.slice(bodyCloseIndex);
  } else {
    html += clickInterceptor;
  }

  // Inline Google Fonts (fetch CSS so fonts load without external stylesheet request)
  html = html.replace(
    /<link[^>]+href=["'](https:\/\/fonts\.googleapis\.com\/css2[^"']+)["'][^>]*>/g,
    function(match, fontUrl) {
      try {
        var fontCss = UrlFetchApp.fetch(fontUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }).getContentText();
        return '<style>' + fontCss + '</style>';
      } catch (e) {
        return match;
      }
    }
  );

  return html;
}

function fetchExternal(url) {
  try {
    var resp = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return resp.getContentText();
  } catch (e) {
    return '<h1>Error</h1><p>' + e.message + '</p>';
  }
}
```
