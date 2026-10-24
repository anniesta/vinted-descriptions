# Vinted Listing Assistant

Skrypt CLI, który pomaga przygotować polskojęzyczne tytuły i opisy ogłoszeń z odzieżą dziecięcą na podstawie zdjęć. Analizuje lokalne foldery ze zdjęciami przez Google Gemini i zapisuje wyniki do plików CSV.

> Narzędzie tworzy propozycje tekstów — nie publikuje ogłoszeń na Vinted. Przed użyciem opisu sprawdź, czy zgadza się ze stanem i cechami przedmiotu.

## Możliwości

- rozpoznawanie zdjęć JPG, JPEG, PNG i WebP,
- generowanie tytułu i opisu po polsku dla każdego folderu ze zdjęciami,
- uwzględnianie rozmiaru podanego w nazwie folderu,
- zapis wyników do `results.csv`, gotowego do otwarcia m.in. w Excelu,
- pomijanie folderów, które mają już wpis w pliku wynikowym,
- możliwość skonfigurowania kolejnych modeli Gemini jako zapasowych.

## Wymagania

- Node.js i npm,
- klucz API Google Gemini z [Google AI Studio](https://aistudio.google.com/).

## Instalacja i konfiguracja

1. Sklonuj repozytorium i przejdź do jego katalogu.
2. Zainstaluj zależności:

   ```bash
   npm ci
   ```

3. Skopiuj `.env.example` do `.env` i uzupełnij ustawienia:

   ```dotenv
   GOOGLE_API_KEY=tu_wklej_swoj_klucz
   AI_MODELS=gemini-3.1-flash-lite,gemini-3.5-flash,gemini-flash-latest
   SOURCE_DIR=C:/Users/Jan/zdjecia-odziezy
   DEBUG=false
   ```

   `AI_MODELS` przyjmuje listę identyfikatorów modeli oddzielonych przecinkami. Użyj modeli dostępnych dla Twojego klucza API; w razie błędu skrypt spróbuje kolejnego z listy. `SOURCE_DIR` powinien wskazywać katalog zawierający foldery z rozmiarami.

## Przygotowanie zdjęć

Każdy folder bezpośrednio pod katalogiem rozmiaru powinien odpowiadać jednemu ubraniu. Zdjęcia można umieścić również w jego podfolderach.

```text
zdjecia-odziezy/
├── 92/
│   ├── komplet-01/
│   │   ├── przod.jpg
│   │   └── tyl.jpg
│   └── body-02/
│       └── zdjecie.png
└── 110/
    └── bluza-01/
        └── bluza.webp
```

Nazwy folderów rozmiarów (`92`, `110`) są przekazywane modelowi jako rozmiar ubrania. Warto używać unikalnych nazw folderów z produktami w obrębie każdego rozmiaru, ponieważ ich ścieżki trafiają do pliku CSV i służą do pomijania wcześniej przetworzonych folderów.

## Uruchomienie

```bash
npm start
```

Skrypt przetwarza foldery kolejno. W każdym folderze rozmiaru zapisuje lub uzupełnia `results.csv` z kolumnami `folderNo`, `title` i `description`. Plik wynikowy ma kodowanie UTF-8 z BOM, aby ułatwić poprawne wyświetlanie polskich znaków w Excelu. Ponowne uruchomienie pomija foldery już zapisane w CSV.

## Prywatność i koszty

Zdjęcia są wysyłane do Google Gemini w celu analizy. Korzystaj wyłącznie ze zdjęć, które masz prawo przekazać do przetwarzania, i zapoznaj się z warunkami oraz polityką prywatności Google. Korzystanie z API może wiązać się z opłatami lub limitami zależnymi od konta i użytego modelu.

Klucz API przechowuj lokalnie w `.env` — plik jest ignorowany przez Git. Nie umieszczaj w repozytorium prawdziwych kluczy ani prywatnych zdjęć.

## Technologie

TypeScript, Node.js, Google GenAI SDK, `csv-parse`, `csv-stringify` i `dotenv`.

## Licencja

Ten projekt nie ma licencji open source. Możesz przeglądać repozytorium jako część portfolio, ale jego publiczna dostępność nie oznacza zgody na kopiowanie, modyfikowanie ani rozpowszechnianie kodu.
