import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { CompanyAvatar } from './CompanyAvatar'
import { PriorityPill, StagePill } from '@/components/common/atoms'
import { cn, formatDate, getStageLabel } from '@/lib/utils'
import {
  MoreVertical,
  Edit,
  Copy,
  Archive,
  Trash2,
  ExternalLink,
  Calendar,
  DollarSign,
  MapPin,
  Briefcase,
  User,
  Clock,
  Tag,
  ChevronRight,
} from 'lucide-react'

export function PremiumKanbanCard({ application, onUpdate, onDelete, onArchive }) {
  const [showActions, setShowActions] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleQuickAction = (action, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    switch (action) {
      case 'edit':
        window.location.href = `/app/applications/${application._id}`
        break
      case 'duplicate':
        onUpdate({ id: application._id, data: { ...application, company: `${application.company} (Copy)` } })
        toast.success('Application duplicated')
        break
      case 'archive':
        onArchive({ id: application._id, archived: !application.archived })
        toast.success(application.archived ? 'Application unarchived' : 'Application archived')
        break
      case 'delete':
        if (window.confirm('Delete this application?')) {
          onDelete(application._id)
        }
        break
      default:
        break
    }
    setShowActions(false)
  }

  const daysUntilDeadline = application.deadline 
    ? Math.ceil((new Date(application.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <Link
        to={`/app/applications/${application._id}`}
        className={cn(
          'block bg-surface ring-hairline rounded-xl p-4 transition-all',
          'hover:ring-2 hover:ring-brand/30 hover:shadow-lg hover:shadow-brand/5',
          application.archived && 'opacity-60'
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <CompanyAvatar name={application.company} logo={null} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-ink truncate">
                  {application.company}
                </h3>
                <p className="text-xs text-ink-3 truncate mt-0.5">{application.role}</p>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowActions(!showActions)
                  }}
                  className={cn(
                    'p-1 rounded-md transition-all',
                    isHovered ? 'bg-surface-2 text-ink' : 'text-ink-4'
                  )}
                >
                  <MoreVertical className="size-4" />
                </button>
                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-1 w-40 bg-surface border border-hairline rounded-lg shadow-xl z-20 py-1"
                    >
                      <button
                        onClick={(e) => handleQuickAction('edit', e)}
                        className="w-full text-left px-3 py-2 text-xs text-ink hover:bg-surface-2 transition flex items-center gap-2"
                      >
                        <Edit className="size-3" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleQuickAction('duplicate', e)}
                        className="w-full text-left px-3 py-2 text-xs text-ink hover:bg-surface-2 transition flex items-center gap-2"
                      >
                        <Copy className="size-3" />
                        Duplicate
                      </button>
                      <button
                        onClick={(e) => handleQuickAction('archive', e)}
                        className="w-full text-left px-3 py-2 text-xs text-ink hover:bg-surface-2 transition flex items-center gap-2"
                      >
                        <Archive className="size-3" />
                        {application.archived ? 'Unarchive' : 'Archive'}
                      </button>
                      <button
                        onClick={(e) => handleQuickAction('delete', e)}
                        className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-surface-2 transition flex items-center gap-2"
                      >
                        <Trash2 className="size-3" />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Tags & Priority */}
        <div className="flex items-center gap-2 mb-3">
          <PriorityPill priority={application.priority}>{application.priority}</PriorityPill>
          <StagePill stage={application.currentStage}>
            {getStageLabel(application.currentStage)}
          </StagePill>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-3">
          {application.location && (
            <div className="flex items-center gap-1.5 text-xs text-ink-3">
              <MapPin className="size-3 flex-shrink-0" />
              <span className="truncate">{application.location}</span>
            </div>
          )}
          {application.package && (
            <div className="flex items-center gap-1.5 text-xs text-ink-3">
              <DollarSign className="size-3 flex-shrink-0" />
              <span>{application.currency} {application.package.toLocaleString()}</span>
            </div>
          )}
          {application.workMode && (
            <div className="flex items-center gap-1.5 text-xs text-ink-3">
              <Briefcase className="size-3 flex-shrink-0" />
              <span>{application.workMode}</span>
            </div>
          )}
        </div>

        {/* Deadline */}
        {application.deadline && (
          <div className={cn(
            'flex items-center gap-1.5 text-xs mb-3 px-2 py-1.5 rounded-md',
            daysUntilDeadline !== null && daysUntilDeadline <= 7 
              ? 'bg-red-500/10 text-red-400' 
              : 'bg-surface-2 text-ink-3'
          )}>
            <Calendar className="size-3 flex-shrink-0" />
            <span className="truncate">
              {daysUntilDeadline !== null && daysUntilDeadline <= 7 
                ? `${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''} left`
                : formatDate(application.deadline)
              }
            </span>
          </div>
        )}

        {/* Tags */}
        {application.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {application.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-ink-3"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-hairline">
          <div className="flex items-center gap-1 text-[10px] text-ink-4">
            <Clock className="size-3" />
            <span>Updated {formatDate(application.updatedAt)}</span>
          </div>
          <ChevronRight className="size-3 text-ink-4" />
        </div>
      </Link>
    </motion.div>
  )
}