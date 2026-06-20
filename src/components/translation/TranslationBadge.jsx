import { getLanguageLabel } from '@/lib/translationService'

export default function TranslationBadge({ originalLanguage, targetLanguage }) {
  if (!originalLanguage || !targetLanguage || originalLanguage === targetLanguage) {
    return null
  }

  return (
    <div className="rounded-full border border-slate-200/70 bg-slate-50/80 dark:border-slate-700/70 dark:bg-slate-900/70 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 inline-flex items-center gap-2 mb-3">
      Viewing in {getLanguageLabel(targetLanguage)}
    </div>
  )
}
