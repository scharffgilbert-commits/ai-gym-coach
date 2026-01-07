import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkoutRequest {
  goals: {
    experienceLevel: string;
    focusAreas: string[];
    goalTypes: string[];
  };
  equipment: {
    name: string;
    category: string;
    muscleGroups: string[];
  }[];
  healthProfile?: {
    age: number;
    gender: string;
    injuries: { area: string; severity: string }[];
  };
  preferences?: {
    minutesPerWorkout: number;
    workoutsPerWeek: number;
    preferredDays: string[];
    intensity: 'light' | 'moderate' | 'intense';
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goals, equipment, healthProfile, preferences } = await req.json() as WorkoutRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const equipmentList = equipment.map(e => `- ${e.name} (${e.category}, targets: ${e.muscleGroups.join(", ")})`).join("\n");
    
    const injuryWarnings = healthProfile?.injuries?.length 
      ? `\n\nIMPORTANT - User has injuries to avoid:\n${healthProfile.injuries.map(i => `- ${i.area} (${i.severity})`).join("\n")}`
      : "";

    const intensityGuide = {
      light: 'Lower weights, higher reps (12-15), longer rest periods (90-120s). Focus on form and endurance.',
      moderate: 'Balanced approach with moderate weights, 8-12 reps, 60-90s rest. Good muscle stimulation.',
      intense: 'Higher weights, lower reps (6-8), supersets where possible, 45-60s rest. Maximum muscle engagement.',
    };

    const preferenceInstructions = preferences ? `
Training Preferences:
- Time per workout: ${preferences.minutesPerWorkout} minutes (STRICT - plan exercises to fit within this time)
- Training days per week: ${preferences.workoutsPerWeek}
- Preferred days: ${preferences.preferredDays.join(', ')} (ONLY schedule workouts on these days, rest days on other days)
- Intensity level: ${preferences.intensity} - ${intensityGuide[preferences.intensity]}
` : '';

    const systemPrompt = `You are an expert fitness coach and personal trainer AI. Create personalized workout plans that are safe, effective, and progressive.

Guidelines:
- Create exercises ONLY using the available equipment provided
- Consider the user's experience level for appropriate intensity
- Balance muscle groups across the week
- Include proper rest days on days not in the preferred training days
- Suggest appropriate sets, reps, and weights based on experience level
- Consider any injuries or limitations${injuryWarnings}
- IMPORTANT: Strictly respect the user's time and day preferences${preferenceInstructions}

Always respond with valid JSON matching the exact structure requested.`;

    const userPrompt = `Create a weekly workout plan for a user with the following profile:

Experience Level: ${goals.experienceLevel}
Focus Areas: ${goals.focusAreas.join(", ")}
Goals: ${goals.goalTypes.join(", ")}
${healthProfile ? `Age: ${healthProfile.age}, Gender: ${healthProfile.gender}` : ""}

Available Equipment:
${equipmentList || "Standard gym equipment (assume typical machines available)"}

Generate a 7-day workout plan with rest days included. For each exercise, provide:
- machineName (must match available equipment)
- sets (number)
- targetReps (number)
- targetWeight (starting weight in kg)
- restSeconds (between sets)

Respond with this exact JSON structure:
{
  "planName": "string describing the plan",
  "weeklyPlan": {
    "Monday": [{ "machineName": "", "sets": 0, "targetReps": 0, "targetWeight": 0, "restSeconds": 0 }],
    "Tuesday": [],
    "Wednesday": [],
    "Thursday": [],
    "Friday": [],
    "Saturday": [],
    "Sunday": []
  },
  "tips": ["array of 3 personalized tips for the user"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate workout plan");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Extract JSON from the response (handle markdown code blocks)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    const workoutPlan = JSON.parse(jsonContent);

    return new Response(JSON.stringify(workoutPlan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating workout:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate workout plan" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
