import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

// Bouwt de extensie als een kleine multi-page app: popup.html en
// oefening.html zijn de entrypoints, hun <script type="module"> imports
// (incl. de Firebase SDK en de gedeelde src/services/wordService.js van de
// website) worden gebundeld naar dist-extension/. Statische bestanden
// (manifest.json, background.js, icons) staan in public/ en worden
// ongewijzigd meegekopieerd.
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  // Relatieve paden i.p.v. absolute ("/assets/...") — een uitgepakte
  // Chrome-extensie heeft geen webserver-root, dus root-relatieve paden
  // zijn onbetrouwbaar.
  base: "./",
  resolve: {
    alias: [
      // De gewone Firebase-login laadt scripts van apis.google.com, wat
      // Chrome in extensies blokkeert (Manifest V3). De web-extension-build
      // doet dat niet. Dit geldt ook voor de gedeelde src/firebase.js.
      { find: /^firebase\/auth$/, replacement: "firebase/auth/web-extension" },
    ],
  },
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  build: {
    outDir: fileURLToPath(new URL("../../dist-extension", import.meta.url)),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: fileURLToPath(new URL("./popup.html", import.meta.url)),
        oefening: fileURLToPath(new URL("./oefening.html", import.meta.url)),
      },
    },
  },
});
