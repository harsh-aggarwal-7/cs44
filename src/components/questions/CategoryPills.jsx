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
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3">
      {allCategories.map((cat) => {
        const isActive = activeCategory === cat.name || (cat.name === 'All' && !activeCategory)
        const Icon = iconMap[cat.name] || Layers

        return (
          <motion.button
            key={cat.id}
            onClick={() => onSelect(cat.name === 'All' ? null : cat.name)}
            className={`
              flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap
              transition-all duration-300 shrink-0 cursor-pointer border backdrop-blur-md
              ${isActive
                ? 'bg-purple-500/15 border-purple-500/50 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                : 'bg-zinc-950/20 border-white/5 hover:border-purple-500/25 text-zinc-400 hover:text-zinc-200'
              }
            `}
            whileHover={{ scale: 1.02, y: -0.5 }}
            whileTap={{ scale: 0.98 }}
            layout
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400' : 'text-zinc-500'}`} />
            {cat.name}
          </motion.button>
        )
      })}
    </div>
  )
}
