# XOXO — Ristid-nullid minimax-tehisintellekti vastu

Väike brauseris mängitav ristid-nullid, kus vastaseks on minimax-algoritmiga
tehisintellekt. Projekt on tehtud ülesande jaoks "Programmi genereerimine
tehisaru abil" — see README dokumenteerib **kuidas** programm etapiviisiliselt
tehisintellekti (Claude) abiga valmis sai, milliste viipade ja piirangutega,
ning mida tehisintellekt oskas ise optimeerida.

Käivitamiseks ava lihtsalt `index.html` brauseris, eraldi serverit vaja pole.

## Sisukord

- [Loomise etapid ja viibad](#loomise-etapid-ja-viibad)
- [Arvutus- ja mäluressursi analüüs](#arvutus--ja-m%C3%A4luressursi-anal%C3%BC%C3%BCs)
- [Kas ja kuidas tehisaru oskas optimeerida](#kas-ja-kuidas-tehisaru-oskas-optimeerida)
- [Mida sai valmis, mida mitte](#mida-sai-valmis-mida-mitte)
- [Tegevuslogi](#tegevuslogi)

## Loomise etapid ja viibad

Programm sündis neljas selges etapis. Iga etapi juures on kirjas **täpne
piiritletud ülesanne**, mis tehisintellekti tehti (viip), ning millised
piirangud sellele kaasa anti.

### Etapp 1 — mängulaud ja liides (HTML/CSS)

**Viip:** "Loo ristid-nullid mängu jaoks kolmveerandi laiune HTML+CSS
liides: 3×3 lauaga, kus lahtrid on klikitavad, statistikapaneel
(võidud/viigid/kaotused) ja nupustik raskusastme valimiseks. Disain ei
tohi näha välja nagu tüüpiline tehisintellekti genereeritud leht (ei
kreem-taust + terrakota, ei must taust + üks ere aktsentvärv, ei
SaaS-kaardid) — mõtle konkreetne visuaalne identiteet välja mängu enda
konteksti pealt."

**Piirangud:**
- Puhas HTML/CSS/JS, ilma raamistikuta (GitHub Pagesist peab käivituma otse).
- Peab töötama ilma build-sammuta — brauser avab `index.html` otse.
- Responsiivne kuni mobiiliekraanini.

**Tulemus:** kriiditahvli-teemaline kujundus (`style.css`) — tumeroheline
tahvlipind, kriidivärvi jooned, käsitsi joonistatud X/O animatsioon SVG
`stroke-dasharray` trikiga. Valik tehti teadlikult, sest ülesanne ise
lõppeb klassis "tahvlil" tulemuste võrdlemisega — teema sobib sisuga kokku.

### Etapp 2 — mängureeglid ja algne (optimeerimata) minimax

**Viip:** "Lisa mängu tuumloogika: käigu kehtivuse kontroll, võitja/viigi
tuvastamine kaheksa võiduliini järgi, ning tehisintellekti käik, mis
kasutab **täielikku minimax-otsingut ilma ühegi kärpimiseta**. Funktsioon
peab loendama, mitu puu sõlme ta läbi käib, et hiljem optimeeritud
versiooniga võrrelda."

**Piirangud:**
- Rekursiivne minimax peab tagastama nii hinnangu (score) kui käigu.
- Sõlmede loendur (`nodeCounter`) pidi olema globaalne ja nullituna iga
  AI-käigu alguses, et mõõtmine oleks käigupõhine, mitte kumulatiivne.

**Tulemus:** `minimaxPlain()` funktsioon — korrektne, aga kallis: tühjalt
laualt otsib läbi kogu allesjäänud mängupuu (vt mõõtmistulemusi allpool).

### Etapp 3 — optimeerimine: alfa-beeta kärpimine

**Viip:** "Optimeeri eelmise etapi minimax alfa-beeta kärpimisega, ilma et
mängu tugevus muutuks — sama funktsioon peab endiselt mängima veatult, aga
läbima vähem sõlmi. Lisa ka sügavuse (depth) parameeter, et tehisintellekt
eelistaks kiiremaid võite ja aeglasemaid kaotusi, mitte suvalist samaväärse
skooriga käiku."

**Piirangud:**
- Alfa-beeta lõikamine (`alpha >= beta` puhul `break`) täpselt kahes harus
  (maksimeeriv/minimeeriv käik), ilma täiendavate heuristikuteta nagu
  käikude eelsorteerimine — see jäeti teadlikult lihtsaks, et tulemus
  jääks üliõpilasele üheselt jälgitavaks.
- Tulemus peab olema **mängustrateegiliselt identne** puhta minimaxiga
  (sama optimaalne käik), ainult otsingu maht erineb.

**Tulemus:** `minimaxAB()` — sisuliselt sama funktsioon, aga `alpha`/`beta`
piiridega, mis katkestavad harud, mille tulemus mängu käiku enam ei muudaks.
Vt allpool tegelikke mõõtmisarve.

### Etapp 4 — kasutajaliidese kokkupanek ja lihvimine

**Viip:** "Ühenda mängulogika ja liides: raskusastme valik peab reaalajas
vahetama, kumba minimax-varianti (või juhuslikku käiku) tehisintellekt
kasutab, ja liideses peab olema nähtav, mitu sõlme ja mitu millisekundit
viimane AI-käik võttis, et optimeerimise mõju oleks õpilasele endale
konkreetselt näha, mitte ainult koodis."

**Piirangud:**
- Sõlmede/aja paneel peab uuenema iga AI-käigu järel automaatselt.
- Kasutaja peab saama valida, kummaga märgiga ta mängib (X alustab alati).

**Tulemus:** töötav mäng koos "ressursipaneeliga" (`#perf-nodes`,
`#perf-time`), mis annab reaalajas tunnetuse, kui palju alfa-beeta
kärpimine tegelikult säästab.

## Arvutus- ja mäluressursi analüüs

Ristid-nullis on täielik olekuruum väike — kokku on umbes 5 478 legaalset
laua-seisu ja mängupuu maksimaalne sügavus on 9 käiku. See tähendab, et
kogu mängupuu mahub kergesti mällu ja aja keerukus, mitte mälu, on siin
kitsaskoht.

**Mõõdetud tulemused** (Node.js-is testitud, tühi laud, tehisintellekt
teise käijana):

| Variant | Läbitud sõlmi | Suhe |
|---|---:|---:|
| `minimaxPlain` (kärpimata) | 549 946 | 100 % |
| `minimaxAB` (alfa-beeta) | 20 866 | ~3,8 % |

Ehk alfa-beeta kärpimine vähendas läbitavate sõlmede arvu ligikaudu
**26-kordselt** esimesel käigul, kus otsingupuu on kõige laiem. Mänguviigi
lähedal, kus tühju lahtreid on vähe, on vahe väiksem, sest puu ise on juba
kitsam.

Mäluressurss: kuna otsing on rekursiivne ja sügavuselt piiratud üheksale
tasemele, on maksimaalne pinu (call stack) sügavus 9 — mälukasutus on
konstantne ja tühine (mõni kilobait), sõltumata sellest, kumba
minimax-varianti kasutatakse. Seepärast ei olnud siin mõtet lisada
memoizationi/transpositsioonitabelit (mis aitaks suuremate mängude, nt
males, puhul) — see oleks selle mängu mõõtkavas üleoptimeerimine.

Ajaliselt jääb isegi kärpimata `minimaxPlain` brauseris esimesel käigul
mõne kümne millisekundi piiresse (mõõdetav liideses endas, vt
"Otsuse aeg"), seega kasutajale pole optimeerimine tunnetatavana kriitiline
— aga see on siiski mõõdetav ja demonstreeritav, mistõttu liidesesse jäeti
mõlemad variandid valitavaks.

## Kas ja kuidas tehisaru oskas optimeerida

Jah — kui algne viip küsis ainult *korrektset* minimaxi, siis järgmises
etapis suudeti sama funktsioon ümber kirjutada alfa-beeta kärpimisega, ilma
mänguloogikat lõhkumata (kontrollitud automaattestiga, vt allpool). Lisaks
kärpimisele lisati omal algatusel:

1. **Sügavuspõhine skoorimine** (`10 - depth` / `depth - 10`) — ilma selleta
   valib minimax suvalise võiduni viiva käigu, isegi kui pikem tee annab
   vastasele rohkem võimalusi vigu teha. Tehisintellekt pakkus selle välja
   optimeerimise etapis, kuigi seda otseselt ei küsitud — see parandab
   *mängu kvaliteeti*, mitte otsingu kiirust.
2. **Käigupõhine sõlmede nullimine** — loendur nullitakse iga uue AI-käigu
   alguses, mitte ainult mängu alguses, et ressursipaneel näitaks *selle*
   käigu, mitte kumulatiivset maksumust.

Mida optimeeritud **ei** saanud: käikude eelsorteerimine (nt keskele
alati enne nurki proovida) oleks alfa-beeta kärpimist veelgi tõhustanud,
aga jäeti teadlikult lisamata, et kood oleks üliõpilasele lihtsalt
loetav — see on dokumenteeritud kui teadlik lihtsustusotsus, mitte
unustus.

## Mida sai valmis, mida mitte

**Valmis:**
- Täisfunktsionaalne mäng, kolm AI-tugevust (juhuslik / kärpimata minimax /
  alfa-beeta minimax).
- Automaattestid (`/test/logic.test.js`), mis kontrollivad, et AI ei kaota
  kunagi ja et kaks optimaalset AI-d omavahel alati viiki mängivad.
- Ressursside mõõtmine ja võrdlus liideses endas.

**Ei jõudnud / teadlikult välja jäetud:**
- Käikude eelsorteerimine (edasine optimeerimisvõimalus, vt eelmine osa).
- Mitme mängu statistika salvestamine üle brauseri sessioonide (praegu
  nullub lehe värskendamisel — see poleks olnud minimax-teema jaoks
  oluline lisada).

## Tegevuslogi

Kogu käiguline logi (mis õnnestus kohe, mis nõudis kordamist, millised
viibade sõnastused andsid halva tulemuse) on failis [`LOG.md`](LOG.md).