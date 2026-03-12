import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { symptoms, isOffline } = await request.json();

    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json({ error: "No symptoms provided" }, { status: 400 });
    }

    // If offline mode is requested or API key not set, use rule-based fallback
    if (isOffline || !GEMINI_API_KEY) {
      return NextResponse.json(ruleBasedTriage(symptoms));
    }

    // Call Google Gemini API (free tier)
    const prompt = `You are a medical triage assistant for rural India. A patient reports these symptoms: ${symptoms.join(", ")}.

Analyze and respond ONLY with valid JSON (no markdown, no code fences):
{
  "category": "HOME_CARE" | "TELECONSULT" | "EMERGENCY",
  "condition": "most likely condition in 3-5 words",
  "probability": number between 50-95,
  "description": "one sentence description of recommended action in simple language",
  "nextSteps": ["step 1", "step 2", "step 3"],
  "followUpIn": "timeframe for followup e.g. '24 hours' or 'immediately'"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
        }),
      }
    );

    if (!response.ok) {
      // Fallback to rule-based if API fails
      return NextResponse.json(ruleBasedTriage(symptoms));
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) return NextResponse.json(ruleBasedTriage(symptoms));

    try {
      const result = JSON.parse(text.trim());
      return NextResponse.json(result);
    } catch {
      return NextResponse.json(ruleBasedTriage(symptoms));
    }
  } catch (error) {
    console.error("Triage API error:", error);
    return NextResponse.json(ruleBasedTriage(["unknown"]));
  }
}

function ruleBasedTriage(symptoms: string[]) {
  const lowerSymptoms = symptoms.map((s) => s.toLowerCase());

  const emergencyKeywords = ["chest pain", "difficulty breathing", "unconscious", "stroke", "bleeding", "severe", "emergency", "ambulance"];
  const teleconsultKeywords = ["fever", "cough", "pain", "vomiting", "diarrhea", "rash", "infection", "diabetes"];

  const isEmergency = emergencyKeywords.some((k) => lowerSymptoms.some((s) => s.includes(k)));
  const isTeleconsult = teleconsultKeywords.some((k) => lowerSymptoms.some((s) => s.includes(k)));

  if (isEmergency) {
    return {
      category: "EMERGENCY",
      condition: "Urgent Medical Attention",
      probability: 85,
      description: "Your symptoms may require immediate medical attention. Please go to the nearest hospital or call 108.",
      nextSteps: ["Call 108 immediately", "Go to nearest hospital", "Do not eat or drink", "Stay calm and rest"],
      followUpIn: "immediately",
    };
  }

  if (isTeleconsult) {
    return {
      category: "TELECONSULT",
      condition: "Common Viral Illness",
      probability: 70,
      description: "Your symptoms suggest a common infection. A doctor consultation is recommended within the next 24 hours.",
      nextSteps: ["Book a teleconsultation", "Rest and stay hydrated", "Take temperature every 6 hours", "Avoid self-medication"],
      followUpIn: "24 hours",
    };
  }

  return {
    category: "HOME_CARE",
    condition: "Mild Discomfort",
    probability: 65,
    description: "Your symptoms appear mild. Home care with rest and hydration should help.",
    nextSteps: ["Rest adequately", "Drink plenty of fluids", "Eat light meals", "Monitor for worsening symptoms"],
    followUpIn: "48-72 hours if not improved",
  };
}
