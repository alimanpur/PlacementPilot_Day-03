import { motion } from 'framer-motion'
import {
  ArrowRight,
  LayoutDashboard,
  Target,
  Code2,
  CalendarDays,
  Building2,
  BarChart3,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Check,
  BookOpen,
  Route,
  Command,
} from 'lucide-react'
import { MarketingShell } from '@/layouts/MarketingShell'
import { Eyebrow, Card } from '@/components/common/atoms'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'
import { ReadinessDial, ConsistencyHeatmap, TrajectoryRow, ReadinessBars } from '@/components/charts/instruments'

const modules = [
  {
    icon: Building2,
    name: 'Companies',
    desc: 'Build a target-company radar with hiring status, priorities, and notes.',
  },
  {
    icon: LayoutDashboard,
    name: 'Applications',
    desc: 'Track every application from wishlist to offer with deadlines and follow-ups.',
  },
  {
    icon: CalendarDays,
    name: 'Interviews',
    desc: 'Log every round, capture feedback, and surface what to revise next.',
  },
  {
    icon: Code2,
    name: 'DSA Tracker',
    desc: 'Mastery-scored topics, an adaptive revision queue, and a consistency heatmap.',
  },
  {
    icon: Route,
    name: 'Planner',
    desc: 'A daily action center linking tasks to goals, interviews, and DSA.',
  },
  {
    icon: BarChart3,
    name: 'Analytics',
    desc: 'A live readiness score and trends that show exactly where to improve.',
  },
]

const features = [
  {
    icon: Target,
    title: 'One readiness number',
    desc: 'A weighted composite of coding, interviews, goals, and profile — so you always know your altitude.',
  },
  {
    icon: Sparkles,
    title: 'Guided from day one',
    desc: 'A five-step onboarding checklist turns an empty account into a live placement workspace.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by default',
    desc: 'Your data is yours. Export anytime, delete on request, and control what is shared.',
  },
  {
    icon: GraduationCap,
    title: 'Built for candidates',
    desc: 'Designed around the real weekly loop engineers practice: apply, interview, revise, repeat.',
  },
]

const steps = [
  {
    n: '01',
    title: 'Set up your deck',
    desc: 'Create your account and complete a short profile. PlacementPilot calibrates your workspace.',
  },
  {
    n: '02',
    title: 'Track the pipeline',
    desc: 'Add target companies, applications, and interviews. Everything lands on one dashboard.',
  },
  {
    n: '03',
    title: 'Practice with signal',
    desc: 'Log DSA problems and let the revision queue and heatmap guide your weakest topics.',
  },
  {
    n: '04',
    title: 'Ship your placement',
    desc: 'Follow the planner, watch your readiness climb, and walk into each interview prepared.',
  },
]

const why = [
  'Every instrument earns its place — no feature bloat.',
  'A single dashboard answers "what should I do today?"',
  'Consistency is measured, not assumed.',
  'Progress compounds because goals drive the planner.',
  'Built dark, fast, and keyboard-first (try ⌘K).',
  'No fake streaks, no vanity metrics — just signal.',
]

const faqs = [
  ['Is PlacementPilot really free to start?', 'Yes. The Ground tier is free forever. Cruise starts with a two-week trial and requires no credit card.'],
  ['Do you support candidates from all institutions?', 'Yes. PlacementPilot is built for any candidate, regardless of institution.'],
  ['Where does my data live?', 'In an encrypted, regionally-appropriate database. Export any time. Delete on request.'],
  ['Can I use it just for DSA?', 'You can. But most candidates stay for the application tracker and interview log.'],
  ['Is there a mobile app?', 'PlacementPilot is a responsive web app today. Native mobile is on the roadmap.'],
  ['How is the readiness score calculated?', 'A weighted composite of coding velocity, topic mastery, mock scores, application activity, and consistency. The full formula is visible in Settings.'],
]

const marquee = ['Applications', 'Interviews', 'DSA', 'Goals', 'Planner', 'Analytics', 'Profile', 'Achievements']

const previewHeatmap = Array.from({ length: 84 }, (_, i) => ({
  date: new Date(Date.now() - (83 - i) * 86400000).toISOString(),
  count: i < 60 ? 0 : Math.max(0, Math.round(Math.sin(i / 3) * 2 + 2)),
}))

