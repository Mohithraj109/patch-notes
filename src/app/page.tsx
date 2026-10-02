import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[#c8f135] text-xs font-mono font-bold tracking-widest uppercase">
            ▸ PATCH NOTES
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#888] hover:text-[#e8e8e8] text-xs transition-colors"
          >
            GitHub
          </a>
          <Link
            href="/dashboard"
            className="text-xs bg-[#c8f135] text-black px-4 py-2 font-bold hover:bg-[#a4c82a] transition-colors"
          >
            OPEN APP →
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center max-w-4xl mx-auto w-full">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 border border-[#2a2a2a] px-3 py-1.5 text-xs text-[#888]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c8f135] animate-pulse" />
          AI-POWERED · GEMINI 2.0 FLASH
        </div>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
          Turn your Git history
          <br />
          <span className="text-[#c8f135]">into release notes.</span>
        </h1>

        <p className="text-[#888] text-base md:text-lg max-w-2xl mb-4 leading-relaxed">
          Patch Notes reads your commits, filters noise, groups related changes,
          and writes human-readable release notes — automatically.
        </p>

        <p className="text-[#555] text-sm mb-12">
          The LLM handles language. Deterministic code handles logic.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link
            href="/dashboard"
            className="bg-[#c8f135] text-black text-sm font-bold px-8 py-4 hover:bg-[#a4c82a] transition-colors"
          >
            GENERATE PATCH NOTES →
          </Link>
          <a
            href="#how-it-works"
            className="border border-[#2a2a2a] text-[#888] text-sm px-8 py-4 hover:border-[#3a3a3a] hover:text-[#e8e8e8] transition-colors"
          >
            HOW IT WORKS
          </a>
        </div>

        {/* Demo card */}
        <div className="mt-16 w-full max-w-2xl border border-[#2a2a2a] bg-[#111] text-left">
          <div className="border-b border-[#2a2a2a] px-4 py-3 flex items-center justify-between">
            <span className="text-[#555] text-xs">WEEKLY DIGEST — 6 COMMITS FOUND</span>
            <span className="text-[#c8f135] text-xs">WEEK 39</span>
          </div>
          <div className="px-4 py-4 space-y-4 text-sm">
            <div>
              <p className="text-[#c8f135] text-xs font-bold mb-1 tracking-widest">AUTHENTICATION</p>
              <p className="text-[#888] leading-relaxed">
                Improved the sign-in flow and fixed an issue that could redirect users
                incorrectly after authentication.
              </p>
            </div>
            <div>
              <p className="text-[#c8f135] text-xs font-bold mb-1 tracking-widest">DASHBOARD</p>
              <p className="text-[#888] leading-relaxed">
                Added faster loading states and improved the dashboard&apos;s API integration.
              </p>
            </div>
            <div>
              <p className="text-[#c8f135] text-xs font-bold mb-1 tracking-widest">NAVIGATION</p>
              <p className="text-[#888] leading-relaxed">
                Fixed mobile navigation behavior on smaller screens.
              </p>
            </div>
            <div>
              <p className="text-[#c8f135] text-xs font-bold mb-1 tracking-widest">MAINTENANCE</p>
              <p className="text-[#888] leading-relaxed">
                Cleaned up unused dependencies and refactored parts of the user service.
              </p>
            </div>
          </div>
          <div className="border-t border-[#2a2a2a] px-4 py-3 flex items-center justify-between">
            <div className="flex gap-4 text-xs text-[#555]">
              <span>3 FEATURES</span>
              <span>2 FIXES</span>
              <span>1 REFACTOR</span>
            </div>
            <span className="text-[#555] text-xs">TONE: HUMAN</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-[#2a2a2a] px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#555] text-xs tracking-widest uppercase mb-4">THE PIPELINE</p>
          <h2 className="text-2xl font-bold mb-12">How Patch Notes works</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Fetch commits',
                desc: 'Connect your GitHub repo. Patch Notes retrieves all commits for a given date range, including diffs.',
              },
              {
                num: '02',
                title: 'Filter noise',
                desc: 'Trivial commits (typos, whitespace, console.log removal) are stripped. Duplicates are deduplicated.',
              },
              {
                num: '03',
                title: 'Classify changes',
                desc: 'Commits are categorized deterministically: feature, fix, refactor, performance, security, maintenance.',
              },
              {
                num: '04',
                title: 'Group by area',
                desc: 'Related commits are grouped by product area: authentication, dashboard, navigation, API, etc.',
              },
              {
                num: '05',
                title: 'Generate with Gemini',
                desc: 'Structured change data is sent to Gemini 2.0 Flash. It writes — not invents — the release notes.',
              },
              {
                num: '06',
                title: 'Export & save',
                desc: 'Copy to clipboard, export as Markdown, or save the weekly report to your history.',
              },
            ].map((step) => (
              <div key={step.num} className="border border-[#2a2a2a] p-5">
                <p className="text-[#c8f135] text-xs font-bold mb-3">{step.num}</p>
                <h3 className="text-sm font-bold mb-2">{step.title}</h3>
                <p className="text-[#888] text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#2a2a2a] px-6 py-16 text-center">
        <p className="text-[#555] text-xs tracking-widest uppercase mb-4">READY?</p>
        <h2 className="text-2xl font-bold mb-6">Start generating in seconds.</h2>
        <Link
          href="/dashboard"
          className="inline-block bg-[#c8f135] text-black text-sm font-bold px-10 py-4 hover:bg-[#a4c82a] transition-colors"
        >
          OPEN DASHBOARD →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] px-6 py-6 flex items-center justify-between">
        <span className="text-[#555] text-xs">© 2024 PATCH NOTES</span>
        <span className="text-[#555] text-xs">BUILT WITH GEMINI · NEXT.JS · TYPESCRIPT</span>
      </footer>
    </main>
  );
}
