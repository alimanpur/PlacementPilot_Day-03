import { useState } from 'react'
import { toast } from 'sonner'
import { PageTransition } from '@/components/common/PageTransition'
import { MarketingShell } from '@/layouts/MarketingShell'
import { Eyebrow, Card } from '@/components/common/atoms'
import { Button } from '@/components/common/Button'
import { useSubmitContact } from '@/hooks/api'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const submitMutation = useSubmitContact()

  const handleSubmit = (e) => {
    e.preventDefault()
    submitMutation.mutate(form, {
      onSuccess: () => {
        setForm({ name: '', email: '', subject: '', message: '' })
      },
    })
  }

  return (
    <PageTransition>
      <MarketingShell>
        <section className="border-b border-hairline">
          <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16">
            <div>
              <Eyebrow>Contact</Eyebrow>
              <h1 className="mt-3 font-display text-5xl md:text-6xl font-semibold text-ink tracking-tight">
                Say hello.
              </h1>
              <p className="mt-6 text-ink-3 text-lg max-w-md">
                Have a question, feedback, or idea? Fill out the form and we will get back to you 
                as soon as possible.
              </p>
              <div className="mt-10 space-y-6">
                <div className="border-t border-hairline pt-4">
                  <dt className="eyebrow">Email</dt>
                  <dd className="text-ink mt-1">aliasgermanpurwala@gmail.com</dd>
                </div>
                <div className="border-t border-hairline pt-4">
                  <dt className="eyebrow">GitHub</dt>
                  <dd className="text-ink mt-1">
                    <a href="https://github.com/alimanpur/PlacementPilot_Day-03" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">
                      github.com/alimanpur/PlacementPilot_Day-03
                    </a>
                  </dd>
                </div>
              </div>
            </div>

            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm text-ink mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink mb-1.5">Subject</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="What is this about?"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink mb-1.5">Message</label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                    placeholder="Tell us more..."
                  />
                </div>
                <Button type="submit" loading={submitMutation.isPending} className="w-full">
                  Send message
                </Button>
              </form>
            </Card>
          </div>
        </section>
      </MarketingShell>
    </PageTransition>
  )
}
