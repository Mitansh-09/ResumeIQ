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

const QUESTION_CATEGORIES = new Set(['technical', 'behavioral', 'system_design', 'hr'])
const QUESTION_DIFFICULTIES = new Set(['easy', 'medium', 'hard'])

const normalizeQuestion = (q, i) => ({
  id: q?.id || `q-${i + 1}`,
  question: q?.question || 'Tell me about a recent project you worked on.',
  category: QUESTION_CATEGORIES.has(q?.category) ? q.category : 'technical',
  difficulty: QUESTION_DIFFICULTIES.has(q?.difficulty) ? q.difficulty : 'medium',
  hint: q?.hint || '',
  sampleAnswer: q?.sampleAnswer || '',
})

const buildDefaultQuestions = (jobTitle = 'Software Engineer') => {
  const role = jobTitle || 'Software Engineer'
  return [
    { question: `Walk me through a recent ${role} project you built and your exact contribution.`, category: 'technical', difficulty: 'easy' },
    { question: 'How would you optimize a slow React component that re-renders too often?', category: 'technical', difficulty: 'medium' },
    { question: 'How do you structure API error handling and loading states in frontend apps?', category: 'technical', difficulty: 'medium' },
    { question: 'Tell me about a time you handled conflicting feedback from teammates.', category: 'behavioral', difficulty: 'medium' },
    { question: 'Describe a situation where you missed a deadline. What did you learn?', category: 'behavioral', difficulty: 'medium' },
    { question: 'Design a scalable resume analysis workflow for 10k daily users.', category: 'system_design', difficulty: 'hard' },
    { question: `Why do you want this ${role} role, and why should we hire you?`, category: 'hr', difficulty: 'hard' },
  ].map((q, i) => normalizeQuestion({ id: `q-${i + 1}`, ...q }, i))
}

const parseQuestionsFromPlainText = (text) => {
  // First preference: extract explicit JSON-like "question" fields if present.
  const fromQuestionFields = []
  const questionFieldRegex = /"question"\s*:\s*"((?:[^"\\]|\\.)*)"/g
  let match
  while ((match = questionFieldRegex.exec(text)) !== null) {
    const value = match[1]
      .replace(/\\n/g, ' ')
      .replace(/\\"/g, '"')
      .trim()
    if (value.length > 10) fromQuestionFields.push(value)
  }

  if (fromQuestionFields.length > 0) {
    return fromQuestionFields.slice(0, 7).map((q, i) => ({
      id: `q-${i + 1}`,
      question: q,
      category: i < 3 ? 'technical' : i < 5 ? 'behavioral' : i === 5 ? 'system_design' : 'hr',
      difficulty: i < 2 ? 'easy' : i < 5 ? 'medium' : 'hard',
      hint: '',
      sampleAnswer: '',
    }))
  }

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const stripped = lines
    .map((line) => line.replace(/^[-*•\d\s.)]+/, '').trim())
    .filter((line) => {
      if (!line || line.length < 15) return false
      if (/^[\[{]}]?$/.test(line)) return false
      if (/^"?(id|category|difficulty|hint|sampleAnswer)"?\s*:/.test(line)) return false
      return /\?$/.test(line) || /^(what|how|why|when|where|which|tell|describe|walk|explain)\b/i.test(line)
    })

  if (stripped.length === 0) return []

  return stripped.slice(0, 7).map((line, idx) => {
    const clean = line.trim()

    let category = 'technical'
    if (idx >= 3 && idx <= 4) category = 'behavioral'
    if (idx === 5) category = 'system_design'
    if (idx === 6) category = 'hr'

    return {
      id: `q-${idx + 1}`,
      question: clean || 'Tell me about a recent project you worked on.',
      category,
      difficulty: idx < 2 ? 'easy' : idx < 5 ? 'medium' : 'hard',
      hint: '',
      sampleAnswer: '',
    }
  })
}

const parseInterviewQuestionsWithRepair = async (raw) => {
  try {
    return parseJsonSafely(raw, 'Interview questions response')
  } catch {
    const repairPrompt = `
You are a strict JSON repair assistant.
Convert the following content into VALID JSON only.

Required output shape:
{
  "questions": [
    {
      "id": "<string>",
      "question": "<string>",
      "category": "technical|behavioral|system_design|hr",
      "difficulty": "easy|medium|hard",
      "hint": "<string>",
      "sampleAnswer": "<string>"
    }
  ]
}

Do not include markdown or explanation. Return only JSON.

CONTENT TO REPAIR:
${raw}
`

    const repairedRaw = await callGemini(repairPrompt)
    return parseJsonSafely(repairedRaw, 'Interview questions response')
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
  let questions = []

  try {
    const parsed = await parseInterviewQuestionsWithRepair(raw)
    questions = Array.isArray(parsed?.questions)
      ? parsed.questions.map((q, i) => normalizeQuestion(q, i))
      : []
  } catch {
    // Fallback: if JSON parsing keeps failing, try plain-text extraction.
    questions = parseQuestionsFromPlainText(raw)

    // Second fallback: ask model for simple text questions and extract lines.
    if (questions.length === 0) {
      const textPrompt = `
Generate exactly 7 interview questions for role: ${jobTitle || 'Software Engineer'}.
Use this order: 3 technical, 2 behavioral, 1 system design, 1 HR.
Return plain text only, one question per line, numbered 1 to 7.

JD:
${jdText}

Resume:
${resumeText}
`
      const textRaw = await callGemini(textPrompt, { expectJson: false })
      questions = parseQuestionsFromPlainText(textRaw)
    }
  }

  if (questions.length < 3) {
    questions = buildDefaultQuestions(jobTitle)
  }

  return { questions: questions.slice(0, 7).map((q, i) => normalizeQuestion(q, i)) }
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
