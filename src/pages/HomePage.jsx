import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Clock, ThumbsUp, Eye } from 'lucide-react'
import QuestionFeed from '@/components/questions/QuestionFeed'
import CategoryPills from '@/components/questions/CategoryPills'
import Sidebar from '@/components/layout/Sidebar'
import { useQuestions } from '@/hooks/useQuestions'
import { useCategories } from '@/hooks/useCategories'

const sortOptions = [
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'upvoted', label: 'Most Upvoted', icon: ThumbsUp },
  { value: 'viewed', label: 'Most Viewed', icon: Eye },
  { value: 'trending', label: 'Trending', icon: TrendingUp },
]

export default function HomePage() {
  const { questions, loading, fetchQuestions } = useQuestions()
  const { categories, fetchCategories } = useCategories()
  const [activeCategory, setActiveCategory] = useState(null)
  const [activeSort, setActiveSort] = useState('newest')

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchQuestions({ category: activeCategory, sort: activeSort })
  }, [activeCategory, activeSort, fetchQuestions])

  const handleCategorySelect = (category) => {
    setActiveCategory(category)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hero Section */}
      <div className="text-center mb-8 pt-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
              Community-Driven Knowledge Base
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Get Answers. Share Knowledge.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Ask questions, get verified answers from the community. All answers are reviewed for quality before going public.
          </p>
        </motion.div>
      </div>

      {/* Category Pills */}
      <div className="mb-6">
        <CategoryPills
          categories={categories}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Feed */}
        <div className="lg:col-span-8">
          {/* Sort Controls */}
          <div className="flex items-center gap-2 mb-5">
            {sortOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => setActiveSort(option.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSort === option.value
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              )
            })}
          </div>

          <QuestionFeed questions={questions} loading={loading} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 hidden lg:block">
          <Sidebar />
        </div>
      </div>
    </motion.div>
  )
}
