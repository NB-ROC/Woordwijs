// uploadWords.js
import { collection, writeBatch, doc } from "firebase/firestore";
import { db } from "./src/firebase.js"; // Zorg dat dit correct naar jouw firebase config verwijst

const woorden = [
  {
    word: "aangeven",
    descriptions: ["melden", "aanwijzen", "duidelijk maken"],
  },
  {
    word: "aantasten",
    descriptions: ["beschadigen", "beïnvloeden", "verminderen"],
  },
  { word: "aantreffen", descriptions: ["vinden", "tegenkomen", "ontdekken"] },
  {
    word: "aanvaarden",
    descriptions: ["accepteren", "goedkeuren", "aannemen"],
  },
  {
    word: "aanvankelijk",
    descriptions: ["eerst", "in het begin", "oorspronkelijk"],
  },
  { word: "achten", descriptions: ["denken", "menen", "beschouwen"] },
  {
    word: "achtereenvolgens",
    descriptions: ["na elkaar", "opeenvolgend", "in volgorde"],
  },
  {
    word: "achterhalen",
    descriptions: ["ontdekken", "te weten komen", "opsporen"],
  },
  {
    word: "afhankelijk zijn van",
    descriptions: ["niet zelfstandig", "steunen op", "vertrouwen op"],
  },
  { word: "afnemen", descriptions: ["verminderen", "kleiner worden", "dalen"] },
  {
    word: "anderzijds",
    descriptions: ["aan de andere kant", "daarentegen", "tegenovergesteld"],
  },
  {
    word: "baseren op",
    descriptions: ["steunen op", "gronden op", "ondersteunen met"],
  },
  {
    word: "beheersen",
    descriptions: ["de macht hebben over", "kunnen", "onder controle hebben"],
  },
  { word: "behoorlijk", descriptions: ["tamelijk", "redelijk", "vrij"] },
  {
    word: "behoren tot/bij",
    descriptions: ["deel uitmaken van", "erbij horen", "aangesloten zijn"],
  },
  { word: "beïnvloeden", descriptions: ["effect hebben op", "sturen"] },
  { word: "beoordelen", descriptions: ["een mening vormen", "evalueren"] },
  {
    word: "beschikken over",
    descriptions: ["in bezit hebben", "kunnen gebruiken", "beschikbaar zijn"],
  },
  { word: "beschouwen", descriptions: ["zien als", "bekijken", "beoordelen"] },
  {
    word: "beseffen",
    descriptions: ["zich bewust zijn van", "realiseren", "begrijpen"],
  },
  {
    word: "bestemd zijn voor",
    descriptions: ["bedoeld voor", "toegewezen aan", "voorbestemd"],
  },
  { word: "betrekkelijk", descriptions: ["relatief", "redelijk", "tamelijk"] },
  {
    word: "betrekking hebben op",
    descriptions: ["te maken hebben met", "verband houden met"],
  },
  { word: "bevatten", descriptions: ["in zich hebben", "omvatten"] },
  { word: "blijken", descriptions: ["duidelijk worden", "zichtbaar zijn"] },
  { word: "bovendien", descriptions: ["daarnaast", "ook nog", "verder"] },
  {
    word: "conclusie",
    descriptions: ["besluit", "eindresultaat", "samenvatting"],
  },
  { word: "conflict", descriptions: ["ruzie", "meningsverschil", "strijd"] },
  { word: "consequentie", descriptions: ["gevolg", "resultaat", "uitkomst"] },
  { word: "constateren", descriptions: ["vaststellen", "opmerken"] },
  { word: "dankzij", descriptions: ["door", "vanwege", "als gevolg van"] },
  {
    word: "desnoods",
    descriptions: ["indien nodig", "zo nodig", "in geval van nood"],
  },
  { word: "dikwijls", descriptions: ["vaak", "regelmatig", "veelvuldig"] },
  { word: "diverse", descriptions: ["verschillende", "meerdere", "allerlei"] },
  { word: "een gebrek aan", descriptions: ["tekort", "niet genoeg"] },
  { word: "effect", descriptions: ["gevolg", "uitwerking", "resultaat"] },
  { word: "elders", descriptions: ["ergens anders", "op een andere plaats"] },
  { word: "eventueel", descriptions: ["mogelijk", "misschien"] },
  { word: "factor", descriptions: ["oorzaak", "element", "omstandigheid"] },
  { word: "functie", descriptions: ["taak", "rol", "doel"] },
  { word: "gebruiken", descriptions: ["toepassen", "benutten"] },
  { word: "geleidelijk", descriptions: ["langzaam", "stap voor stap"] },
  { word: "gering", descriptions: ["klein", "weinig", "minimaal"] },
  { word: "globaal", descriptions: ["in grote lijnen", "algemeen"] },
  { word: "grondig", descriptions: ["volledig", "nauwkeurig", "diepgaand"] },
  { word: "gunstig", descriptions: ["voordelig", "positief", "aantrekkelijk"] },
  { word: "hoogstens", descriptions: ["maximaal", "niet meer dan"] },
  { word: "immers", descriptions: ["namelijk", "want"] },
  { word: "informatie", descriptions: ["gegevens", "kennis", "feiten"] },
  {
    word: "intensief",
    descriptions: ["krachtig", "geconcentreerd", "grondig"],
  },
  { word: "leiden tot", descriptions: ["resulteren in", "veroorzaken"] },
  { word: "maatregel", descriptions: ["actie", "regeling", "handeling"] },
  { word: "nauwelijks", descriptions: ["bijna niet", "amper"] },
  { word: "nuttig", descriptions: ["handig", "bruikbaar", "zinvol"] },
  { word: "ondanks", descriptions: ["toch", "hoewel"] },
  { word: "ontstaan", descriptions: ["beginnen", "opkomen"] },
  { word: "oorzaak", descriptions: ["reden", "aanleiding", "bron"] },
  { word: "overbodig", descriptions: ["niet nodig", "onnodig"] },
  { word: "overzichtelijk", descriptions: ["duidelijk", "geordend", "helder"] },
  { word: "resultaat", descriptions: ["uitkomst", "gevolg", "effect"] },
  { word: "risico lopen", descriptions: ["gevaar lopen", "kans hebben op"] },
  { word: "streven naar", descriptions: ["nastreven", "proberen te bereiken"] },
  { word: "uiteraard", descriptions: ["natuurlijk", "vanzelfsprekend"] },
  { word: "uniek", descriptions: ["enig", "bijzonder", "speciaal"] },
  { word: "variëren", descriptions: ["verschillen", "afwisselen"] },
  { word: "vaststellen", descriptions: ["bepalen", "constateren"] },
  { word: "veroorzaken", descriptions: ["leiden tot", "de oorzaak zijn van"] },
  { word: "volkomen", descriptions: ["volledig", "helemaal", "compleet"] },
  { word: "vrijwel", descriptions: ["bijna", "nagenoeg"] },
  { word: "zowel... als", descriptions: ["én... én...", "beide"] },
];

// Functie om de woorden te uploaden
async function uploadWoorden() {
  try {
    const batch = writeBatch(db);
    const ref = collection(db, "Words"); // Collection heet "Words" zoals je wilt

    woorden.forEach((item) => {
      // Vervang "/" in document-ID om fouten te voorkomen
      const safeId = item.word.replace(/\//g, "_");
      const docRef = doc(ref, safeId);
      batch.set(docRef, item);
    });

    await batch.commit();
    console.log("✅ Alle woorden zijn succesvol toegevoegd aan Firestore!");
  } catch (error) {
    console.error("❌ Fout bij uploaden van woorden:", error);
  }
}

// Start upload
uploadWoorden();
