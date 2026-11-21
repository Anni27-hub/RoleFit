import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  BorderStyle
} from "docx";

export async function generateTailoredResumeDocx({
  candidateName = "Candidate Name",
  jobTitle = "Software Engineer",
  summary = "",
  matchedKeywords = [],
  bulletRewrites = [],
  strengths = [],
  skills = []
}) {
  const docChildren = [];

  // Candidate Name
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: candidateName.toUpperCase(),
          bold: true,
          size: 32, // 16pt
          font: "Arial",
          color: "111827"
        })
      ]
    })
  );

  // Target Title Subtitle
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: jobTitle,
          bold: true,
          size: 24, // 12pt
          font: "Arial",
          color: "2563EB"
        })
      ]
    })
  );

  // PROFESSIONAL SUMMARY
  if (summary) {
    docChildren.push(createSectionHeading("PROFESSIONAL SUMMARY"));
    docChildren.push(
      new Paragraph({
        spacing: { after: 200, line: 276 },
        children: [
          new TextRun({
            text: summary,
            font: "Arial",
            size: 21,
            color: "374151"
          })
        ]
      })
    );
  }

  // CORE COMPETENCIES / KEYWORDS
  const allKeywords = [
    ...new Set([...matchedKeywords, ...skills])
  ].slice(0, 20);

  if (allKeywords.length > 0) {
    docChildren.push(createSectionHeading("CORE COMPETENCIES & KEYWORDS"));
    docChildren.push(
      new Paragraph({
        spacing: { after: 200, line: 276 },
        children: [
          new TextRun({
            text: allKeywords.join("  •  "),
            font: "Arial",
            size: 20,
            bold: true,
            color: "1F2937"
          })
        ]
      })
    );
  }

  // TAILORED EXPERIENCE & BULLETS
  if (bulletRewrites && bulletRewrites.length > 0) {
    docChildren.push(createSectionHeading("OPTIMIZED EXPERIENCE HIGHLIGHTS"));

    for (const item of bulletRewrites) {
      const textToUse = item.improved || item.original || item;
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 120, line: 276 },
          children: [
            new TextRun({
              text: typeof textToUse === "string" ? textToUse : String(textToUse),
              font: "Arial",
              size: 21,
              color: "1F2937"
            })
          ]
        })
      );
    }
  }

  // KEY STRENGTHS & VALUE SIGNALS
  if (strengths && strengths.length > 0) {
    docChildren.push(createSectionHeading("KEY STRENGTHS & VALUE PROPOSITIONS"));
    for (const strength of strengths) {
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 100, line: 276 },
          children: [
            new TextRun({
              text: String(strength),
              font: "Arial",
              size: 21,
              color: "374151"
            })
          ]
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1000,
              right: 1000
            }
          }
        },
        children: docChildren
      }
    ]
  });

  return Packer.toBuffer(doc);
}

function createSectionHeading(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    border: {
      bottom: {
        color: "D1D5DB",
        space: 4,
        style: BorderStyle.SINGLE,
        size: 6
      }
    },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 22, // 11pt
        font: "Arial",
        color: "111827",
        characterSpacing: 20
      })
    ]
  });
}
