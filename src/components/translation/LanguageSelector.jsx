import { motion } from 'framer-motion'

export default function LanguageSelector({ languages, selectedLanguage, onSelect }) {
  return (
    <ul className="space-y-1">
      {languages.map((language) => (
        <motion.li
          key={language.code}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <button
            type="button"
            onClick={() => onSelect(language)}
            className={`w-full text-left rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              selectedLanguage === language.code
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200'
                : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {language.label}
          </button>
        </motion.li>
      ))}
    </ul>
  )
}
