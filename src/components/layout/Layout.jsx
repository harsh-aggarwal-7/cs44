import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';

export default function Layout({ children, showSidebar = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-violet-400/10 dark:bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <Navbar />

      {/* Main content – offset by navbar height */}
      <main className="flex-1 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showSidebar ? (
            <div className="flex gap-8">
              <div className="flex-1 min-w-0">{children}</div>
              <Sidebar />
            </div>
          ) : (
            children
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
