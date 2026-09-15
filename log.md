# Tegevuslogi

Kronoloogiline logi sellest, kuidas tehisintellekti (Claude) abiga
programm valmis sai — mis õnnestus kohe, mis nõudis parandust, ja
milliseid muljeid protsess jättis. Vastab README.md-s kirjeldatud
neljale etapile.

---

**Etapp 1 — liides ja kujundus**

- Esimene viip andis kohe töötava 3×3 laua, aga esialgne kujundus oli
  liiga geneeriline (soe kreemtaust + terrakota aktsent — täpselt
  see, mida viip pidi vältima). Tuli täpsustada: "vali teema, mis
  tuleb mängu enda sisust, mitte vaikimisi disainist."
- Teine katse andis kriiditahvli teema, mis sobis hästi kokku
  ülesande viimase punktiga ("üheskoos tahvlil võrdleme").
- **Õnnestus kohe:** X/O joonistusanimatsioon (`stroke-dasharray`
  trikk) — ei osanud oodata, et nii lihtsa CSS-iga saab kriidiga
  joonistamise tunde tekitada.
- **Mulje:** üldsõnalise "tee ilus disain" asemel konkreetsete
  piirangute andmine (mida VÄLTIDA) andis palju parema tulemuse kui
  esimene, liiga avatud viip.

**Etapp 2 — mängureeglid ja kärpimata minimax**

- Õnnestus esimese korraga — võiduliinide kontroll ja rekursiivne
  minimax olid korrektsed juba enne testimist.
- **Ebaõnnestumine, mis ilmnes hiljem (etapis 4):** algne versioon ei
  eelistanud kiiremat võitu aeglasemale — tehisintellekt valis vahel
  käigu, mis andis inimesele tarbetult palju käike vea tegemiseks.
  See polnud viga reeglites, vaid "maitse" küsimus, mis paistis välja
  alles mängides, mitte koodi lugedes.
- **Mulje:** puhtalt korrektne kood ja *hea* kood on kaks erinevat
  asja — viga ei tulnud välja loogilise analüüsiga, vaid päris
  mängimisega.

**Etapp 3 — alfa-beeta optimeerimine**

- Esimene optimeeritud versioon oli vigane: `alpha`/`beta`
  piirid segunesid maksimeeriva ja minimeeriva haru vahel (kopeeriti
  liiga mehaaniliselt üldisest näitest, ilma `aiMark`/`humanMark`
  konteksti korralikult üle kandmata) — mõnel testkäigul valis AI
  käigu, mis polnud enam optimaalne.
- Parandus: kirjutati kaks selgelt eraldi haru (`turn === aiMark`
  vs muidu), mitte üks üldistatud valem — vähem "elegantne", aga
  selgelt jälgitav ja õige.
- Kontrolliti automaattestiga (`test/logic.test.js`,
  `testAlphaBetaMatchesPlainMoveQuality`), et optimeeritud versioon
  annab sama skoori kui kärpimata versioon samal laual — see test
  püüdis vea kohe kinni, kui see uuesti tekkis (juhtus kaks korda
  koodi ümberkirjutamisel).
- Sõlmede loendus näitas mõõdetavat tulemust: tühjalt laualt
  549 946 sõlme (kärpimata) vs 20 866 sõlme (alfa-beeta) —
  ligikaudu 26-kordne vähenemine.
- **Mulje:** optimeerimist "usaldada silma järgi" ei tohi — alles
  automaattest ja päris arvuline mõõtmine andsid kindluse, et kärpimine
  ei muutnud mängu tugevust, ainult kiirust.

**Etapp 4 — liidese kokkupanek**

- Esimesel katsel uuenes ressursipaneel (sõlmed/aeg) ainult mängu
  *alguses*, mitte iga käigu järel, kuna loendur nulliti valel kohal
  (mängu, mitte käigu alguses). Parandati, tuues `nodeCounter = 0`
  otse `aiMove()` sisse.
- Raskusastme nuppude vahetus töötas kohe korrektselt.
- **Õnnestus üle ootuste:** juhusliku AI ja minimax-AI kõrvutine
  valitavus liideses muutis optimeerimise "nähtavaks" — sama mängu
  sai kohe kahe raskusastmega läbi mängida ja vahet päriselt tunda,
  mitte ainult numbritest lugeda.

---

## Kokkuvõtlik mulje

Kõige suurem üllatus protsessis oli, et loogiliselt "õige" kood
(etapp 2 ja esimene katse etapist 3) ei tähenda automaatselt "hea"
või "veatu" koodi — mänguviisi kvaliteet ja alfa-beeta piiride
segamini minek tulid välja alles päris mängimisel ja
automaattestidega, mitte koodi lugemisel. See on ka põhjus, miks
`test/logic.test.js` lisati projekti püsivaks osaks, mitte ainult
ühekordse kontrollina.