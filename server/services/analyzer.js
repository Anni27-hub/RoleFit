import { analyzeWithGroq } from "./groqService.js";

const stopWords = new Set([
  "and",
  "the",
  "for",
  "with",
  "from",
  "that",
  "this",
  "will",
  "your",
  "you",
  "are",
  "our",
  "have",
  "has",
  "job",
  "role",
  "team",
  "work",
  "candidate",
  "experience"
]);

const actionVerbs = [
  "built",
  "created",
  "developed",
  "designed",
  "implemented",
  "optimized",
  "automated",
  "improved",
  "launched",
  "managed",
  "led"
];

export async function analyzeResume(input) {
  try {
    const groqResult = await analyzeWithGroq(input);
    if (groqResult) return normalizeGroqResult(groqResult);
  } catch (err) {
    console.warn(`Groq unavailable, using local analyzer: ${err.message}`);
  }

  return analyzeLocally(input);
}

function analyzeLocally({ resumeText, jobDescription, jobTitle }) {
  const resumeKeywords = extractKeywords(resumeText, 80);
  const jdKeywords = extractKeywords(jobDescription, 80);
  const resumeSet = new Set(resumeKeywords.map((item) => item.word));
  const matched = jdKeywords.filter((item) => resumeSet.has(item.word));
  const missing = jdKeywords.filter((item) => !resumeSet.has(item.word));
  const keywordScore = Math.round((matched.length / Math.max(jdKeywords.length, 1)) * 100);
  const atsScore = scoreAts(resumeText);
  const impactScore = scoreImpact(resumeText);
  const verbScore = scoreActionVerbs(resumeText);
  const matchScore = clamp(Math.round(keywordScore * 0.45 + atsScore * 0.2 + impactScore * 0.2 + verbScore * 0.15));

  return {
    matchScore,
    sectionScores: [
      { section: "ATS Readability", score: atsScore },
      { section: "Keyword Match", score: clamp(keywordScore + 8) },
      { section: "Experience Fit", score: clamp(Math.round((keywordScore + verbScore) / 2)) },
      { section: "Impact", score: impactScore }
    ],
    strengths: buildStrengths(matched, impactScore, verbScore),
    weaknesses: buildWeaknesses(missing, impactScore, atsScore),
    matchedKeywords: matched.slice(0, 16).map((item) => item.word),
    missingKeywords: missing.slice(0, 18).map((item) => item.word),
    improvedSummary: buildSummary(jobTitle, matched, missing),
    bulletRewrites: buildBulletRewrites(resumeText, missing.slice(0, 4).map((item) => item.word)),
    skillGapRoadmap: buildRoadmap(missing.slice(0, 7).map((item) => item.word), matchScore)
  };
}

function normalizeGroqResult(result) {
  return {
    matchScore: clamp(Number(result.matchScore) || 0),
    sectionScores: Array.isArray(result.sectionScores) ? result.sectionScores : [],
    strengths: arrayOfStrings(result.strengths),
    weaknesses: arrayOfStrings(result.weaknesses),
    matchedKeywords: arrayOfStrings(result.matchedKeywords),
    missingKeywords: arrayOfStrings(result.missingKeywords),
    improvedSummary: String(result.improvedSummary || ""),
    bulletRewrites: Array.isArray(result.bulletRewrites) ? result.bulletRewrites : [],
    skillGapRoadmap: arrayOfStrings(result.skillGapRoadmap)
  };
}

function extractKeywords(text, limit) {
  const counts = new Map();
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim().replace(/^-|-$/g, ""))
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));

  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, limit);
}

function scoreAts(text) {
  const lower = text.toLowerCase();
  const sections = ["experience", "education", "skills", "projects", "summary"].filter((section) =>
    lower.includes(section)
  ).length;
  return clamp(45 + sections * 10);
}

function scoreImpact(text) {
  const metrics = (text.match(/\b\d+%?|\b\d+x\b|\b\d+\+\b/gi) || []).length;
  return clamp(38 + metrics * 12);
}

function scoreActionVerbs(text) {
  const lower = text.toLowerCase();
  const hits = actionVerbs.filter((verb) => lower.includes(verb)).length;
  return clamp(35 + hits * 8);
}

function buildStrengths(matched, impactScore, verbScore) {
  const strengths = [];
  if (matched.length) strengths.push(`The resume already matches ${Math.min(matched.length, 16)} important JD keywords.`);
  if (impactScore >= 65) strengths.push("Several bullets include measurable impact.");
  if (verbScore >= 65) strengths.push("Experience uses strong action-oriented language.");
  return strengths.length ? strengths : ["The resume has enough content to begin tailoring for this role."];
}

function buildWeaknesses(missing, impactScore, atsScore) {
  const weaknesses = [];
  if (missing.length > 10) weaknesses.push("Several repeated job-description keywords are missing.");
  if (impactScore < 60) weaknesses.push("Add more numbers, scope, results, or measurable outcomes.");
  if (atsScore < 70) weaknesses.push("Use clearer resume sections like Summary, Skills, Experience, Projects, and Education.");
  return weaknesses.length ? weaknesses : ["No major local-analysis weaknesses found."];
}

function buildSummary(jobTitle, matched, missing) {
  const role = jobTitle || "the target role";
  const matchedText = matched.slice(0, 4).map((item) => item.word).join(", ");
  const missingText = missing.slice(0, 3).map((item) => item.word).join(", ");
  return `Resume positioned for ${role}, with evidence around ${matchedText || "relevant skills"}. Improve fit by adding truthful proof for ${missingText || "the role's highest priority requirements"}.`;
}

function buildBulletRewrites(resumeText, keywords) {
  const lines = resumeText
    .split(/\n|(?<=\.)\s+/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter((line) => line.length > 35)
    .slice(0, 3);

  const base = lines.length
    ? lines
    : ["Built web application features using modern frontend and backend tools."];

  return base.map((line, index) => {
    const keyword = keywords[index] || "role impact";
    return {
      original: line,
      improved: strengthenBullet(line, keyword),
      reason: "Adds a stronger action verb, role keyword, and clearer outcome framing."
    };
  });
}

function strengthenBullet(line, keyword) {
  const cleaned = line.replace(/\.$/, "");
  const startsWithVerb = actionVerbs.some((verb) => cleaned.toLowerCase().startsWith(verb));
  const prefix = startsWithVerb ? cleaned : `Built ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
  const metric = /\d|%/.test(cleaned) ? "" : " with measurable improvements in quality, speed, or delivery";
  return `${prefix}, applying ${keyword}${metric}.`;
}

function buildRoadmap(missingKeywords, score) {
  const roadmap = [
    `Add truthful evidence for these JD keywords: ${missingKeywords.slice(0, 5).join(", ") || "role-specific tools"}.`,
    "Rewrite the top experience bullets with action verb + tool + task + measurable result.",
    "Move the most relevant skills and projects into the top half of the resume."
  ];
  if (score < 70) roadmap.push("Create one project or portfolio proof point that mirrors the job's core responsibility.");
  return roadmap;
}

function arrayOfStrings(value) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
