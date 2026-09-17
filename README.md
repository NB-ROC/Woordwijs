# Woordwijs

Woordwijs is een woordenspel voor studenten van ROC Nijmegen. Een student krijgt
een woord te zien en legt uit wat het betekent. Docenten zien op de admin-pagina
per student de streak en alle gegeven antwoorden.

Het project bestaat uit twee onderdelen die **dezelfde Firebase-database en
hetzelfde account** gebruiken:

| Onderdeel | Map | Wat het doet |
|---|---|---|
| Website | `src/` | Inloggen, woorden uitleggen, admin-pagina en woordenbeheer |
| Chrome-extensie | `extension/woorden-oefening/` | Geeft met een instelbaar interval een pop-up met een woord om uit te leggen |

Een antwoord in de extensie telt dus precies zo mee als een antwoord op de website.

## Techniek

- [React 19](https://react.dev/) + [React Router](https://reactrouter.com/)
- [Vite](https://vite.dev/) (bouwt zowel de website als de extensie)
- [Firebase](https://firebase.google.com/): Authentication (email + wachtwoord) en Firestore
- Chrome-extensie op Manifest V3
- Gewone CSS in de ROC-huisstijl (`src/index.css`), lettertype Montserrat

## Aan de slag

Vereist: [Node.js](https://nodejs.org/) 20 of nieuwer.

```bash
npm install
npm run dev
```

De website draait dan op http://localhost:5173.

### Alle commando's

| Commando | Wat het doet |
|---|---|
| `npm run dev` | Start de website lokaal |
| `npm run build` | Bouwt de website naar `dist/` |
| `npm run preview` | Bekijkt de gebouwde website lokaal |
| `npm run build:extension` | Bouwt de Chrome-extensie naar `dist-extension/` |
| `npm run lint` | Controleert de code met ESLint |
| `node setAdmin.cjs <email>` | Geeft een gebruiker de admin-rol (zie [Admin maken](#admin-maken)) |
| `node uploadWords.js` | Zet de woordenlijst uit dat bestand in Firestore |

## Website

| Pagina | Wie | Wat |
|---|---|---|
| `/` | iedereen | Inloggen |
| `/game` | ingelogd | "Leg het volgende woord uit": typ een beschrijving en druk op Enter (Shift+Enter voor een nieuwe regel) |
| `/admin` | admin | Tabel met alle studenten en hun streak. Klik op een student om diens woorden en antwoorden te zien |
| `/admin/woorden` | admin | Woorden toevoegen, bewerken en verwijderen |

Via de knop **Mijn ROC** rechtsboven kom je bij Oefenen, Admin, Woorden beheren
en Uitloggen.

## Chrome-extensie

### Installeren

1. Bouw de extensie:
   ```bash
   npm run build:extension
   ```
2. Ga in Chrome naar `chrome://extensions` en zet rechtsboven **Ontwikkelaarsmodus** aan.
3. Klik op **Uitgepakte extensie laden** en kies de map `dist-extension/`.
4. Direct na het installeren opent het oefenvenster: log daar in met je
   Woordwijs-account. Later kan dat ook via het extensie-icoon (puzzelstukje in
   de werkbalk → Woordwijs Oefening; klik op de punaise om hem vast te zetten).

Na een wijziging in de code: opnieuw `npm run build:extension` en in
`chrome://extensions` bij de extensie op **Herladen** klikken.

> De extensie moet altijd eerst gebouwd worden. Chrome-extensies mogen geen
> externe scripts laden, dus Vite bundelt de Firebase-SDK en de gedeelde code
> uit `src/` mee. Daarbij wordt `firebase/auth` vervangen door
> `firebase/auth/web-extension`: de gewone versie laadt scripts van
> `apis.google.com`, waardoor inloggen in een extensie niet werkt.

### Gebruik

Klik op het extensie-icoon voor het menu:

- **Streak en coins** van je account
- **Oefen nu** opent meteen het oefenvenster
- **Hoe vaak een pop-up?** van elke 10 minuten tot 1x per dag
- **Laatste antwoorden** en **Uitloggen**

Op het ingestelde interval opent het oefenvenster vanzelf, met een melding.

### Hoe het werkt

| Bestand | Rol |
|---|---|
| `public/manifest.json` | Manifest V3: rechten `alarms`, `notifications`, `storage` |
| `public/background.js` | Service worker: timer (`chrome.alarms`) die het oefenvenster opent |
| `popup.html/js/css` | Menu onder het extensie-icoon: login, streak, coins, instellingen |
| `oefening.html/js/css` | Oefenvenster, zelfde spel als `/game`; toont een inlogformulier als je niet bent ingelogd |
| `login.js` | Inlogformulier, gedeeld door popup en oefenvenster |
| `vite.config.js` | Bouwt de extensie naar `dist-extension/` en gebruikt `firebase/auth/web-extension` |

`popup.js` en `oefening.js` importeren `src/firebase.js` en
`src/services/wordService.js`, dus de spellogica staat maar op één plek. Alleen
het pop-up-interval wordt lokaal opgeslagen (`chrome.storage.local`).

## Spelregels

- **Nakijken:** een antwoord is goed als een van de beschrijvingen van het woord
  erin voorkomt (hoofdletters maken niet uit). Voorbeeld: bij het woord
  *aanvaarden* met beschrijvingen `accepteren`, `goedkeuren` is
  "iets accepteren wat je krijgt" goed.
- **Eén poging per woord:** daarna zie je het juiste antwoord en komt het volgende woord.
- **Coins:** 10 per goed antwoord.
- **Streak:** het aantal dagen achter elkaar dat een student minstens één antwoord
  heeft gegeven. Wie vandaag of gisteren nog heeft geoefend, houdt zijn streak;
  anders telt hij als 0.

## Firebase

De configuratie staat in `src/firebase.js`. Alle lees- en schrijfacties lopen via
`src/services/wordService.js`.

### Datamodel (Firestore)

```
Words/{id}
  word: string
  descriptions: string[]

users/{uid}
  name: string          # displayName of email
  email: string
  coins: number
  streak: number
  lastPlayed: string    # "YYYY-MM-DD", laatste dag met een antwoord

users/{uid}/history/{id}
  word: string
  answer: string
  correct: boolean
  createdAt: timestamp
```

`users/{uid}` wordt bijgewerkt bij elke login. Een student verschijnt dus pas op
de admin-pagina nadat die een keer heeft ingelogd.

### Admin maken

Admins worden herkend aan de custom claim `admin: true` op hun Firebase-account.

1. Download in de Firebase Console een service-account-sleutel
   (Projectinstellingen → Serviceaccounts) en zet die als
   `serviceAccountKey.json` in de projectroot. **Commit dit bestand nooit**; het
   staat in `.gitignore`.
2. Voer uit:
   ```bash
   node setAdmin.cjs naam@voorbeeld.nl
   ```
3. De gebruiker moet opnieuw inloggen.

### Firestore-regels

De admin-pagina leest de `users`-documenten en de geschiedenis van **alle**
studenten. De Firestore-regels moeten dat toestaan voor gebruikers met
`request.auth.token.admin == true`. Blijft de admin-pagina leeg, controleer dan
eerst de regels in de Firebase Console.

## Projectstructuur

```
index.html                  startpagina van de website
setAdmin.cjs                admin-rol toekennen
uploadWords.js              woordenlijst naar Firestore
public/                     favicon
src/
  main.jsx                  start van de React-app
  App.jsx                   routes
  index.css                 alle styling (ROC-huisstijl)
  firebase.js               Firebase-configuratie
  services/wordService.js   alle Firestore-logica (ook gebruikt door de extensie)
  auth/                     login, AuthContext, beveiligde routes
  components/Header.jsx     header met "Mijn ROC"-menu
  game/game.jsx             het spel
  admin/admin.jsx           studentenoverzicht met streaks
  admin/words.jsx           woordenbeheer
  img/                      ROC-logo
extension/woorden-oefening/
  popup.*                   menu onder het extensie-icoon
  oefening.*                het oefenvenster
  public/                   manifest, background.js, iconen
  vite.config.js            build-instellingen van de extensie
```

## Licentie

Alleen voor educatief gebruik.
