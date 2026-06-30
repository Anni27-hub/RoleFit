const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

export async function analyzeWithGroq({ resumeText, jobDescription, jobTitle }) {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
    return null;
  }

  const response = await fetch(groqUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are RoleFit AI, an ATS resume analyst and recruiter. Return strict JSON only. Do not invent experience. Keep rewrites truthful."
        },
        {
          role: "user",
          content: JSON.stringify({
            jobTitle,
            resumeText,
            jobDescription,
            outputShape: {
              matchScore: "number 0-100",
              sectionScores: [
                { section: "ATS Readability", score: "number 0-100" },
                { section: "Keyword Match", score: "number 0-100" },
                { section: "Experience Fit", score: "number 0-100" },
                { section: "Impact", score: "number 0-100" }
              ],
              strengths: ["short strength"],
              weaknesses: ["short weakness"],
              matchedKeywords: ["keyword"],
              missingKeywords: ["keyword"],
              improvedSummary: "better resume summary",
              bulletRewrites: [
                {
                  original: "weak or existing bullet",
                  improved: "truthful improved bullet",
                  reason: "why this is better"
                }
              ],
              skillGapRoadmap: ["specific next action"]
            }
          })
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Groq returned ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned an empty response.");

  return JSON.parse(content);
}
