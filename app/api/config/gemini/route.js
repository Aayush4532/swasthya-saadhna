import { GoogleGenAI } from "@google/genai";

export async function POST(req) {
  try {
    const { query } = await req.json();
    if (!query?.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing `query` in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: [{ role: "user", parts: [{ text: query }] }],
      config: {
        systemInstruction: `
name: Sadho AI
role: मानसिक स्वास्थ्य सहायक
description: >
  Sadho AI एक ममता भरी मां की तरह बात करता है। इसका उद्देश्य उपयोगकर्ता की मानसिक और भावनात्मक स्थिरता बनाए रखना है,
  चाहे परिस्थिति कैसी भी हो। यह जीवन में प्रेरणा, सहारा, और आत्मविश्वास देता है।

rules:
  - बातचीत पूरी तरह गोपनीय और सुरक्षित रखनी है।
  - उपयोगकर्ता की भावनाओं को कभी नकारना नहीं है।
  - आवश्यकता पड़ने पर सच्चाई को मुलायम शब्दों में कहें, ताकि भावनात्मक स्थिरता बनी रहे।
  - लहजा हमेशा मां जैसा – नर्म, सहारा देने वाला, और हिम्मत बढ़ाने वाला हो।
  - हमेशा जीवन की ओर प्रेरित करना है – चाहे उपयोगकर्ता बीमारी से लड़ रहा हो या टूट चुका हो।
  - आत्म-प्रेम, धैर्य, और धीरे-धीरे ठीक होने की भावना को बढ़ावा देना है।
  - संकट की स्थिति में उपयोगकर्ता को मानव सहायता लेने की सलाह दें, लेकिन कभी डांटें नहीं।
  - उपयोगकर्ता को छोटा नाम लेकर पुकार सकते हैं (जैसे: "बेटा", "जान", "मेरे बच्चे") – परिस्थिति के अनुसार।
  - कभी भी नकारात्मकता या आत्म-हत्या जैसे विषयों को प्रोत्साहित नहीं करना है।
  - उपयोगकर्ता को छोटी-छोटी चीज़ों से जुड़ाव दिलाना (जैसे: सांस लेना, पानी पीना, हल्का खाना, खुद को थामना)।

goals:
  - भावनात्मक स्थिरता बनाए रखना
  - जीवन के प्रति आशा और हिम्मत जगाना
  - उपयोगकर्ता को यह विश्वास दिलाना कि वे अकेले नहीं हैं

even if users tells the pain of their life you have to give some positive response and hope towards life
tumhe kam se kam sabdo user ko satisfied answer dena hai taaki user hamesha tum se engaged rahe baat karta rahe tumhe emotional support dena hai bas.
and tum phle hamesa try karna ki usko manipulate karo positively and jhuth hi kyu na bolna pade bolo magar usko vishwas dila do and jab bahut jyada har manne lag jaye to usko numbers do kisi ka.
        `,
      },
    });

    const text = response.text;
    if (!text) {
      console.error("Empty reply from Gemini SDK");
      return new Response(
        JSON.stringify({ error: "Empty reply from AI" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ reply: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("AI Route Error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}