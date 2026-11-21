import nodemailer from "nodemailer";

let cachedTransporter = null;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    return cachedTransporter;
  }

  // Create an Ethereal test account if no SMTP credentials exist
  console.log("No SMTP credentials found in .env. Initializing Ethereal test mailer...");
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  return cachedTransporter;
}

export async function sendAnalysisReportEmail({
  toEmail,
  candidateName = "Applicant",
  jobTitle = "Target Role",
  matchScore = 0,
  sectionScores = [],
  strengths = [],
  missingKeywords = [],
  bulletRewrites = []
}) {
  if (!toEmail) {
    const error = new Error("Recipient email address is required.");
    error.status = 400;
    throw error;
  }

  const transporter = await getTransporter();

  const appOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

  const readabilityScore =
    sectionScores.find((s) => /readability/i.test(s.section))?.score || "N/A";
  const keywordScore =
    sectionScores.find((s) => /keyword/i.test(s.section))?.score || "N/A";
  const experienceScore =
    sectionScores.find((s) => /experience/i.test(s.section))?.score || "N/A";
  const impactScore =
    sectionScores.find((s) => /impact/i.test(s.section))?.score || "N/A";

  const strengthsHtml = strengths.slice(0, 3)
    .map((s) => `<li style="margin-bottom: 6px; color: #374151;">${s}</li>`)
    .join("");

  const missingHtml = missingKeywords.slice(0, 8)
    .map(
      (k) =>
        `<span style="display: inline-block; background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; margin: 2px;">${k}</span>`
    )
    .join("");

  const sampleRewrite = bulletRewrites[0];
  const rewriteHtml = sampleRewrite
    ? `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-top: 14px;">
        <div style="font-size: 11px; font-weight: 800; color: #ef4444; text-transform: uppercase; margin-bottom: 4px;">Original:</div>
        <div style="font-size: 13px; color: #64748b; font-style: italic; text-decoration: line-through; margin-bottom: 10px;">"${sampleRewrite.original || ""}"</div>
        <div style="font-size: 11px; font-weight: 800; color: #10b981; text-transform: uppercase; margin-bottom: 4px;">AI ATS-Optimized:</div>
        <div style="font-size: 13.5px; color: #0f172a; font-weight: 600;">"${sampleRewrite.improved || ""}"</div>
      </div>
    `
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>RoleFit AI - Resume Analysis</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 24px; margin: 0;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background: #0f172a; padding: 28px 24px; text-align: center;">
          <h1 style="color: #38bdf8; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: -0.02em;">RoleFit AI</h1>
          <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">ATS Fit & Resume Diagnostic Report</p>
        </div>

        <!-- Body -->
        <div style="padding: 24px;">
          <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Hello ${candidateName},</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.55;">
            Here is your executive resume analysis report scored against the target role: <strong>${jobTitle}</strong>.
          </p>

          <!-- Overall Score Card -->
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <div style="font-size: 12px; font-weight: 750; color: #15803d; text-transform: uppercase; letter-spacing: 0.04em;">Overall Match Score</div>
            <div style="font-size: 44px; font-weight: 900; color: #166534; line-height: 1.1; margin: 6px 0;">${matchScore}<span style="font-size: 18px; font-weight: 600; color: #15803d;">/100</span></div>
          </div>

          <!-- Section Breakdown -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
              <div style="font-size: 11px; color: #64748b; font-weight: 600;">ATS Readability</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px;">${readabilityScore}%</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
              <div style="font-size: 11px; color: #64748b; font-weight: 600;">Keyword Match</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px;">${keywordScore}%</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
              <div style="font-size: 11px; color: #64748b; font-weight: 600;">Experience Fit</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px;">${experienceScore}%</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
              <div style="font-size: 11px; color: #64748b; font-weight: 600;">Measurable Impact</div>
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px;">${impactScore}%</div>
            </div>
          </div>

          <!-- Strengths -->
          ${
            strengths.length > 0
              ? `
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 14px; color: #0f172a; margin-bottom: 8px;">Key Strengths</h3>
              <ul style="padding-left: 20px; margin: 0; font-size: 13.5px; line-height: 1.5;">${strengthsHtml}</ul>
            </div>
          `
              : ""
          }

          <!-- Missing Keywords -->
          ${
            missingKeywords.length > 0
              ? `
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 14px; color: #0f172a; margin-bottom: 8px;">Missing Job Description Keywords</h3>
              <div style="line-height: 1.6;">${missingHtml}</div>
            </div>
          `
              : ""
          }

          <!-- Sample Bullet Rewrite -->
          ${
            sampleRewrite
              ? `
            <div style="margin-bottom: 24px;">
              <h3 style="font-size: 14px; color: #0f172a; margin-bottom: 4px;">Featured AI Bullet Transformation</h3>
              ${rewriteHtml}
            </div>
          `
              : ""
          }

          <!-- CTA Button -->
          <div style="text-align: center; margin: 28px 0 12px;">
            <a href="${appOrigin}/dashboard" style="display: inline-block; background: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 700;">Open Interactive Dashboard &rarr;</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
          RoleFit AI &bull; Smart Resume Optimization &bull; <a href="${appOrigin}" style="color: #0284c7; text-decoration: none;">rolefit.ai</a>
        </div>
      </div>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"RoleFit AI" <reports@rolefit.ai>',
    to: toEmail,
    subject: `Your RoleFit AI ATS Score Report: ${jobTitle} (${matchScore}/100)`,
    html
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[Email Delivered via Ethereal] Preview URL: ${previewUrl}`);
  }

  return {
    messageId: info.messageId,
    previewUrl: previewUrl || null
  };
}
