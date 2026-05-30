import { motion } from 'framer-motion'
import { Briefcase, GraduationCap, Code, School, BookOpen, Home, FileText, Layers } from 'lucide-react'

const iconMap = {
  'Placements': Briefcase,
  'Internships': GraduationCap,
  'DSA': Code,
  'College FAQ': School,
  'Academics': BookOpen,
  'Hostel': Home,
  'Exams': FileText,
}

export default function CategoryPills({ categories = [], activeCategory, onSelect }) {
  const allCategories = [{ id: 'all', name: 'All' }, ...categories]

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
      {allCategories.map((cat) => {
        const isActive = activeCategory === cat.name || (cat.name === 'All' && !activeCategory)
        const Icon = iconMap[cat.name] || Layers

        return (
          <motion.button
            key={cat.id}
            onClick={() => onSelect(cat.name === 'All' ? null : cat.name)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
              transition-all duration-300 shrink-0
              ${isActive
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            layout
          >
            <Icon className="w-4 h-4" />
            {cat.name}
          </motion.button>
        )
      })}
    </div>
  )
}
