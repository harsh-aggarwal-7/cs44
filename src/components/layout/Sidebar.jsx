import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  TrendingUp,
  Award,
  Search,
  Eye,
  MessageCircle,
  Crown,
} from 'lucide-react';
import { supabase } from '@/config/supabase';

const faqItems = [
  { id: 1, title: 'Internship Rules', description: 'Guidelines for internship registration & credits', icon: '🎯' },
  { id: 2, title: 'Placement Guidelines', description: 'Campus placement eligibility & process', icon: '💼' },
  { id: 3, title: 'Exam Policies', description: 'Examination rules, grading & re-evaluation', icon: '📝' },
  { id: 4, title: 'Hostel Rules', description: 'Hostel regulations, timings & facilities', icon: '🏠' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 },
};

function SidebarSection({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-indigo-500/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function Sidebar() {
  const [topContributors, setTopContributors] = useState([]);
  const [trendingQuestions, setTrendingQuestions] = useState([]);
  const [mostSearched, setMostSearched] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSidebarData();
  }, []);

  async function fetchSidebarData() {
    try {
      setLoading(true);

      // Top contributors - users with most verified answers
      const { data: contributors } = await supabase
        .from('answers')
        .select('user_id, users:user_id (name, avatar)')
        .eq('verification_status', 'verified')
        .limit(100);

      if (contributors) {
        const countMap = {};
        contributors.forEach(({ user_id, users }) => {
          if (!countMap[user_id]) {
            countMap[user_id] = {
              user_id,
              full_name: users?.name || 'Anonymous',
              avatar_url: users?.avatar,
              count: 0,
            };
          }
          countMap[user_id].count++;
        });
        const sorted = Object.values(countMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setTopContributors(sorted);
      }

      // Trending questions by views
      const { data: trending } = await supabase
        .from('questions')
        .select('id, title, views')
        .order('views', { ascending: false })
        .limit(5);

      if (trending) setTrendingQuestions(trending);

      // Most searched terms
      const { data: searched } = await supabase
        .from('search_analytics')
        .select('search_term')
        .limit(200);

      if (searched) {
        const termMap = {};
        searched.forEach(({ search_term }) => {
          const term = search_term?.toLowerCase().trim();
          if (term) {
            termMap[term] = (termMap[term] || 0) + 1;
          }
        });
        const sorted = Object.entries(termMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([term, count]) => ({ term, count }));
        setMostSearched(sorted);
      }
    } catch (err) {
      console.error('Sidebar data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const Skeleton = () => (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
      ))}
    </div>
  );

  return (
    <aside className="hidden lg:block w-80 shrink-0">
      <div className="sticky top-20 space-y-5">
        {/* FAQ Quick Summary */}
        <SidebarSection title="FAQ Quick Summary" icon={BookOpen}>
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-2">
            {faqItems.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <Link
                  to={`/faq/${item.id}`}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
                >
                  <span className="text-lg mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </SidebarSection>

        {/* Top Contributors */}
        <SidebarSection title="Top Contributors" icon={Award}>
          {loading ? (
            <Skeleton />
          ) : topContributors.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">No contributors yet.</p>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
              {topContributors.map((contributor, idx) => (
                <motion.div
                  key={contributor.user_id}
                  variants={itemVariants}
                  className="flex items-center gap-3"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {contributor.avatar_url ? (
                        <img src={contributor.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        contributor.full_name[0]?.toUpperCase()
                      )}
                    </div>
                    {idx === 0 && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 absolute -top-1.5 -right-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{contributor.full_name}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                    <MessageCircle className="w-3 h-3" />
                    {contributor.count}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </SidebarSection>

        {/* Trending Questions */}
        <SidebarSection title="Trending Questions" icon={TrendingUp}>
          {loading ? (
            <Skeleton />
          ) : trendingQuestions.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">No trending questions yet.</p>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-2">
              {trendingQuestions.map((q) => (
                <motion.div key={q.id} variants={itemVariants}>
                  <Link
                    to={`/question/${q.id}`}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                        {q.title}
                      </p>
                      <span className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <Eye className="w-3 h-3" />
                        {q.views || 0} views
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </SidebarSection>

        {/* Most Searched */}
        <SidebarSection title="Most Searched" icon={Search}>
          {loading ? (
            <Skeleton />
          ) : mostSearched.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">No search data yet.</p>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-wrap gap-2">
              {mostSearched.map((item) => (
                <motion.div key={item.term} variants={itemVariants}>
                  <Link
                    to={`/search?q=${encodeURIComponent(item.term)}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200"
                  >
                    {item.term}
                    <span className="text-slate-400 dark:text-slate-500">({item.count})</span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </SidebarSection>
      </div>
    </aside>
  );
}
