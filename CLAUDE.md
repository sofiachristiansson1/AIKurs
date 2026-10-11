# CLAUDE.md

Instruktioner till AI-agenter som arbetar i det här repot. Läs hela filen innan du ändrar något.

## Vad projektet gör

**Täckesguiden** är en webbapp där en hästägare söker på en ort och får se aktuell temperatur och väder där, tillsammans med en rekommendation om vilket täcke hästen behöver (inget täcke, regntäcke, tunt fodrat, mellantjockt, tjockt osv.).

Problemet det löser: att välja täcke är en daglig gissning. Lufttemperaturen ensam räcker inte, eftersom vind och nederbörd spelar stor roll, liksom om hästen är klippt, vilken typ av häst det är och om den står ute eller inne. Appen väger ihop de här faktorerna och ger ett tydligt svar med en kort motivering, så att användaren slipper räkna själv.

### Funktioner i första versionen

- Sök på ort och få aktuellt väder (temperatur, upplevd temperatur, vind, nederbörd).
- Ange några uppgifter om hästen: klippt eller oklippt, hästtyp (t.ex. kallblod/ponny, varmblod, fullblod), ute eller i stall.
- Få en täckesrekommendation för nu och för kommande natt, med motivering.

### Utanför scope tills vidare

Inloggning, sparade hästar på ett konto, notiser, och en egen backend.

## Teknikstack

| Del | Val | Varför |
|---|---|---|
| Språk | TypeScript (strict) | Jag kan det sedan tidigare, och typerna fångar fel i beräkningslogiken tidigt. |
| UI | React + Vite | Litet och snabbt att komma igång med, stort ekosystem, enkelt att bygga till statiska filer. |
| Väderdata | Open-Meteo (prognos + geokodning) | Gratis, kräver ingen API-nyckel, och har både ortsökning och väderprognos. Då behövs ingen backend för att gömma nycklar. |
| Tester | Vitest | Fungerar direkt med Vite. Beräkningslogiken ska vara lätt att enhetstesta. |
| Kodkvalitet | ESLint + Prettier | Enhetlig stil utan diskussion. |
| Hosting | Statisk sajt (t.ex. GitHub Pages) | Ingen server att drifta. |

Ingen databas och ingen backend. Hästens inställningar sparas i webbläsarens `localStorage`.

## Arkitekturprinciper

Koden delas i tre lager, och beroenden går bara nedåt:

```
src/
  ui/        React-komponenter. Visar data och tar emot inmatning. Ingen affärslogik.
  domain/    Täckesberäkningen och domäntyperna. Rena funktioner, inga sidoeffekter.
  api/       All kommunikation med omvärlden (Open-Meteo, localStorage).
```

1. **All I/O sker i `api/`.** Inga `fetch`-anrop eller `localStorage`-anrop i komponenter eller i `domain/`.
2. **`domain/` är ren logik.** Funktionerna där tar väder och hästuppgifter som argument och returnerar en rekommendation. De får inte läsa klockan, nätverket eller global state, och de importerar aldrig från `ui/` eller `api/`.
3. **Täckesreglerna är data, inte utspridda if-satser.** Temperaturgränser och justeringar (klippt, vind, regn, hästtyp) ligger samlade i en tabell på ett ställe, med källhänvisning i en kommentar. En gräns ska kunna ändras på en rad.
4. **Externa data översätts vid gränsen.** Svar från Open-Meteo mappas om till egna domäntyper i `api/`. Resten av koden känner inte till API:ets format.
5. **Funktioner gör en sak** och är korta nog att läsa utan att scrolla.
6. **Inga globala variabler** och ingen muterbar delad state utanför React.
7. **Ingen `any`.** Använd riktiga typer, och `unknown` plus validering för data utifrån.
8. **Fel hanteras synligt.** Om orten inte hittas eller vädertjänsten inte svarar ska användaren få ett begripligt meddelande på svenska. Svälj aldrig fel tyst.
9. **Varje regel i täckesberäkningen har ett enhetstest**, inklusive gränsvärdena.
10. **Enheter är alltid explicita:** °C, m/s och mm. Sätt enheten i namnet när det kan missförstås (`windSpeedMs`, `temperatureC`).

### Språk

Kod, identifierare och commit-meddelanden skrivs på engelska. All text som användaren ser är på svenska.

## Saker agenten INTE ska göra

- **Lägg inte till externa beroenden utan att fråga först.** Förklara vad paketet behövs till och vilket alternativ som finns utan det.
- **Byt inte ramverk, byggverktyg eller väder-API** och lägg inte till backend eller databas utan att fråga.
- **Ändra inte temperaturgränser eller regler i täckesberäkningen på eget initiativ.** De bygger på underlag. Hitta inte på nya siffror. Om en regel verkar fel, säg till och föreslå ändringen.
- **Lägg inte in API-nycklar, lösenord eller andra hemligheter i repot.**
- **Ta inte bort eller försvaga tester för att få dem att gå igenom.** Laga koden, eller förklara varför testet är fel.
- **Stäng inte av lint- eller typfel** med `eslint-disable`, `@ts-ignore` eller `any` utan en kommentar som motiverar det.
- **Gör inga stora omstruktureringar som inte efterfrågats.** Håll ändringarna till det uppgiften gäller.
- **Pusha inte med `--force`** och skriv inte om historiken på `main`.
- **Presentera inte rekommendationen som veterinärråd.** Den är en vägledning, och det ska framgå i gränssnittet att användaren alltid ska känna på sin egen häst.

## Arbetssätt

- Kör `npm run lint` och `npm test` innan du säger att något är klart.
- Små commits med ett tydligt meddelande om vad som ändrats och varför.
- Är något oklart i uppgiften, fråga i stället för att gissa.
