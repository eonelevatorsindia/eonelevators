# EON Elevators

Website for EON Elevators, Visakhapatnam: lifts, elevator doors and generators.

Live site: https://eon-elevators.vercel.app

## Structure

- `index.html` – the page
- `assets/css/style.css` – styles
- `assets/js/main.js` – menu, door filters, photo viewer, enquiry form
- `assets/img/` – images

It is a static site with no build step. Open `index.html` in a browser to preview it.

## Adding door photos

Each door's main photo is `assets/img/<door>.jpg`, and extra photos are `<door>-2.jpg`, `<door>-3.jpg`, and so on.
To add one, save the next numbered file and raise that door's `data-count` in `index.html`.
