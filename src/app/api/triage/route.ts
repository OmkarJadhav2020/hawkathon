import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symptoms, message, step = 1, isOffline } = body;

    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json({ error: "No symptoms provided" }, { status: 400 });
    }

    // If offline mode or no API key, use rule-based fallback
    if (isOffline || !GEMINI_API_KEY) {
      return NextResponse.json(ruleBasedTriage(symptoms, step));
    }

    const symptomList = symptoms.join(", ");
    const currentMessage = message || symptomList;
    const conversationStep = Math.max(1, Math.min(step, 5));

    const prompt = `You are a friendly, caring medical triage assistant for rural India (GraamSehat). 
This is step ${conversationStep} of a 5-step symptom assessment conversation.
Patient's latest message: "${currentMessage}"
All symptoms mentioned so far: ${symptomList}

Rules:
- Be very empathetic, kind, and conversational in your "message" text. Show that you care.
- If step < 3 OR you need more info (e.g. duration, severity not mentioned), ask ONE clear follow-up question. OMIT the "triage" key entirely.
- If step >= 3 AND you have enough context, provide a triage result.
- ALWAYS include advice to consult a doctor or book a teleconsultation in your final evaluation message, even for home care (e.g. "It's always best to speak with a doctor to be sure...").
- Keep language simple and easy to understand.

Respond ONLY with valid JSON. No markdown, no code fences. Use this EXACT structure:
{
  "message": "Your conversational text here",
  "pills": ["Quick reply 1", "Quick reply 2", "Quick reply 3"],
  "triage": {
    "category": "TELECONSULT",
    "condition": "condition in 3-5 words",
    "probability": 75,
    "description": "one sentence action in simple words for rural patient",
    "nextSteps": ["step 1", "step 2", "step 3"],
    "followUpIn": "24 hours"
  }
}

Rules for "category": must be exactly one of: HOME_CARE, TELECONSULT, EMERGENCY
Only include "triage" key if you are confident enough to triage. Otherwise ask follow-up.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(ruleBasedTriage(symptoms, step));
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) return NextResponse.json(ruleBasedTriage(symptoms, step));

    try {
      // Strip any accidental markdown fences from Gemini output
      const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      const result = JSON.parse(cleaned);
      return NextResponse.json(result);
    } catch {
      // JSON parse failed — fall back to rule-based
      return NextResponse.json(ruleBasedTriage(symptoms, step));
    }
  } catch (error) {
    console.error("Triage API error:", error);
    return NextResponse.json(ruleBasedTriage(["unknown"], 1));
  }
}

function ruleBasedTriage(symptoms: string[], step: number = 1) {
  const lower = symptoms.map((s) => s.toLowerCase());

  // Step 1-2: ask follow-up questions instead of triaging immediately
  if (step <= 2) {
    if (step === 1) {
      return {
        message: "I understand. How long have you been experiencing these symptoms?",
        pills: ["Since today", "1–2 days", "3–5 days", "More than a week"],
      };
    }
    // Step 2 — ask severity
    return {
      message: "Are any of these conditions also present?",
      pills: ["High fever (>102°F)", "Difficulty breathing", "Chest pain", "None of these"],
    };
  }

  const emergencyKW = ["chest pain", "difficulty breathing", "unconscious", "stroke", "bleeding", "severe", "ambulance"];
  const teleconsultKW = ["fever", "cough", "pain", "vomiting", "diarrhea", "rash", "infection", "diabetes", "headache", "weakness"];

  const isEmergency = emergencyKW.some((k) => lower.some((s) => s.includes(k)));
  const isTeleconsult = teleconsultKW.some((k) => lower.some((s) => s.includes(k)));

  if (isEmergency) {
    return {
      message: "This sounds like a medical emergency. Please call 108 or go to the nearest hospital immediately.",
      pills: ["Call 108 Ambulance", "Emergency First Aid"],
      triage: {
        category: "EMERGENCY",
        condition: "Urgent Medical Attention",
        probability: 85,
        description: "Your symptoms may require immediate medical attention. Please go to the nearest hospital or call 108.",
        nextSteps: ["Call 108 immediately", "Go to nearest hospital", "Do not eat or drink", "Stay calm and rest"],
        followUpIn: "immediately",
      },
    };
  }

  if (isTeleconsult) {
    return {
      message: "Based on your symptoms, a doctor consultation is recommended within the next 24 hours.",
      pills: ["Book Teleconsult", "Find Pharmacy", "Home Care Tips"],
      triage: {
        category: "TELECONSULT",
        condition: "Possible Viral Infection",
        probability: 70,
        description: "Your symptoms suggest a common infection. A doctor consultation is recommended within the next 24 hours.",
        nextSteps: ["Book a teleconsultation", "Rest and stay hydrated", "Check temperature every 6 hours", "Avoid self-medication"],
        followUpIn: "24 hours",
      },
    };
  }

  return {
    message: "Based on what you've described, this seems manageable at home. Stay hydrated and rest. See a doctor if symptoms worsen.",
    pills: ["Book Teleconsult", "Find Pharmacy", "Home Care Tips"],
    triage: {
      category: "HOME_CARE",
      condition: "Minor Discomfort",
      probability: 65,
      description: "Your symptoms appear mild. Rest, drink fluids, and monitor. Visit a doctor if symptoms worsen.",
      nextSteps: ["Rest and stay hydrated", "Eat light meals", "Monitor temperature", "See a doctor if no improvement in 2 days"],
      followUpIn: "48 hours",
    },
  };
}
