// src/infrastructure/api/huggingface.service.ts

interface HFChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

class HuggingFaceService {
  private apiUrl =
    import.meta.env.VITE_API_URL || "https://router.huggingface.co";
  private apiKey = import.meta.env.VITE_HUGGINGFACE_TOKEN;
  private defaultModel =
    import.meta.env.VITE_DEFAULT_MODEL || "mistralai/Mistral-7B-Instruct-v0.3";

  async sendMessage(messages: HFChatMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Missing HuggingFace API key");
    }

    const response = await fetch(`${this.apiUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.defaultModel,
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HuggingFace API error ${response.status}: ${text}`);
    }

    const json = await response.json();

    // OpenAI-совместимый формат:
    // { choices: [ { message: { role, content } } ] }
    const content = json?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Invalid response format from HuggingFace API");
    }

    return content;
  }
}

export const huggingFaceService = new HuggingFaceService();
