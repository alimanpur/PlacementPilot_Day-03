import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getStageLabel(stage) {
  const labels = {
    wishlist: 'Wishlist',
    ready_to_apply: 'Ready to Apply',
    applied: 'Applied',
    online_assessment: 'Online Assessment',
    technical_interview: 'Technical Interview',
    managerial_interview: 'Managerial Interview',
    hr_interview: 'HR Interview',
    offer: 'Offer',
    accepted: 'Accepted',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  }
  return labels[stage] || stage
}

export function getStatusLabel(status) {
  const labels = {
    active: 'Active',
    pending: 'Pending',
    on_hold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return labels[status] || status
}
