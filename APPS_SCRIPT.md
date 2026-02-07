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
  var page = e.parameter.p || 'index.html';

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
    + '<style>body{margin:0;background:#0a0a0a;display:flex;align-items:center;justify-content:center;height:100vh;}'
    + '.ld{color:#4fffb0;font-family:monospace;font-size:1.4rem;}</style>'
    + '</head><body><div class="ld">Loading AirAI...</div>'
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

  // Inject <base href> for CSS / images / fonts from jsDelivr
  html = html.replace('<head>', '<head><base href="' + JSDELIVR_CDN + '">');

  // Disable about:blank cloaking redirect (we're already proxied)
  html = html.replace(/window\.open\s*\(\s*['"]about:blank['"]/g,
    '/* cloaking disabled */ void(0 && window.open("about:blank"');

  // Rewrite iframe.src = 'page.html' → window.location.href = 'SCRIPT?p=page.html'
  html = html.replace(
    /iframe\.src\s*=\s*'([^']+\.html)(\?[^']*)?' /g,
    function(match, file, query) {
      var sep = '?p=' + file;
      if (query) sep += '&' + query.substring(1);
      return "window.location.href = '" + scriptUrl + sep + "' ";
    }
  );

  // Rewrite iframe.src = "page.html" (double quotes)
  html = html.replace(
    /iframe\.src\s*=\s*"([^"]+\.html)(\?[^"]*)?" /g,
    function(match, file, query) {
      var sep = '?p=' + file;
      if (query) sep += '&' + query.substring(1);
      return 'window.location.href = "' + scriptUrl + sep + '" ';
    }
  );

  // Rewrite window.location.href = 'page.html' (single quotes)
  html = html.replace(
    /window\.location\.href\s*=\s*'([^']+\.html[^']*)'/g,
    function(match, target) {
      if (target.indexOf('http') === 0) return match;
      var hasQuery = target.indexOf('?');
      if (hasQuery > -1) {
        var file = target.substring(0, hasQuery);
        var qs = target.substring(hasQuery + 1);
        return "window.location.href = '" + scriptUrl + "?p=" + file + "&" + qs + "'";
      }
      return "window.location.href = '" + scriptUrl + "?p=" + target + "'";
    }
  );

  // Rewrite window.location.href = "page.html" (double quotes)
  html = html.replace(
    /window\.location\.href\s*=\s*"([^"]+\.html[^"]*)"/g,
    function(match, target) {
      if (target.indexOf('http') === 0) return match;
      var hasQuery = target.indexOf('?');
      if (hasQuery > -1) {
        var file = target.substring(0, hasQuery);
        var qs = target.substring(hasQuery + 1);
        return 'window.location.href = "' + scriptUrl + '?p=' + file + '&' + qs + '"';
      }
      return 'window.location.href = "' + scriptUrl + '?p=' + target + '"';
    }
  );

  // Safety-net: intercept clicks on any remaining .html links
  var clickInterceptor = '<script>'
    + 'document.addEventListener("click", function(e) {'
    + '  var a = e.target.closest("a");'
    + '  if (a && a.href && a.href.indexOf(".html") > -1 && a.href.indexOf("' + scriptUrl + '") === -1) {'
    + '    e.preventDefault();'
    + '    var file = a.href.split("/").pop();'
    + '    window.location.href = "' + scriptUrl + '?p=" + file;'
    + '  }'
    + '});'
    + '</script>';
  html = html.replace('</body>', clickInterceptor + '</body>');

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

  // Inject PROXY_BASE variable so proxy page can use it
  var proxyScript = '<script>var PROXY_BASE = "' + scriptUrl + '";</script>';
  html = html.replace('<head>', '<head>' + proxyScript);

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
