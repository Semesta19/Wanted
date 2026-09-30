import { GoogleGenAI } from '@google/genai';

export interface GeneratePhotoRequest {
  prompt: string;
  imageBase64?: string; // data:image/jpeg;base64,... or raw base64
  stylePreset?: string;
  characterName?: string;
  epithet?: string;
  bounty?: number;
  generateFullPoster?: boolean; // When true, generate entire wanted poster image with nano banana
  bottomNotice?: string;
  marineText?: string;
}

export async function handleGeneratePhoto(data: GeneratePhotoRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY tidak ditemukan di environment server.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const {
    prompt,
    imageBase64,
    characterName = 'NICO ROBIN',
    epithet = 'DEVIL CHILD',
    bounty = 130000000,
    generateFullPoster = false,
    bottomNotice = 'Bapack-bapack deadstar',
    marineText = 'MARINE',
  } = data;

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

  if (imageBase64) {
    const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      parts.push({
        inlineData: {
          mimeType: matches[1],
          data: matches[2],
        },
      });
    } else {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
        },
      });
    }
  }

  let finalPrompt = '';
  let aspectRatio = '4:3';

  if (generateFullPoster) {
    // Generate entire Wanted Poster matching the reference with pure paper background (no wood)
    aspectRatio = '3:4';
    finalPrompt = `A flat 2D graphic scan of an authentic One Piece wanted bounty poster. The aged antique parchment paper poster itself fills 100% of the entire image from edge to edge with pure paper surface. Absolutely NO wooden background, NO wood wall, NO wooden table, NO wood planks around or behind the poster, NO tabletop surface. At the top in huge bold Western slab-serif woodblock typography is the word "WANTED". In the center, a dark-bordered rectangular frame containing a portrait illustration of ${characterName}${epithet ? ` (${epithet})` : ''}: ${prompt || 'intense eyes, dramatic anime expression, signature pirate style, vintage 90s cel-shaded anime look'}. Directly beneath the photo frame is "DEAD OR ALIVE" framed by ornate baroque filigree scroll flourishes. Below that is "${characterName}" in bold woodblock serif font. Under the name, the character epithet « ${epithet} » and the Berry currency symbol ฿ followed by "${bounty.toLocaleString()}-". At the very bottom: on the bottom right corner is the large bold woodblock serif text "${marineText.toUpperCase()}"; on the bottom left corner is small vintage notice text that reads "${bottomNotice}". High resolution, authentic collector quality One Piece bounty poster, exact color tone and vintage paper weathering, pure paper edges with no wood backdrop.`;
  } else {
    // Standard photo portrait generation
    aspectRatio = '4:3';
    const styleContext =
      'Authentic 90s One Piece anime art style, Eiichiro Oda illustration aesthetics, vintage anime cel shading, hand-drawn manga line art, bold outlines, dramatic pirate bounty poster portrait, intense expression, atmospheric lighting, muted vintage color palette.';
    finalPrompt = `${prompt ? prompt + '. ' : ''}${styleContext} Framed character bust portrait of ${characterName}, suitable for a classic WANTED bounty poster. High resolution, crisp character details, dynamic lighting.`;
  }

  parts.push({ text: finalPrompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts,
      },
      config: {
        imageConfig: {
          aspectRatio,
        },
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          return {
            imageUrl: `data:${mime};base64,${part.inlineData.data}`,
            isFullPoster: generateFullPoster,
          };
        }
      }
    }

    const textPart = candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
    throw new Error(textPart || 'Model tidak mengembalikan gambar.');
  } catch (err: any) {
    console.error('Error with gemini-3.1-flash-lite-image:', err);
    throw err;
  }
}

export async function handleSuggestPrompt(currentName?: string, currentEpithet?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY tidak ditemukan.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const promptText = `
Berikan 4 ide konsep poster Wanted One Piece untuk: ${currentName || 'Nico Robin'} (${currentEpithet || 'Devil Child'}).
Format JSON:
[
  {
    "name": "NAMA_KARAKTER",
    "epithet": "GELAR_KARAKTER",
    "bounty": 130000000,
    "prompt": "Deskripsi visual pose, pakaian, dan ekspresi anime..."
  }
]
Hanya kembalikan array JSON valid.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: promptText,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return [];
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}
