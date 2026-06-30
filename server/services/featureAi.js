const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

async function groqJson({ system, payload, fallback }) {
  const groqKey = process.env.GROQ_API_KEY?.trim();

  if (!groqKey || groqKey === "your_groq_api_key_here") {
    return fallback();
  }
  try {
    const response = await fetch(groqUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify(payload) }
        ]
      })
    });

    if (!response.ok) {
      console.warn(`Groq returned ${response.status}, using fallback output.`);
      return fallback();
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return fallback();
    return JSON.parse(content);
  } catch (error) {
    console.warn("Groq request failed, using fallback output.", error?.message || error);
    return fallback();
  }
}

export async function generateResumeBuilder(input) {
  return groqJson({
    system:
      "You generate ATS-friendly resume content. Return strict JSON only. Keep claims truthful and concise.",
    payload: {
      type: "resume-builder",
      input,
      outputShape: {
        headline: "string",
        summary: "string",
        sections: [
          { title: "Skills", bullets: ["string"] },
          { title: "Projects", bullets: ["string"] },
          { title: "Experience", bullets: ["string"] }
        ],
        atsTips: ["string"],
        downloadText: "string"
      }
    },
    fallback: () => ({
      headline: `${input.fullName || "Your Name"} - ${input.targetRole || "Software Developer"}`,
      summary:
        "ATS-friendly builder ready. Add a short summary, role-specific skills, and measurable project bullets.",
      sections: [
        {
          title: "Skills",
          bullets: ["React, Node.js, Express, MongoDB", "REST APIs, JWT Auth, Git", "Groq API integration"]
        },
        {
          title: "Projects",
          bullets: ["Built RoleFit AI resume analyzer with scoring and AI rewrites.", "Created responsive dashboards and history views."]
        },
        {
          title: "Experience",
          bullets: ["Improved application flow with reusable React patterns.", "Integrated backend APIs with secure authentication."]
        }
      ],
      atsTips: [
        "Use clear section headers like Summary, Skills, Projects, and Experience.",
        "Place the target role title near the top of the resume.",
        "Add metrics wherever truthfully possible."
      ],
      downloadText:
        `${input.fullName || "Your Name"}\n${input.targetRole || "Software Developer"}\n\nSummary\nATS-friendly resume built for the target role.\n\nSkills\nReact, Node.js, Express, MongoDB\n\nProjects\nRoleFit AI resume analyzer\n\nExperience\nAdd your most relevant work here.`
    })
  });
}

export async function generateCoverLetter(input) {
  return groqJson({
    system:
      "You write professional cover letters. Return strict JSON only. Keep the letter specific, polished, and truthful.",
    payload: {
      type: "cover-letter",
      input,
      outputShape: {
        subject: "string",
        salutation: "string",
        body: "string",
        closing: "string",
        highlights: ["string"]
      }
    },
    fallback: () => ({
      subject: `Application for ${input.role || "the role"} at ${input.company || "your company"}`,
      salutation: "Dear Hiring Manager,",
      body:
        `I am excited to apply for the ${input.role || "target"} position at ${input.company || "your company"}. ` +
        "My background in React, Node.js, MongoDB, and AI-assisted product work makes me a strong fit for building practical, user-focused applications.\n\n" +
        "I enjoy turning messy workflows into clean interfaces, reliable backend services, and measurable user outcomes. The projects I build are designed with clarity, maintainability, and real-world usage in mind.",
      closing: "Thank you for your time and consideration.\n\nRegards,\nYour Name",
      highlights: ["Tailored to the role", "Shows technical stack", "Keeps claims grounded"]
    })
  });
}

export async function generateInterviewPrep(input) {
  return groqJson({
    system:
      "You generate interview prep questions and short coaching notes. Return strict JSON only.",
    payload: {
      type: "interview-prep",
      input,
      outputShape: {
        title: "string",
        focus: "string",
        questions: [
          { type: "Technical", question: "string", hint: "string" }
        ],
        advice: ["string"]
      }
    },
    fallback: () => ({
      title: `${input.role || "Software Engineer"} interview prep`,
      focus: "Resume, project depth, and practical system thinking",
      questions: [
        {
          type: "Technical",
          question: "How does your resume analyzer extract text from PDFs and DOCX files?",
          hint: "Explain parser choice, fallback behavior, and limitations."
        },
        {
          type: "Technical",
          question: "How would you secure and verify authentication tokens in this app?",
          hint: "Talk about JWT, Google login verification, and protected routes."
        },
        {
          type: "Behavioral",
          question: "Tell me about a time you improved a user workflow.",
          hint: "Use a clear before/after story with impact."
        }
      ],
      advice: [
        "Answer in STAR format when the question is behavioral.",
        "Mention tradeoffs instead of only listing features.",
        "Connect your answer back to the role description."
      ]
    })
  });
}

export async function generateSkillRoadmap(input) {
  return groqJson({
    system:
      "You create realistic skill roadmaps for job readiness. Return strict JSON only.",
    payload: {
      type: "skill-roadmap",
      input,
      outputShape: {
        title: "string",
        summary: "string",
        milestones: [
          { skill: "string", priority: "High|Medium|Low", duration: "string", resource: "string" }
        ],
        nextProject: "string"
      }
    },
    fallback: () => ({
      title: `${input.role || "Software Developer"} roadmap`,
      summary: "Focus on the missing job keywords and turn them into visible project proof.",
      milestones: [
        { skill: "Docker", priority: "High", duration: "1 week", resource: "Docker docs" },
        { skill: "CI/CD", priority: "High", duration: "1 week", resource: "GitHub Actions docs" },
        { skill: "System Design basics", priority: "Medium", duration: "2 weeks", resource: "NeetCode / byte-size notes" },
        { skill: "Deployment", priority: "Medium", duration: "3 days", resource: "Vercel / Render docs" }
      ],
      nextProject: "Build and deploy one resume-worthy project that uses auth, storage, and a dashboard."
    })
  });
}
