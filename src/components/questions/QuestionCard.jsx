import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronUp,
  MessageCircle,
  Eye,
  Clock,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function QuestionCard({ question, index = 0 }) {
  const {
    id,
    title,
    description,
    category,
    tags,
    vote_count = 0,
    answer_count = 0,
    views = 0,
    has_verified_answer,
    has_attachment,
    created_at,
    users,
  } = question;

  const author = users || question.author || {};
  const parsedTags = typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : Array.isArray(tags) ? tags : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <div className="flex gap-4 p-5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-indigo-500/5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
          <button className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200">
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{vote_count}</span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <Link
            to={`/question/${id}`}
            className="text-base font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1 block"
          >
            {title}
          </Link>

          {/* Description preview */}
          {description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          {/* Bottom row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Category */}
            {category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-700/50">
                {category}
              </span>
            )}

            {/* Tags */}
            {parsedTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
              >
                {tag}
              </span>
            ))}
            {parsedTags.length > 3 && (
              <span className="text-xs text-slate-400 dark:text-slate-500">+{parsedTags.length - 3}</span>
            )}

            {/* Verified answer badge */}
            {has_verified_answer && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
              {has_attachment && (
                <span className="flex items-center gap-1" title="Has attachment">
                  <Paperclip className="w-3 h-3" />
                </span>
              )}
              <span className="flex items-center gap-1" title="Answers">
                <MessageCircle className="w-3 h-3" />
                {answer_count}
              </span>
              <span className="flex items-center gap-1" title="Views">
                <Eye className="w-3 h-3" />
                {views}
              </span>
              <span className="flex items-center gap-1" title={created_at}>
                <Clock className="w-3 h-3" />
                {formatTimeAgo(created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Author avatar */}
        <div className="hidden sm:flex flex-col items-center justify-start shrink-0 pt-1">
          <Link to={`/profile/${author.id || ''}`} className="group/avatar" title={author.name || 'Anonymous'}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden ring-2 ring-transparent group-hover/avatar:ring-indigo-300 dark:group-hover/avatar:ring-indigo-600 transition-all">
              {author.avatar ? (
                <img src={author.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                (author.name?.[0] || '?').toUpperCase()
              )}
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
