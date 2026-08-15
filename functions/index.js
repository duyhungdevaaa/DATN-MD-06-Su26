const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const { GoogleGenAI } = require("@google/genai");

admin.initializeApp();

// Lấy API Key và loại bỏ dấu ngoặc kép nếu có
const apiKey = (process.env.GEMINI_API_KEY || "").replace(/"/g, "");
const ai = new GoogleGenAI({ apiKey: apiKey });

// Logic hoàn tiền tự động khi hủy đơn hàng đã được chuyển sang phía Client
// (trong Web Admin: App.tsx và Android App: OrderDetailActivity.java)
// để tránh lỗi trigger cross-region (cơ sở dữ liệu ở asia-southeast3 không hỗ trợ Cloud Functions).

const { onCall, HttpsError } = require("firebase-functions/v2/https");

exports.chatWithGemini = onCall({ region: "asia-southeast1" }, async (request) => {
  try {
    const data = request.data;
    const contents = data.contents;
    const systemInstruction = data.systemInstruction;

    if (!contents || !Array.isArray(contents)) {
      throw new HttpsError(
        "invalid-argument",
        "The function must be called with a 'contents' array."
      );
    }

    const requestOptions = {
      model: "gemini-2.0-flash",
      contents: contents,
    };

    if (systemInstruction) {
      requestOptions.systemInstruction = systemInstruction;
    }

    const response = await ai.models.generateContent(requestOptions);

    if (!response || !response.text) {
      throw new HttpsError("internal", "Received empty response from Gemini");
    }

    return {
      reply: response.text,
    };
  } catch (error) {
    console.error("Error in chatWithGemini:", error);
    throw new HttpsError("internal", error.message || "An error occurred");
  }
});
