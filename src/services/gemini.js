const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-flash-latest'

const MODEL_CANDIDATES = Array.from(new Set([
  GEMINI_MODEL,
  'gemini-flash-latest',
  'gemini-2.5-flash',
]))

const buildGeminiUrl = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`

const callGemini = async (prompt, { expectJson = true } = {}) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing Gemini API key. Add VITE_GEMINI_API_KEY in .env and restart dev server.')
  }

  const generationConfig = {
    temperature: 0.4,
    topP: 0.9,
    maxOutputTokens: 2048,
  }

  if (expectJson) generationConfig.responseMimeType = 'application/json'

  let lastError = null

  for (const model of MODEL_CANDIDATES) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch(buildGeminiUrl(model), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig,
          }),
        })

        if (!res.ok) {
          let details = ''
          try {
            const err = await res.json()
            details = err?.error?.message || ''
          } catch {
            // no-op
          }

          const transient = res.status === 429 || res.status >= 500
          if (transient && attempt < 2) {
            await new Promise((r) => setTimeout(r, 500 * attempt))
            continue
          }

          throw new Error(details || `Gemini API error: ${res.status}`)
        }

        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

        // Strip JSON code fences if present
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        if (!cleaned) throw new Error('Gemini returned an empty response. Please try again.')
        return cleaned
      } catch (err) {
        lastError = err
      }
    }
  }

  throw lastError || new Error('Gemini request failed. Please try again.')
}

const parseJsonSafely = (raw, contextLabel = 'AI response') => {
  try {
    return JSON.parse(raw)
  } catch {
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start !== -1 && end > start) {
      const candidate = raw.slice(start, end + 1)
      try {
        return JSON.parse(candidate)
      } catch {
        // no-op
      }
    }
    throw new Error(`${contextLabel} format was invalid. Please try again.`)
  }
}

// ─── Resume ↔ JD Analysis ─────────────────────────────────────────────────────

export const analyzeResumeVsJD = async (resumeText, jdText, jobTitle = '') => {
  const prompt = `
You are an expert tech recruiter and career coach. Analyze the following resume against the job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jdText}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "jobTitle": "${jobTitle || 'Software Engineer'}",
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence honest assessment>",
  "categoryScores": {
    "technicalSkills": <0-100>,
    "experience": <0-100>,
    "education": <0-100>,
    "softSkills": <0-100>,
    "domainKnowledge": <0-100>
  },
  "skillsPresent": ["<skill1>", "<skill2>"],
  "skillsMissing": ["<skill1>", "<skill2>"],
  "skillsPartial": ["<skill1>"],
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "improvements": ["<improvement1>", "<improvement2>", "<improvement3>"],
  "resumeBulletSuggestions": [
    { "original": "<existing bullet>", "improved": "<better version>" }
  ],
  "verdict": "<hired|strong_candidate|needs_work|not_a_fit>"
}
`
  const raw = await callGemini(prompt)
  return parseJsonSafely(raw, 'Analysis response')
}

// ─── Skill Roadmap Generator ──────────────────────────────────────────────────

export const generateRoadmap = async (missingSkills, presentSkills, jobTitle) => {
  const prompt = `
You are a senior engineering mentor. A candidate wants to become a ${jobTitle}.
They already know: ${presentSkills.join(', ')}.
They are missing: ${missingSkills.join(', ')}.

Generate a personalized learning roadmap. Return ONLY valid JSON:
{
  "roadmapTitle": "<title>",
  "estimatedWeeks": <number>,
  "phases": [
    {
      "phase": <number>,
      "title": "<phase title>",
      "duration": "<e.g. Week 1-2>",
      "skills": ["<skill>"],
      "milestones": ["<concrete thing to build/achieve>"],
      "resources": [
        { "title": "<resource name>", "type": "video|article|course|book", "url": "<url if known else null>" }
      ]
    }
  ]
}
`
  const raw = await callGemini(prompt)
  return parseJsonSafely(raw, 'Roadmap response')
}

// ─── Interview Prep ───────────────────────────────────────────────────────────

export const generateInterviewQuestions = async (jdText, resumeText, jobTitle) => {
  const prompt = `
You are an expert interviewer at a top tech company. Generate realistic interview questions for this role.

JOB DESCRIPTION: ${jdText}
CANDIDATE RESUME: ${resumeText}
ROLE: ${jobTitle}

Return ONLY valid JSON:
{
  "questions": [
    {
      "id": "<uuid>",
      "question": "<question text>",
      "category": "technical|behavioral|system_design|hr",
      "difficulty": "easy|medium|hard",
      "hint": "<brief hint for answering>",
      "sampleAnswer": "<a good sample answer in 3-4 sentences>"
    }
  ]
}

Include: 3 technical, 2 behavioral, 1 system design, 1 HR question.
`
  const raw = await callGemini(prompt)
  const parsed = parseJsonSafely(raw, 'Interview questions response')

  const questions = Array.isArray(parsed?.questions)
    ? parsed.questions.map((q, i) => ({
        id: q?.id || `q-${i + 1}`,
        question: q?.question || 'Tell me about a recent project you worked on.',
        category: q?.category || 'technical',
        difficulty: q?.difficulty || 'medium',
        hint: q?.hint || '',
        sampleAnswer: q?.sampleAnswer || '',
      }))
    : []

  if (questions.length === 0) {
    throw new Error('AI returned no interview questions. Please try again.')
  }

  return { questions }
}

// ─── Answer Feedback ──────────────────────────────────────────────────────────

export const evaluateAnswer = async (question, userAnswer, sampleAnswer) => {
  const prompt = `
Evaluate this interview answer.

Question: ${question}
User's Answer: ${userAnswer}
Expected Answer Direction: ${sampleAnswer}

Return ONLY valid JSON:
{
  "score": <0-10>,
  "strengths": ["<strength>"],
  "improvements": ["<specific improvement>"],
  "betterAnswer": "<a concise improved version>"
}
`
  const raw = await callGemini(prompt)
  return parseJsonSafely(raw, 'Answer evaluation response')
}
