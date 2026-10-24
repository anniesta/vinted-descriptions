import { GoogleGenAI, Type  } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const models : string[] = (process.env.AI_MODELS ?? (() => { throw new Error('AI_MODELS is not defined in .env file') })()).split(',').map(model => model.trim()).filter(model => model.length > 0);

if(models.length === 0) {
  throw new Error('Brak zdefiniowanych modeli AI w zmiennych środowiskowych');
}

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY, httpOptions: { timeout: 60_000 }, });

export function buildPrompt(size : string) {
  return `Na zdjęciach jest jedno ubranie dziecięce. Rozmiar: ${size}.
Przygotuj ogłoszenie na Vinted po polsku.

Tytuł:
- krótki i zwięzły,
- ZAWSZE kończy się rozmiarem w formie "r. ${size}".
- podaj typ ubrania i jego kolor lub motyw nadruku, np. "bluzka w kwiaty r. 110", "spodnie dresowe szare r. 128", "sukienka w paski r. 116", "kurtka zimowa niebieska r. 122", "piżama w dinozaury r. 104", "body z krótkim rękawem z motywem z Disney Cars r. 98", "sweter w serek czerwony r. 134", "spódniczka tiulowa różowa r. 140", "kombinezon letni zielony r. 92", "bluza z kapturem czarna r. 152".

Opis:
- tylko fakty, bez zwrotów reklamowych i subiektywnych opinii,
- co to dokładnie jest, kolor, stan, wzór lub nadruk,
- szczegóły: rodzaj zapięcia, kaptur, kieszenie, elementy ozdobne,
- informacja o rozmiarze (${size}),
- przyjazny język, bez upychania słów kluczowych.
- opis powinien być w formie jednolitego tekstu bez wypunktowań, akapitów i nagłówków.
- Powinien być bezosobowy, bez powitania oraz zwrotów typu "Zapraszam do zakupu", "Polecam", "Wysyłam szybko" itp.
- jeżeli kieszenie czy kaptur nie są typowe dla tego rodzaju ubrania np. dla piżamy, to nie pisz, że bez dodatkowych zapięć, kapturów czy kieszeni.
- nie używja ogólnego określenia odzież
- na końcu opisu dodaj informację o rozmiarze w formie "Rozmiar: ${size}".
- nie oceniaj stanu przedmiotu, nie pisz, że jest "w dobrym stanie", "jak nowy" itp.
- jeśli na jakimś zdjęciu jest widoczna plama lub defekt to opisz to wprost, np. "niewielka plama na rękawie (widoczna na zdjęciu)"
Jeśli czegoś nie widać na zdjęciach (np. skład materiału), nie wymyślaj tego.`;
}

async function sendToAiApi(prompt : string, imageParts : any[], model : string)  {
        const response : any = await genAI.models.generateContent({
          model: model,
          contents: [{ role: 'user', parts: [{ text: prompt }, ...imageParts] }],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ['title', 'description'],
            },
          },
        });
      return JSON.parse(response.text);
}


export async function sendWithFallback(prompt : string, imageParts : any[]) {
  let lastError;
  for (const model of models) {
    try{
      return await sendToAiApi(prompt, imageParts, model);
    } catch (error : any) {
      lastError = error;
      console.warn(`Model ${model} nie zadziałał (${error.status ?? error.code}), próbuję następny`);    
    }
  }
  throw lastError;
}