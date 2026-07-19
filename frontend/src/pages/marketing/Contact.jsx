import { PageTransition } from '@/components/common/PageTransition'
import { MarketingShell } from '@/layouts/MarketingShell'
import { Eyebrow, Card } from '@/components/common/atoms'

export default function Contact() {
  return (
    <PageTransition>
      <MarketingShell>
        <section className="border-b border-hairline">
          <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16">
            <div>
              <Eyebrow>Say hello</Eyebrow>
              <h1 className="mt-3 font-display text-5xl md:text-6xl font-semibold text-ink tracking-tight">
                We answer, usually within a day.
              </h1>
              <p className="mt-6 text-ink-3 text-lg max-w-md">
                Whether you're a candidate with a bug, a team considering a partnership, or a
                journalist digging deeper, this reaches the right desk.
              </p>
              <dl className="mt-10 space-y-6">
                {[
                  ['Support', 'support@placementpilot.app'],
                  ['Partnerships', 'partners@placementpilot.app'],
                  ['Press', 'press@placementpilot.app'],
                ].map(([k, v]) => (
                  <div key={k} className="border-t border-hairline pt-4">
                    <dt className="eyebrow">{k}</dt>
                    <dd className="text-ink mt-1">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <Card>
              <div className="min-h-[300px] grid place-items-center text-center">
                <div>
                  <h3 className="font-display text-xl text-ink">Contact us by email</h3>
                  <p className="text-ink-3 mt-2 text-sm">
                    Reach out directly and we'll get back to you within 24 hours.
                  </p>
                  <div className="mt-6 space-y-2 text-brand">
                    <p>support@placementpilot.app</p>
                    <p>partners@placementpilot.app</p>
                    <p>press@placementpilot.app</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </MarketingShell>
    </PageTransition>
  )
}