function CTA({ to, children, variant = 'primary', className = '' }) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-base'
  const styles =
    variant === 'primary'
      ? 'bg-brand text-[#05130d] ring-1 ring-brand hover:brightness-110'
      : 'ring-hairline bg-surface text-ink hover:bg-surface-2'
  const sizes = 'px-5 py-3 text-sm'
  return (
    <a href={to} className={`${base} ${styles} ${sizes} ${className}`}>
      {children}
    </a>
  )
}

function SectionHeading({ eyebrow, title, description, center = false }) {
  return (
    <div className={center ? 'max-w-2xl mx-auto text-center' : 'max-w-2xl'}>
      {center ? <div className="flex justify-center"><Eyebrow>{eyebrow}</Eyebrow></div> : <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-ink tracking-tight">
        {title}
      </h2>
      {description ? <p className="mt-4 text-ink-3 leading-relaxed">{description}</p> : null}
    </div>
  )
}

export default function Landing() {
  return (
    <PageTransition>
      <MarketingShell>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(70% 55% at 50% -5%, rgba(16,185,129,0.18), transparent 70%), radial-gradient(40% 40% at 85% 10%, rgba(245,158,11,0.08), transparent 70%)',
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-20 text-center">
            <motion.a
              href="/features"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 ring-hairline bg-surface rounded-full px-3 py-1 mb-8 hover:bg-surface-2 transition"
            >
              <Sparkles className="size-3.5 text-brand" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-ink-3">
                The OS for placement prep
              </span>
            </motion.a>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="mx-auto font-display text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-ink text-balance max-w-[16ch]"
            >
              Fly your placement season like a mission.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
              className="mx-auto mt-6 max-w-[58ch] text-lg text-ink-3 text-pretty"
            >
              PlacementPilot is the operating system for placement preparation — one workspace to
              track companies, applications, interviews, and DSA, with a readiness score that tells
              you exactly what to do next.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <CTA to="/sign-up">
                Initialize your deck <ArrowRight className="size-4" />
              </CTA>
              <CTA to="/features" variant="secondary">
                Explore the features
              </CTA>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mt-6 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-ink-4"
            >
              <Command className="size-3.5" /> Free to start · No credit card · Keyboard-first
            </motion.div>
          </div>
        </section>

        {/* ── Logo / module marquee ────────────────────────── */}
        <section className="border-y border-hairline bg-surface/40 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-mono uppercase tracking-widest text-ink-4">
              {marquee.map((m) => (
                <span key={m} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brand/50" />
                  {m}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Platform modules (bento) ─────────────────────── */}
        <section className="border-b border-hairline py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <SectionHeading
              center
              eyebrow="Platform"
              title="Six modules. One flight deck."
              description="Each module feeds the same dashboard, so your effort in one area moves your readiness everywhere."
            />
            <motion.div
              className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-60px' }}
            >
              {modules.map((m) => (
                <motion.div key={m.name} variants={staggerItem}>
                  <Card className="h-full hover:ring-brand/30 transition">
                    <div className="size-9 rounded-md bg-brand-soft grid place-items-center mb-4">
                      <m.icon className="size-4 text-brand" />
                    </div>
                    <h3 className="text-ink font-medium mb-1.5">{m.name}</h3>
                    <p className="text-sm text-ink-3">{m.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Dashboard preview (screenshot placeholder) ──── */}
        <section className="border-b border-hairline py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
            <div>
              <SectionHeading
                eyebrow="Command deck"
                title="The dashboard answers one question."
                description="What needs my attention today? Upcoming interviews, weak topics, and overdue tasks surface automatically — no manual triage."
              />
              <ul className="mt-6 space-y-3">
                {['Live readiness score', 'Today’s focus, prioritized', 'Weak-topic radar', 'Streak and consistency'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-ink-2">
                      <span className="size-5 rounded-full bg-brand-soft grid place-items-center shrink-0">
                        <Check className="size-3 text-brand" />
                      </span>
                      {item}
                    </li>
                  ),
                )}
              </ul>
              <div className="mt-8">
                <CTA to="/sign-up" variant="secondary">
                  Start your dashboard <ArrowRight className="size-4" />
                </CTA>
              </div>
            </div>

            <div className="relative">
              <div
                className="absolute -inset-4 rounded-3xl opacity-50 blur-2xl pointer-events-none"
                aria-hidden="true"
                style={{ background: 'radial-gradient(60% 60% at 70% 30%, rgba(16,185,129,0.18), transparent 70%)' }}
              />
              <Card className="relative p-5 md:p-6 shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between mb-5">
                  <Eyebrow>Command deck · preview</Eyebrow>
                  <span className="text-[10px] font-mono text-brand uppercase tracking-widest">● Live</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-5 items-center">
                  <ReadinessDial value={72} size={140} label="Readiness" />
                  <div className="space-y-3">
                    <ReadinessBars
                      items={[
                        { label: 'Coding', value: 68 },
                        { label: 'Interview', value: 74 },
                        { label: 'Goals', value: 80 },
                        { label: 'Profile', value: 60 },
                      ]}
                    />
                  </div>
                </div>
                <div className="mt-5 space-y-2.5">
                  <TrajectoryRow code="GOOG" progress={64} stage="interview" tone="brand" />
                  <TrajectoryRow code="ATLA" progress={38} stage="applied" tone="accent" />
                  <TrajectoryRow code="UBER" progress={12} stage="wishlist" tone="muted" />
                </div>
                <div className="mt-5 pt-4 border-t border-hairline">
                  <Eyebrow className="mb-3">Consistency</Eyebrow>
                  <ConsistencyHeatmap data={previewHeatmap} cols={12} />
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* ── Feature highlights ───────────────────────────── */}
        <section className="border-b border-hairline py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <SectionHeading
              center
              eyebrow="Highlights"
              title="Signal over noise."
              description="PlacementPilot is opinionated about what matters during a placement season."
            />
            <motion.div
              className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-60px' }}
            >
              {features.map((f) => (
                <motion.div key={f.title} variants={staggerItem}>
                  <Card className="h-full">
                    <div className="size-9 rounded-md bg-accent-soft grid place-items-center mb-4">
                      <f.icon className="size-4 text-accent" />
                    </div>
                    <h3 className="text-ink font-medium mb-1.5">{f.title}</h3>
                    <p className="text-sm text-ink-3">{f.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────── */}
        <section className="border-b border-hairline py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <SectionHeading center eyebrow="How it works" title="From empty account to offer-ready." />
            <motion.div
              className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-60px' }}
            >
              {steps.map((s) => (
                <motion.div key={s.n} variants={staggerItem}>
                  <Card className="h-full">
                    <div className="font-display text-3xl text-brand/70 font-semibold mb-4 tabular-nums">{s.n}</div>
                    <h3 className="text-ink font-medium mb-1.5">{s.title}</h3>
                    <p className="text-sm text-ink-3">{s.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Why PlacementPilot ───────────────────────────── */}
        <section className="border-b border-hairline py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-[1fr_1fr] gap-12 items-start">
            <SectionHeading
              eyebrow="Why PlacementPilot"
              title="Less dashboard, more altitude."
              description="Most trackers collect data. PlacementPilot turns it into a single, calm instruction: do this next."
            />
            <motion.ul
              className="space-y-3"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-60px' }}
            >
              {why.map((w) => (
                <motion.li key={w} variants={staggerItem}>
                  <Card className="flex items-start gap-3">
                    <span className="size-5 rounded-full bg-brand-soft grid place-items-center shrink-0 mt-0.5">
                      <Check className="size-3 text-brand" />
                    </span>
                    <span className="text-sm text-ink-2">{w}</span>
                  </Card>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section className="border-b border-hairline py-20 md:py-28">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <SectionHeading center eyebrow="FAQ" title="Everything you'd think to ask." />
            <div className="mt-12 divide-y divide-hairline" role="list" aria-label="Frequently asked questions">
              {faqs.map(([q, a]) => (
                <details key={q} className="group py-5" role="listitem">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded">
                    <h3 className="font-display text-lg text-ink">{q}</h3>
                    <span className="text-ink-3 text-xl leading-none shrink-0 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="pt-3 text-sm text-ink-3 leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-ink-3">
              <BookOpen className="size-4 text-ink-4" />
              More answers in the <a href="/faq" className="text-brand hover:underline">full FAQ</a>.
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────── */}
        <section className="py-24 md:py-32">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Route className="size-4 text-brand" />
              <Eyebrow>Your placement journey starts here</Eyebrow>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight text-ink text-balance mx-auto max-w-[20ch]">
              Stop tracking. Start climbing.
            </h2>
            <p className="mt-5 text-ink-3 max-w-[52ch] mx-auto">
              Create your free account and let PlacementPilot map the next move.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <CTA to="/sign-up">
                Initialize your deck <ArrowRight className="size-4" />
              </CTA>
              <CTA to="/pricing" variant="secondary">
                See pricing
              </CTA>
            </div>
          </div>
        </section>
      </MarketingShell>
    </PageTransition>
  )
}
