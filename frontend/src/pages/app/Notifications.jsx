import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { AppShell, PageHeader, PageBody } from '@/layouts/AppShell'
import { Card, StatusPill, EmptyState } from '@/components/common/atoms'
import { Button } from '@/components/common/Button'
import { PageTransition, staggerContainer, staggerItem } from '@/components/common/PageTransition'
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '@/hooks/api'

function toneFor(tag) {
  if (tag === 'interview') return 'accent'
  if (tag === 'pipeline') return 'brand'
  if (tag === 'learning') return 'brand'
  return 'neutral'
}

export default function Notifications() {
  const { data: notifications, isLoading, error, refetch } = useNotifications()
  const markAllReadMutation = useMarkAllNotificationsRead()
  const markReadMutation = useMarkNotificationRead()
  const [localNotifications, setLocalNotifications] = useState([])

  useEffect(() => {
    if (notifications) {
      setLocalNotifications(notifications.map((n) => ({ ...n, read: false })))
    }
  }, [notifications])

  const markAllRead = () => {
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    markAllReadMutation.mutate()
  }

  const unread = localNotifications.filter((n) => !n.read).length

  if (isLoading) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="Signal center" title="Notifications" />
          <PageBody>
            <div className="grid place-items-center min-h-[400px]">
              <div className="size-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
            </div>
          </PageBody>
        </AppShell>
      </PageTransition>
    )
  }

  if (error) {
    return (
      <PageTransition>
        <AppShell>
          <PageHeader eyebrow="Signal center" title="Notifications" />
          <PageBody>
            <div className="text-center py-12 space-y-4">
              <p className="text-ink-3">Failed to load notifications.</p>
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </PageBody>
        </AppShell>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <AppShell>
        <PageHeader
          eyebrow="Signal center"
          title="Notifications"
          meta="Everything worth surfacing. Nothing that isn't."
          action={
            <Button variant="secondary" size="sm" onClick={markAllRead} disabled={unread === 0 || markAllReadMutation.isPending}>
              Mark all read
            </Button>
          }
        />
        <PageBody>
          {localNotifications.length === 0 ? (
            <EmptyState
              title="All clear, captain."
              description="No notifications right now."
            />
          ) : (
            <Card className="p-0 overflow-hidden">
              <motion.ul
                className="divide-y divide-hairline"
                role="list"
                aria-label="Notifications"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {localNotifications.map((n) => (
                  <motion.li
                    key={n._id || n.title}
                    variants={staggerItem}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 md:gap-4 px-4 md:px-6 py-4 hover:bg-surface-2 transition cursor-pointer"
                    onClick={() => {
                      if (!n.read) {
                        setLocalNotifications((prev) =>
                          prev.map((item) =>
                            item._id === n._id ? { ...item, read: true } : item,
                          ),
                        )
                        markReadMutation.mutate(n._id)
                      }
                    }}
                  >
                    <span
                      className={`size-2 rounded-full shrink-0 ${n.read ? 'bg-ink-4' : 'bg-brand'}`}
                      aria-label={n.read ? 'Read' : 'Unread'}
                    />
                    <div className="min-w-0">
                      <div
                        className={`font-medium truncate ${n.read ? 'text-ink-3' : 'text-ink'}`}
                      >
                        {n.title}
                      </div>
                      <div className="text-xs text-ink-3">{n.meta}</div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                      <StatusPill tone={toneFor(n.tag)}>{n.tag}</StatusPill>
                      <span className="text-[11px] font-mono text-ink-4 hidden sm:block">
                        {n.when}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </Card>
          )}
        </PageBody>
      </AppShell>
    </PageTransition>
  )
}
