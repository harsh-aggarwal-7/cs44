import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, Clock, CheckCircle, XCircle, AlertTriangle, Shield, Trash2, Flag, MessageSquare } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import FilePreview from '@/components/ui/FilePreview'
import { useUpvote } from '@/hooks/useUpvote'
import { useAuth } from '@/hooks/useAuth'

function timeAgo(dateString) {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

const statusConfig = {
  verified: { icon: CheckCircle, variant: 'success', label: 'Verified' },
  pending: { icon: Clock, variant: 'warning', label: 'Pending Review' },
  rejected: { icon: XCircle, variant: 'danger', label: 'Rejected' },
  spam: { icon: AlertTriangle, variant: 'danger', label: 'Spam' },
}

export default function AnswerCard({ answer, isOwner, isAdmin, onVerify, onReject, onDelete, onSpam, onFlag }) {
  const { toggleAnswerUpvote, hasUpvotedAnswer } = useUpvote()
  const { user } = useAuth()
  const [upvoted, setUpvoted] = useState(false)
  const [localUpvotes, setLocalUpvotes] = useState(answer.upvotes || 0)

  useEffect(() => {
    if (user) {
      hasUpvotedAnswer(answer.id).then(setUpvoted)
    }
  }, [answer.id, user, hasUpvotedAnswer])

  const handleUpvote = async () => {
    if (!user) return
    try {
      await toggleAnswerUpvote(answer.id)
      setUpvoted(!upvoted)
      setLocalUpvotes(prev => upvoted ? prev - 1 : prev + 1)
    } catch (err) {
      console.error('Upvote error:', err)
    }
  }

  const status = statusConfig[answer.verification_status] || statusConfig.pending
  const StatusIcon = status.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
    >
      {/* Upvote section */}
      <div className="flex flex-col items-center gap-1 pt-1">
        <button
          onClick={handleUpvote}
          disabled={!user}
          className={`p-1.5 rounded-lg transition-all duration-200 ${
            upvoted
              ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
              : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700'
          } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <span className={`text-sm font-semibold ${upvoted ? 'text-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}>
          {localUpvotes}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
          <p className="whitespace-pre-wrap">{answer.content}</p>
        </div>

        {answer.attachment_url && (
          <div className="mt-3">
            <FilePreview url={answer.attachment_url} />
          </div>
        )}

        {answer.admin_note && (answer.verification_status === 'rejected' || isAdmin) && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Admin Note</p>
            <p className="text-sm text-amber-600 dark:text-amber-300">{answer.admin_note}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar
                src={answer.users?.avatar}
                name={answer.users?.name || 'User'}
                size="sm"
              />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {answer.users?.name || 'Anonymous'}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {timeAgo(answer.created_at)}
            </span>
            <Badge variant={status.variant} icon={StatusIcon}>
              {status.label}
            </Badge>
          </div>

          {/* Admin actions */}
          {isAdmin && (
            <div className="flex items-center gap-1.5">
              {answer.verification_status !== 'verified' && (
                <button
                  onClick={() => onVerify?.(answer.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verify
                </button>
              )}
              {answer.verification_status !== 'rejected' && (
                <button
                  onClick={() => onReject?.(answer.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              )}
              <button
                onClick={() => onSpam?.(answer.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Spam
              </button>
              <button
                onClick={() => onDelete?.(answer.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
