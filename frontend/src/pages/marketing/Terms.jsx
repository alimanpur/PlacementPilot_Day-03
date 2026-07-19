import { MarketingShell } from '@/layouts/MarketingShell'
import { Eyebrow } from '@/components/common/atoms'
import { PageTransition } from '@/components/common/PageTransition'

const sections = [
  ['Account', "You're responsible for your account credentials. One human per account."],
  ['Acceptable use', "Don't scrape, don't reverse engineer, don't attempt to disrupt service."],
  ['Payment', 'Cruise is billed monthly or yearly. Cancel any time; access continues through the paid period.'],
  ['Termination', 'We may suspend accounts that violate these terms. You may close your account any time.'],
  ['Liability', "The product is provided as-is. We're proud of it, but we're not liable for your outcomes."],
  ['Changes', 'We may update these terms; material changes will be announced by email.'],
]

export default function Terms() {
  return (
    <PageTransition>
      <MarketingShell>
        <section className="border-b border-hairline">
          <div className="max-w-3xl mx-auto px-6 py-24">
            <Eyebrow>Terms of service</Eyebrow>
            <h1 className="mt-3 font-display text-5xl md:text-6xl font-semibold text-ink tracking-tight">
              The house rules.
            </h1>
          </div>
        </section>
        <section className="py-20">
          <article className="max-w-3xl mx-auto px-6 space-y-10 text-ink-2 leading-relaxed">
            {sections.map(([h, p]) => (
              <section key={h}>
                <h2 className="font-display text-2xl text-ink mb-3">{h}</h2>
                <p>{p}</p>
              </section>
            ))}
          </article>
        </section>
      </MarketingShell>
    </PageTransition>
  )
}
