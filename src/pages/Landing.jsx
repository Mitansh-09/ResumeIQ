import { Link } from 'react-router-dom'

const Landing = () => (
  <div className="min-h-screen bg-ink-50">
    {/* Nav */}
    <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-cobalt-600 flex items-center justify-center">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="white">
            <path d="M2 13V5l6-3 6 3v8l-6 2-6-2z" opacity="0.9"/>
          </svg>
        </div>
        <span className="font-display text-base font-700 text-ink-900">ResumeIQ</span>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/login" className="btn-ghost">Sign in</Link>
        <Link to="/signup" className="btn-primary">Get started free →</Link>
      </div>
    </nav>

    {/* Hero */}
    <section className="max-w-4xl mx-auto px-8 pt-20 pb-24 text-center animate-fade-up">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cobalt-50 border border-cobalt-100 rounded-full mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-cobalt-500 animate-pulse-dot" />
        <span className="text-xs font-medium text-cobalt-700">Built for CS students & freshers</span>
      </div>
      <h1 className="font-display text-5xl font-800 text-ink-900 leading-[1.18] mb-5 tracking-tight">
        <span className="inline-block pb-1">Stop guessing.</span><br />
        <span className="text-cobalt-600">Know exactly where you stand.</span>
      </h1>
      <p className="text-lg text-ink-500 max-w-xl mx-auto mb-8 leading-relaxed">
        Upload your resume, paste a job description. Get a brutally honest match score, skill gap analysis, and a personalized roadmap in under 3 minutes.
      </p>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <Link to="/signup" className="btn-primary px-6 py-3 text-base">
          Analyze my resume →
        </Link>
        <Link to="/login" className="btn-secondary px-6 py-3 text-base">
          I already have an account
        </Link>
      </div>
      <p className="mt-4 text-xs text-ink-400">Free · No credit card · Takes 2 minutes to set up</p>
    </section>

    {/* Feature strips */}
    <section className="max-w-5xl mx-auto px-8 pb-24">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            emoji: '🔍',
            title: 'Resume ↔ JD Analyzer',
            desc: 'Upload your PDF. Paste any JD. Get an honest match score with category breakdowns and skill tags.',
            color: 'cobalt',
          },
          {
            emoji: '🗺️',
            title: 'Personalized Skill Roadmap',
            desc: "Based on what you're missing, we generate a phased learning roadmap with resources and milestones.",
            color: 'sage',
          },
          {
            emoji: '🎤',
            title: 'Interview Prep Mode',
            desc: 'AI-generated questions tailored to the JD and your background. Type your answer, get scored.',
            color: 'ember',
          },
        ].map((f) => (
          <div key={f.title} className="card p-6">
            <div className={`w-10 h-10 rounded-xl bg-${f.color}-50 flex items-center justify-center text-xl mb-4`}>
              {f.emoji}
            </div>
            <h3 className="text-base font-semibold text-ink-800 mb-2">{f.title}</h3>
            <p className="text-sm text-ink-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="max-w-2xl mx-auto px-8 pb-24 text-center">
      <div className="bg-ink-900 rounded-3xl p-10 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-cobalt-700 opacity-20" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-cobalt-600 opacity-10" />
        <h2 className="font-display text-2xl font-700 text-white mb-3 relative z-10">
          Your next internship call starts here.
        </h2>
        <p className="text-ink-400 text-sm mb-6 relative z-10">
          Know your gaps. Build the skills. Land the role.
        </p>
        <Link to="/signup" className="btn-primary px-6 py-3 relative z-10">
          Start for free →
        </Link>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-ink-100 py-6 text-center">
      <p className="text-xs text-ink-300">
        Built with ❤️ · ResumeIQ
      </p>
    </footer>
  </div>
)

export default Landing
