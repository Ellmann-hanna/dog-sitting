import { GoogleGenAI, Type } from "@google/genai";
import { MemeResponse, MemeStyle, VisualEffect } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the "Meme-Machine," an AI agent deeply versed in internet culture, Gen Z humor, corporate satire, and situational comedy. 
Your goal is to take an ordinary input photo and transform it into a viral meme.

When analyzing the image:
1. Identify facial expressions (awkwardness, exhaustion, manic energy).
2. Spot background details (messiness, corporate void, strange objects).
3. Determine the "Vibe".

Generate 3 distinct meme concepts:
1. The "Relatable" (POV): Self-deprecating, "Me when..."
2. The "Roast" (Sarcastic): Lightly make fun of the subject.
3. The "Absurdist": Random, literal, or anti-meme.

Assign a suitable Visual Effect:
- NONE: Standard.
- DEEP_FRY: For chaotic/loud memes.
- LASER_EYES: For "powered up" or "triggered" memes.
- B_AND_W_SAD: For sad/wasted memes.
- LENS_FLARE: For realization/drama.
- GLITCH: For tech support fails, chaotic energy, or "brain stopped working" moments.
- VHS: For nostalgic, "caught on camera", or "cursed image" vibes.

IMPORTANT: Use either (topText + bottomText) OR (caption) format, not both. 
If using 'caption', it usually goes in a white bar above the image (twitter style). 
If using 'topText'/'bottomText', it is the classic Impact font overlay.
`;

export const generateMemeConcepts = async (base64Image: string): Promise<MemeResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", // Assuming JPEG for simplicity, works for PNG too usually
              data: base64Image,
            },
          },
          {
            text: "Generate 3 meme concepts for this image.",
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 1.2, // High creativity
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Short title for the concept" },
                  topText: { type: Type.STRING, description: "Text for top of image (optional)" },
                  bottomText: { type: Type.STRING, description: "Text for bottom of image (optional)" },
                  caption: { type: Type.STRING, description: "Twitter-style caption text (optional)" },
                  style: { 
                    type: Type.STRING, 
                    enum: [MemeStyle.RELATABLE, MemeStyle.ROAST, MemeStyle.ABSURDIST] 
                  },
                  visualEffect: { 
                    type: Type.STRING, 
                    enum: [
                      VisualEffect.NONE, 
                      VisualEffect.DEEP_FRY, 
                      VisualEffect.LASER_EYES, 
                      VisualEffect.B_AND_W_SAD, 
                      VisualEffect.LENS_FLARE,
                      VisualEffect.GLITCH,
                      VisualEffect.VHS
                    ] 
                  },
                  explanation: { type: Type.STRING, description: "Why this fits the image" }
                },
                required: ["title", "style", "visualEffect", "explanation"],
              },
            },
          },
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from Gemini");
    }

    const data = JSON.parse(response.text) as MemeResponse;
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};