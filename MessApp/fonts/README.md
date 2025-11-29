# Fonts for MessApp

Place web font files (WOFF/WOFF2/TTF) in this folder and reference them from `style/general.css`.

Example CSS (put in `MessApp/style/general.css`):

```css
@font-face {
  font-family: 'MyFont';
  src: url('../fonts/myfont.woff2') format('woff2'),
       url('../fonts/myfont.woff') format('woff');
  font-weight: 400 700;
  font-style: normal;
  font-display: swap;
}

body {
  font-family: 'MyFont', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}
```

Notes:
- Use `font-display: swap` to avoid invisible text while fonts load.
- Prefer WOFF2 for modern browsers, include WOFF fallback as needed.
- Keep file names short and lowercase for cross-platform compatibility.
