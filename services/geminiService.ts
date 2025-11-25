
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryResponse } from "../types";
import { decode } from "../utils/audioUtils";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const storyModel = 'gemini-2.5-pro';
const imageModel = 'imagen-4.0-generate-001';
const ttsModel = 'gemini-2.5-flash-preview-tts';
const artStyle = "in a consistent Ghibli-inspired watercolor and ink art style, evoking a sense of wonder and melancholy.";

const storySchema = {
  type: Type.OBJECT,
  properties: {
    story: {
      type: Type.STRING,
      description: "A paragraph of the next part of the story, about 100-150 words. It should be engaging and descriptive."
    },
    imagePrompt: {
        type: Type.STRING,
        description: "A short, descriptive prompt for an image generation model to create a scene based on the story."
    },
    choices: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of 3-4 short, distinct choices for the player to make next."
    },
    updatedInventory: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "The player's inventory, updated based on the story events (e.g., finding or using an item)."
    },
    updatedQuest: {
      type: Type.STRING,
      description: "The player's current main quest, updated if the story progresses it."
    },
    ambiance: {
      type: Type.STRING,
      enum: ['DUNGEON', 'NATURE', 'BATTLE', 'TOWN', 'MYSTICAL'],
      description: "The ambient sound environment that matches the current scene."
    },
    weather: {
      type: Type.STRING,
      enum: ['CLEAR', 'RAIN', 'STORM', 'WINDY', 'FOG'],
      description: "The current weather condition. Change this dynamically based on the story or random events."
    }
  },
  required: ['story', 'imagePrompt', 'choices', 'updatedInventory', 'updatedQuest', 'ambiance', 'weather']
};

export const generateStoryAndChoices = async (prompt: string, inventory: string[], quest: string, currentWeather: string): Promise<StoryResponse> => {
  const systemInstruction = `You are the dungeon master for an infinite choose-your-own-adventure text-based game. 
  Your responses MUST be in JSON format matching the provided schema. 
  The story should be immersive, creative, and adapt to the user's choices. 
  Always update the inventory and quest based on what happens in the story. 
  Keep the art style consistent for images. 
  Select the most appropriate 'ambiance' for the soundscape.
  You also control the 'weather'. It should affect the story (e.g., making travel harder, changing the mood). Weather types: CLEAR, RAIN, STORM, WINDY, FOG.
  Current inventory: [${inventory.join(', ')}]. 
  Current quest: "${quest}".
  Current weather: "${currentWeather}".`;

  try {
    const response = await ai.models.generateContent({
        model: storyModel,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: storySchema,
            temperature: 0.8,
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as StoryResponse;

  } catch (error) {
    console.error("Error generating story:", error);
    throw new Error("The storyteller seems to have lost their train of thought. Please try again.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
    const fullPrompt = `${prompt}, ${artStyle}`;
    try {
        const response = await ai.models.generateImages({
            model: imageModel,
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        throw new Error("No image was generated.");
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("The magical canvas remains blank. The image could not be conjured.");
    }
};

export const generateSpeech = async (text: string): Promise<Uint8Array> => {
    try {
        const response = await ai.models.generateContent({
            model: ttsModel,
            contents: [{ parts: [{ text: `Read this story segment with a calm, narrative voice: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        
        return decode(base64Audio);

    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("The narrator's voice has faded into silence.");
    }
};
