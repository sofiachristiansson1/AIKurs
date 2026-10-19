# Täckesguiden

Täckesguiden hjälper hästägare att välja täcke. Sök på en ort i Sverige, fyll i några uppgifter om hästen och få en rekommendation för **nu** och för **kommande natt (22–06)**, med en kort motivering.

**Öppna appen:** https://sofiachristiansson1.github.io/AIKurs/

> Rekommendationen är en vägledning, inte veterinärråd. Känn alltid på din häst, till exempel bakom bogen, för att se om den är för varm eller kall.

## Så fungerar det

Appen hämtar väder från [Open-Meteo](https://open-meteo.com/) och räknar ut ett täcke i sju nivåer, från inget täcke till tjockt täcke med underlägg.

1. **Bastäcke** utifrån den lägsta temperaturen under perioden och om hästen är klippt. Ute används upplevd temperatur, så att vinden räknas med. I stall används lufttemperaturen.
2. **Justeringar**, ett steg i taget:
   - nederbörd på minst 0,5 mm/h någon timme ger +1 steg och vattentätt täcke (bara ute)
   - unghäst under 3 år ger +1 steg
   - seniorhäst från 20 år ger +1 steg
   - fullblod/arab ger +1 steg
   - i stall ger −1 steg
3. Justeringarna som ger varmare täcke är tillsammans begränsade till **+2 steg**.

Alla gränser och justeringar finns på ett ställe, i [`src/domain/blanketRules.ts`](src/domain/blanketRules.ts), med källa för varje värde.

### Källor

Reglerna väger ihop flera källor. När de säger olika väljs det varmare alternativet, men högst en nivå varmare.

- University of Kentucky, [ASC240 Blanketing horses](https://publications.mgcafe.uky.edu/files/ASC240.pdf)
- UMaine Extension, [blanketing guidelines](https://extension.umaine.edu/publications/wp-json/wp/v2/pages/32170)
- Rutgers Equine Science Center, [To blanket or not to blanket](https://esc.rutgers.edu/fact_sheet/to-blanket-or-not-to-blanket/)
- SmartPak, [What blanket weight for what temperature](https://www.sstack.com/blogs/learning-center/what-blanket-weight-for-what-temperature) och [Blanketing when raining](https://www.sstack.com/blogs/blanketing/how-to-keep-your-horse-dry)
- Mejdell m.fl., [The effect of weather conditions on the preference in horses for wearing blankets](https://nmbu.brage.unit.no/nmbu-xmlui/handle/11250/2620787)

Värden som källorna inte anger siffror för är beslutade i projektet och märkta `[OWNER]` i koden: åldersgränser, nederbördsgräns, stallsteg, taket på +2 steg och nattens timmar.

### Dina uppgifter

Hästens uppgifter och senast valda ort sparas bara i din webbläsare (`localStorage`). Inget skickas till någon server utom ortnamn och koordinater till Open-Meteo.

## Köra lokalt

Kräver Node 22 eller senare.

```
npm install
npm run dev
```

Öppna sedan adressen som visas, oftast http://localhost:5173.

| Kommando | Gör |
|---|---|
| `npm run dev` | Startar utvecklingsservern |
| `npm test` | Kör alla tester |
| `npm run test:watch` | Kör om testerna när filer sparas |
| `npm run lint` | ESLint och Prettier, inklusive lagerreglerna |
| `npm run typecheck` | Typkontroll med TypeScript |
| `npm run build` | Bygger sajten till `dist/` |
| `npm run preview` | Visar det byggda resultatet på http://localhost:4173/AIKurs/ |

## Teknik och struktur

React, Vite och TypeScript (strict), med tester i Vitest och Testing Library. Det finns ingen backend och ingen databas.

```
src/
  ui/      React-komponenter, hooks och svenska texter
  domain/  Täckesberäkningen: rena funktioner utan sidoeffekter
  api/     Open-Meteo och localStorage
```

Beroenden går bara nedåt, och ESLint stoppar till exempel `fetch` utanför `api/` och klockan i `domain/`. Se [`CLAUDE.md`](CLAUDE.md) för alla principer.

## Publicering

Varje push till `main` körs genom lint, typkontroll och tester och publiceras sedan på GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Kända begränsningar

- Ortsökningen gäller bara Sverige.
- Open-Meteo använder samma UTC-avstånd för hela prognosen, så natten när klockan ställs om kan bli en timme fel.
- Den fria versionen av Open-Meteo får bara användas icke-kommersiellt.

## Licens för väderdata

Väderdata från [Open-Meteo.com](https://open-meteo.com/), licensierad under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
