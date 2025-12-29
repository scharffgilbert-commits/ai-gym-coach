import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing equipment image...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert fitness equipment identifier. Analyze images of gym equipment and identify:
1. The exact name of the machine/equipment
2. The category (one of: chest, back, shoulders, arms, legs, core, cardio, functional, free-weights)
3. The muscle groups it targets (from: pectorals, deltoids, latissimus-dorsi, trapezius, biceps, triceps, quadriceps, hamstrings, glutes, calves, rectus-abdominis, obliques, erector-spinae)
4. The manufacturer if visible

Always respond with valid JSON matching this exact structure:
{
  "name": "Machine Name",
  "category": "category-id",
  "muscleGroups": ["muscle-group-1", "muscle-group-2"],
  "manufacturer": "Brand Name or null if not visible",
  "confidence": 0.95
}

Be specific with machine names (e.g., "Lat Pulldown Machine" not just "Cable Machine").
If you cannot identify the equipment, still provide your best guess with a lower confidence score.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please identify this gym equipment and provide the details in JSON format."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to analyze equipment");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response:", content);

    // Extract JSON from the response
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    } else {
      // Try to find JSON object directly
      const objectMatch = content.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonContent = objectMatch[0];
      }
    }

    const equipmentData = JSON.parse(jsonContent);

    return new Response(JSON.stringify(equipmentData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error analyzing equipment:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to analyze equipment" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
