import { MarketingShell } from '@/layouts/MarketingShell'
import { Eyebrow } from '@/components/common/atoms'
import { PageTransition } from '@/components/common/PageTransition'

export default function About() {
  return (
    <PageTransition>
      <MarketingShell>
        <section className="border-b border-hairline">
          <div className="max-w-4xl mx-auto px-6 py-24">
            <Eyebrow>Manifesto</Eyebrow>
            <h1 className="mt-3 font-display text-5xl md:text-6xl font-semibold text-ink tracking-tight">
              Placement is not a task list. It's a coordinated ascent.
            </h1>
            <div className="mt-10 space-y-6 text-lg text-ink-2 leading-relaxed max-w-[60ch]">
              <p>
                Two years ago, our co-founders were running placement prep out of eleven browser
                tabs, four spreadsheets, and a shared Notion that had lost the plot. They interviewed
                at forty companies and remembered almost none of it.
              </p>
              <p>
                PlacementPilot exists because preparation is fundamentally a systems problem. If your
                instruments are broken, no amount of grit will land you at your destination.
              </p>
              <p>
                We build for the candidate who takes their season seriously. Everything on our
                dashboard has to earn its place. Everything you don't need, we cut.
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
      </MarketingShell>
    </PageTransition>
  )
}
