# Riyaz Khan — Portfolio

A single-page animated portfolio. No build step, no dependencies.

## Open it
Double-click `index.html`. (Fonts load from Google Fonts when online; it falls back to system fonts offline.)

## Put it online (free)
- **Netlify Drop**: go to app.netlify.com/drop and drag this whole folder in.
- **GitHub Pages / Vercel / Cloudflare Pages** also work — just upload the folder.

## Add your real projects
Open `index.html`, find the `<section id="work">` block. Replace each placeholder `.tile` with:

```html
<a class="tile reveal" href="https://link-to-your-project">
  <img src="assets/my-render.jpg" alt="Project title" />
  <div class="tile__info"><b>Project title</b><span>Maya · 3D Modeling</span></div>
</a>
```

Put your images in the `assets/` folder. Delete the "Projects are loading…" note line when done.

## Change colours
Edit the variables at the top of `style.css` (`--accent`, `--violet`, `--paper`, `--ink`).

## Files
- `index.html` — content
- `style.css` — design + animations
- `script.js` — loader, 3D wireframe, scroll reveals, cursor, tilt
- `assets/` — your photo and resume PDF
