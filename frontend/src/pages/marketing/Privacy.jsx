import { MarketingShell } from '@/layouts/MarketingShell'
import { Eyebrow } from '@/components/common/atoms'
import { PageTransition } from '@/components/common/PageTransition'

const sections = [
  ['What we collect', "Account details, your application entries, your practice logs. We don't collect keystrokes, we don't sell data, and we don't share with third parties beyond infrastructure providers strictly needed to run the product."],
  ['How we store it', 'Encrypted at rest. TLS in transit. Backups rotate weekly and are encrypted separately.'],
  ['Your rights', 'Export any dataset from Settings → Data. Delete your account any time. All associated records are purged within 30 days.'],
  ['Analytics', 'We use privacy-preserving product analytics. No third-party ad networks.'],
  ['Contact', 'privacy@placementpilot.app for any request.'],
]

export default function Privacy() {
  return (
    <PageTransition>
      <MarketingShell>
        <section className="border-b border-hairline">
          <div className="max-w-3xl mx-auto px-6 py-24">
            <Eyebrow>Privacy</Eyebrow>
            <h1 className="mt-3 font-display text-5xl md:text-6xl font-semibold text-ink tracking-tight">
              You own the record.
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
