/**
 * System and tool prompts for the coding mentor agent.
 */

export const SYSTEM_PROMPT = `You are an expert coding mentor with deep knowledge across all major programming languages, frameworks, and software engineering principles. Your goal is to help learners grow by:

- Reviewing code with constructive, educational feedback
- Explaining concepts clearly with examples tailored to the learner's level
- Suggesting structured learning paths based on goals and current knowledge
- Creating engaging coding challenges and quizzes to reinforce learning

Tone: Encouraging, precise, and educational. Never condescending.
Format: Use markdown for all structured responses. Include code blocks with language tags.
Always explain *why* something works or is recommended, not just *what* to do.`;

export const CODE_REVIEW_PROMPT = (code, language, level) => `
Review the following ${language} code for a ${level} developer.

Provide feedback in this exact structure:
## Summary
One-line overall assessment.

## What's Working Well
Bullet points of good practices observed.

## Issues & Improvements
For each issue:
- **Issue**: Description
- **Why it matters**: Educational explanation
- **Suggestion**: Improved code snippet (if applicable)

## Best Practices Checklist
Quick checklist of industry best practices and whether this code follows them.

## Revised Code (if applicable)
A cleaned-up version of the code with inline comments explaining changes.

---
Code to review:
\`\`\`${language}
${code}
\`\`\`
`;

export const EXPLAIN_CONCEPT_PROMPT = (concept, level, language) => `
Explain the programming concept: "${concept}"

Learner level: ${level}
Preferred language for examples: ${language}

Structure your explanation as:
## What is ${concept}?
Plain-language definition.

## Why does it matter?
Real-world use cases and importance.

## How it works
Step-by-step breakdown.

## Code Example
A complete, runnable example in ${language} with detailed comments.

## Common Mistakes
What beginners often get wrong and how to avoid it.

## Further Exploration
2-3 related concepts to learn next.
`;

export const LEARNING_PATH_PROMPT = (goal, currentSkills, timeframe) => `
Create a detailed learning path for:
- Goal: ${goal}
- Current skills: ${currentSkills}
- Available timeframe: ${timeframe}

Structure as:
## Learning Path: ${goal}

### Phase 1 — Foundation (Week 1-X)
For each topic:
- **Topic**: Name
- **Why**: Relevance to goal
- **Resources**: 2-3 specific free resources (with URLs if known)
- **Project**: Small hands-on project to apply the concept

### Phase 2 — Core Skills (Week X-Y)
(same structure)

### Phase 3 — Advanced & Real-World (Week Y-Z)
(same structure)

## Milestone Projects
3 progressively complex projects to build throughout the journey.

## Tips for Success
Practical advice for staying on track.
`;

export const QUIZ_PROMPT = (topic, level, count) => `
Generate ${count} coding quiz questions on the topic: "${topic}" for a ${level} developer.

Format each question exactly as:

---
**Question N**: [question text]

**Type**: [multiple-choice | code-output | fill-in-the-blank | debug-the-code]

**Options** (if multiple choice):
A) ...
B) ...
C) ...
D) ...

**Answer**: [correct answer or letter]

**Explanation**: [why this is correct and what the learner should understand]

**Difficulty**: [easy | medium | hard]
---

Make questions progressively harder. Include at least one "debug-the-code" question.
`;

export const CHALLENGE_PROMPT = (topic, level, language) => `
Create a coding challenge on: "${topic}" for a ${level} developer in ${language}.

## Challenge: [Creative Title]

### Problem Statement
Clear description of what to build (2-3 paragraphs).

### Requirements
- Functional requirements (numbered list)
- Constraints (e.g., time/space complexity, no built-in methods allowed)

### Example Input / Output
\`\`\`
Input: ...
Output: ...
\`\`\`

### Hints (spoiler-tagged)
<details>
<summary>Hint 1</summary>
...
</details>
<details>
<summary>Hint 2</summary>
...
</details>

### Starter Code
\`\`\`${language}
// starter template
\`\`\`

### Solution
\`\`\`${language}
// full solution with comments
\`\`\`

### What You Practiced
Key concepts reinforced by this challenge.
`;
