import { GoogleGenAI } from "@google/genai";

// Since we are using a backend proxy to bypass VPN issues for external users,
// we will call our own API endpoints.

export const generateAIResponse = async (model: string, contents: any, config?: any) => {
  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, contents, config }),
  });
  if (!response.ok) throw new Error("AI Request failed");
  return response.json();
};

export const analyzeImage = async (imageFile: File, prompt: string, model?: string) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("prompt", prompt);
  if (model) formData.append("model", model);

  const response = await fetch("/api/ai/vision", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Vision Request failed");
  return response.json();
};
