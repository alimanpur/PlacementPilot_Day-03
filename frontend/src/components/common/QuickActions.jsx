import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/common/Button'
import { Card, Eyebrow } from '@/components/common/atoms'
import { useCreateCompany, useCreateGoal, useCreatePlannerTask, useLogDsaProblem, useCreateInterview } from '@/hooks/api'
import { format } from 'date-fns'

const actions = [
  { key: 'application', label: 'Add Application', icon: '📋', desc: 'Track a new company' },
  { key: 'dsa', label: 'Log DSA Problem', icon: '🧮', desc: 'Record a solved problem' },
  { key: 'interview', label: 'Schedule Interview', icon: '🎯', desc: 'Log an upcoming round' },
  { key: 'goal', label: 'Create Goal', icon: '🎯', desc: 'Set a new target' },
  { key: 'planner', label: 'Add Planner Task', icon: '📅', desc: 'Block time in your week' },
  { key: 'profile', label: 'Update Profile', icon: '👤', desc: 'Edit your candidate record' },
]

export default function QuickActions() {
  const [open, setOpen] = useState(false)
  const [activeKey, setActiveKey] = useState(null)
  const createCompany = useCreateCompany()
  const createGoal = useCreateGoal()
  const createPlannerTask = useCreatePlannerTask()
  const logDsaProblem = useLogDsaProblem()
  const createInterview = useCreateInterview()

  const [form, setForm] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    if (activeKey === 'application' && form.code && form.name && form.role) {
      createCompany.mutate({
        code: form.code.toUpperCase(), name: form.name, role: form.role,
        stage: 'Applied', progress: 5, status: 'queued', location: form.location || 'Remote', nextStep: '',
      }, { onSuccess: () => { setOpen(false); setActiveKey(null); setForm({}) } })
    } else if (activeKey === 'dsa' && form.title) {
      logDsaProblem.mutate({
        title: form.title, topic: form.topic || 'General', difficulty: form.difficulty || 'medium', platform: 'other', solvedAt: new Date(),
      }, { onSuccess: () => { setOpen(false); setActiveKey(null); setForm({}) } })
    } else if (activeKey === 'interview' && form.company && form.round && form.when) {
      createInterview.mutate({
        company: form.company, round: form.round, type: form.type || 'technical', when: new Date(form.when), status: 'upcoming',
      }, { onSuccess: () => { setOpen(false); setActiveKey(null); setForm({}) } })
    } else if (activeKey === 'goal' && form.title && form.deadline) {
      createGoal.mutate({
        title: form.title, progress: 0, deadline: form.deadline, cadence: form.cadence || 'Weekly', tone: 'brand',
      }, { onSuccess: () => { setOpen(false); setActiveKey(null); setForm({}) } })
    } else if (activeKey === 'planner' && form.title) {
      createPlannerTask.mutate({
        title: form.title, day: format(new Date(), 'EEE'), date: new Date(), hour: form.hour || '10:00', tone: 'brand',
      }, { onSuccess: () => { setOpen(false); setActiveKey(null); setForm({}) } })
    } else if (activeKey === 'profile') {
      toast.info('Navigate to Profile to edit your record.')
      setOpen(false)
      setActiveKey(null)
    }
  }

  const close = () => { setOpen(false); setActiveKey(null); setForm({}) }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 size-14 rounded-full bg-brand text-[#05130d] shadow-lg hover:brightness-110 transition flex items-center justify-center text-xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        aria-label="Quick actions"
      >
        +
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={close}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <Card>
              {!activeKey ? (
                <>
                  <Eyebrow className="mb-4">Quick actions</Eyebrow>
                  <div className="grid grid-cols-2 gap-3">
                    {actions.map((a) => (
                      <button
                        key={a.key}
                        onClick={() => setActiveKey(a.key)}
                        className="text-left rounded-lg p-4 bg-surface-2 hover:bg-surface transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        <div className="text-2xl mb-2">{a.icon}</div>
                        <div className="text-sm text-ink font-medium">{a.label}</div>
                        <div className="text-xs text-ink-3 mt-1">{a.desc}</div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={close}>Cancel</Button>
                  </div>
                </>
              ) : (
                <>
                  <Eyebrow className="mb-4">{actions.find(a => a.key === activeKey)?.label}</Eyebrow>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {activeKey === 'application' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-ink mb-1.5">Company code</label>
                          <input type="text" value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. GOOG" required className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand" />
                        </div>
                        <div>
                          <label className="block text-sm text-ink mb-1.5">Company name</label>
                          <input type="text" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Google" required className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand" />
                        </div>
                        <div>
                          <label className="block text-sm text-ink mb-1.5">Role</label>
                          <input type="text" value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Software Engineer" required className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand" />
                        </div>
                        <div>
                          <label className="block text-sm text-ink mb-1.5">Location</label>
                          <input type="text" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand" />
                        </div>
                      </div>
                    )}
                    {activeKey === 'dsa' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-ink mb-1.5">Problem title</label>
                          <input type="text" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Two Sum" required className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand" />
                        </div>
                        <div>
                          <label className="block text-sm text-ink mb-1.5">Topic</label>
                          <input type="text" value={form.topic || ''} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Arrays & Hashing" className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand" />
                        </div>
                        <div>
                          <label className="block text-sm text-ink mb-1.5">Difficulty</label>
                          <select value={form.difficulty || 'medium'} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand">
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                      </div>
                    )}
                    {activeKey === 'interview' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-ink mb-1.5">Company</label>
                          <input type="text" value={form.company || ''} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Stripe" required className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand" />
                        </div>
                        <div>
                          <label className="block text-sm text-ink mb-1.5">Round</label>
                          <input type="text" value={form.round || ''} onChange={(e) => setForm({ ...form, round: e.target.value })} placeholder="e.g. Technical Round II" required className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand" />
                        </div>
                        <div>
                          <label className="block text-sm text-ink mb-1.5">Type</label>
                          <select value={form.type || 'technical'} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand">
                            <option value="behavioral">Behavioral</option>
                            <option value="technical">Technical</option>
                            <option value="screen">Screening</option>
                            <option value="team">Team match</option>
                            <option value="onsite">Onsite</option>
                            <option value="system">System design</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-ink mb-1.5">Date & time</label>
                          <input type="datetime-local" value={form.when || ''} onChange={(e) => setForm({ ...form, when: e.target.value })} required className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
                        </div>
                      </div>
                    )}
                    {activeKey === 'goal' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-sm text-ink mb-1.5">Goal title</label>
                          <input type="text" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Solve 500 DSA problems" required className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand" />
                        </div>
                        <div>
                          <label className="block text-sm text-ink mb-1.5">Deadline</label>
                          <input type="date" value={form.deadline || ''} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
                        </div>
                        <div>
                          <label className="block text-sm text-ink mb-1.5">Cadence</label>
                          <input type="text" value={form.cadence || 'Weekly'} onChange={(e) => setForm({ ...form, cadence: e.target.value })} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand" />
                        </div>
                      </div>
                    )}
                    {activeKey === 'planner' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-sm text-ink mb-1.5">Task title</label>
                          <input type="text" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Graphs practice" required className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:ring-2 focus:ring-brand" />
                        </div>
                        <div>
                          <label className="block text-sm text-ink mb-1.5">Time</label>
                          <input type="time" value={form.hour || '10:00'} onChange={(e) => setForm({ ...form, hour: e.target.value })} className="w-full bg-surface-2 ring-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand" />
                        </div>
                      </div>
                    )}
                    {activeKey === 'profile' && (
                      <p className="text-sm text-ink-3">Navigate to Profile to edit your record.</p>
                    )}
                    {activeKey !== 'profile' && (
                      <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" size="sm" onClick={close}>Cancel</Button>
                        <Button type="submit" variant="primary" size="sm">Save</Button>
                      </div>
                    )}
                    {activeKey === 'profile' && (
                      <div className="flex justify-end">
                        <Button type="button" variant="ghost" size="sm" onClick={close}>Close</Button>
                      </div>
                    )}
                  </form>
                </>
              )}
            </Card>
          </motion.div>
        </div>
      )}
    </>
  )
}
