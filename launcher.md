# Launcher

Save this as an `.html` file and open it in a browser. Click the button to launch.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Math Notes</title>
  <style>
    body { margin:0; background:#0a1f0a; display:flex; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif; }
    button { background:linear-gradient(135deg,#2e7d32,#1b5e20); color:#c8e6c9; border:none; padding:16px 40px; border-radius:12px; font-size:18px; font-weight:700; cursor:pointer; transition:transform .15s,box-shadow .15s; box-shadow:0 4px 20px rgba(46,125,50,0.4); }
    button:hover { transform:scale(1.05); box-shadow:0 6px 28px rgba(46,125,50,0.6); }
    button:active { transform:scale(0.97); }
  </style>
</head>
<body>
  <button onclick="launch()">Open AirAI</button>
  <script>
    function launch(){
      var win=window.open('about:blank','_blank');
      if(win){
        win.document.title='Math Notes';
        win.document.body.style.cssText='margin:0;height:100vh;overflow:hidden;background:#0a1f0a';
        var f=win.document.createElement('iframe');
        f.style.cssText='border:none;width:100%;height:100%;position:fixed;top:0;left:0';
        f.src='https://script.google.com/macros/s/AKfycbwvxQazVIgFhaK3NMmuXJ5hv2BD7aX-ZqnTXsvwnyeGhv3C4aR-B4kkx2WjuQz93Z--/exec';
        win.document.body.appendChild(f);
      }
    }
  </script>
</body>
</html>
```
