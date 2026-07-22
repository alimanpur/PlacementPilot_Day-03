import { MarketingShell } from '@/layouts/MarketingShell'
import { Eyebrow } from '@/components/common/atoms'
import { PageTransition } from '@/components/common/PageTransition'

export default function About() {
  return (
    <PageTransition>
      <MarketingShell>
        <section className="border-b border-hairline">
          <div className="max-w-4xl mx-auto px-6 py-24">
            <Eyebrow>About PlacementPilot</Eyebrow>
            <h1 className="mt-3 font-display text-5xl md:text-6xl font-semibold text-ink tracking-tight">
              Built because the system was broken.
            </h1>
            <div className="mt-10 space-y-6 text-lg text-ink-2 leading-relaxed max-w-[60ch]">
              <p>
                PlacementPilot was built by Aliasger Manpurwala, a student who spent two years 
                navigating placement preparation across eleven browser tabs, four spreadsheets, 
                and a Notion workspace that had long since lost the plot.
              </p>
              <p>
                He interviewed at dozens of companies. Tracked applications in random docs. 
                Logged DSA problems in notebooks. And realized that every tool available was 
                either too generic or too complicated.
              </p>
              <p>
                The placement problem isn't lack of effort. It's lack of coordination. 
                Your profile, applications, interviews, DSA progress, goals, and planner 
                tasks should all work together. Instead, they're scattered across tools 
                that don't talk to each other.
              </p>
              <p>
                PlacementPilot exists to fix that. One place. One system. One coherent 
                preparation workflow. Every feature earns its place. Everything you don't 
                need is cut.
              </p>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
            {[
              ['01', 'Signal over decoration', "Every pixel exists to answer a question you'd actually ask."],
              ['02', 'Calm under pressure', 'Interview weeks are stressful enough. The tool cannot be.'],
              ['03', 'Own your data', 'Export everything. Delete anything. Your season, your record.'],
            ].map(([num, title, desc]) => (
              <div key={num} className="border-t border-hairline pt-6">
                <div className="eyebrow text-brand mb-4">Principle {num}</div>
                <h3 className="font-display text-xl text-ink mb-2">{title}</h3>
                <p className="text-sm text-ink-3">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-24 border-t border-hairline">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Eyebrow>Mission</Eyebrow>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-ink leading-tight">
              Designed and developed by Aliasger Manpurwala
            </h2>
            <p className="mt-6 text-ink-3 text-lg max-w-2xl mx-auto">
              PlacementPilot is open source. Built with React, Node.js, and MongoDB. 
              MIT Licensed. Designed for students, by a student who understands the problem 
              from the inside.
            </p>
          </div>
        </section>
      </MarketingShell>
    </PageTransition>
  )
}
