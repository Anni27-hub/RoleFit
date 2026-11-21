import * as cheerio from "cheerio";

const COMMON_SELECTORS = [
  ".show-more-less-html__markup", // LinkedIn public
  ".description__text", // LinkedIn
  "#jobDescriptionText", // Indeed
  "#content", // Greenhouse
  ".job-post", // Greenhouse
  ".section-wrapper", // Lever
  ".posting-description", // Lever
  '[data-automation-id="jobPostingDescription"]', // Workday
  ".job-description",
  "#job-description",
  ".jobDescription",
  '[class*="job-description"]',
  '[class*="jobDescription"]',
  '[id*="job-description"]',
  "article",
  "main"
];

export async function extractJobFromUrl(rawUrl) {
  let url = String(rawUrl || "").trim();
  if (!url) {
    const error = new Error("Job URL is required.");
    error.status = 400;
    throw error;
  }

  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (err) {
    const error = new Error("Invalid URL format.");
    error.status = 400;
    throw error;
  }

  const isLinkedIn = /linkedin\.com/i.test(parsedUrl.hostname);

  // Strategy 1: Direct fetch with specialized User-Agent (Googlebot bypasses LinkedIn's 429 wall)
  let html = "";
  try {
    const headers = isLinkedIn
      ? {
          "User-Agent":
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9"
        }
      : {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9"
        };

    const response = await fetch(parsedUrl.toString(), {
      headers,
      redirect: "follow"
    });

    if (response.ok) {
      html = await response.text();
    }
  } catch (fetchErr) {
    console.warn("Direct fetch failed, falling back to clean proxy reader...", fetchErr.message);
  }

  // Strategy 2: If direct fetch failed or was blocked, fallback to reader proxy (r.jina.ai)
  if (!html || html.length < 500) {
    try {
      const fallbackUrl = `https://r.jina.ai/${parsedUrl.toString()}`;
      const response = await fetch(fallbackUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "text/plain"
        }
      });
      if (response.ok) {
        const markdown = await response.text();
        return parseMarkdownJob(markdown, url);
      }
    } catch (fallbackErr) {
      console.warn("Fallback reader also failed:", fallbackErr.message);
    }
  }

  if (!html || html.length < 200) {
    const error = new Error(
      "Could not load the job page. The posting may be expired or blocked. Please paste the job description text directly."
    );
    error.status = 400;
    throw error;
  }

  const $ = cheerio.load(html);

  // Remove non-content elements
  $("script, style, noscript, nav, header, footer, svg, iframe, form, button").remove();

  // Extract title
  let jobTitle =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $("h1").first().text().trim() ||
    $("title").text().trim();

  jobTitle = jobTitle
    .replace(/\s*[-|–—]\s*(LinkedIn|Indeed|Glassdoor|Workday|Greenhouse|Lever|Jobs).*$/i, "")
    .trim();

  // Extract company
  let company =
    $('meta[property="og:site_name"]').attr("content") ||
    $('[class*="company"]').first().text().trim() ||
    "";

  // Extract description
  let jobText = "";
  for (const selector of COMMON_SELECTORS) {
    const el = $(selector);
    if (el.length > 0) {
      const text = el.text().trim();
      if (text.length > 200) {
        jobText = text;
        break;
      }
    }
  }

  if (!jobText || jobText.length < 150) {
    jobText =
      $('meta[property="og:description"]').attr("content") ||
      $("body").text().trim();
  }

  jobText = cleanExtractedText(jobText);

  if (jobText.length < 80) {
    const error = new Error(
      "Could not extract enough job text from the URL. Please copy and paste the job description text directly."
    );
    error.status = 400;
    throw error;
  }

  return {
    jobTitle: jobTitle || "Target Role",
    company: company || "",
    jobDescription: jobText,
    sourceUrl: url
  };
}

function parseMarkdownJob(markdown, sourceUrl) {
  const lines = markdown.split("\n");
  let jobTitle = "";

  for (const line of lines.slice(0, 15)) {
    if (/^Title:\s*/i.test(line)) {
      jobTitle = line.replace(/^Title:\s*/i, "").trim();
      jobTitle = jobTitle
        .replace(/\s*[-|–—]\s*(LinkedIn|Indeed|Glassdoor|Workday|Greenhouse|Lever|Jobs).*$/i, "")
        .trim();
      break;
    }
  }

  // Remove markdown headers/navigation links
  let cleanBody = markdown
    .replace(/\[Skip to main content\].*?\n/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "$1")
    .trim();

  cleanBody = cleanExtractedText(cleanBody);

  return {
    jobTitle: jobTitle || "Target Role",
    company: "",
    jobDescription: cleanBody,
    sourceUrl
  };
}

function cleanExtractedText(text) {
  let cleaned = String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*\n+/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  if (cleaned.length > 6000) {
    cleaned = cleaned.substring(0, 6000) + "...";
  }

  return cleaned;
}
