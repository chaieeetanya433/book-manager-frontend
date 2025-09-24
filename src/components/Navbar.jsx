import { BookOpen, Home, Library, Menu, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';


const Navbar = ({ activeTab, setActiveTab, isMobile, setSidebarOpen }) => {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gradient-to-r from-blue-600 to-purple-700 shadow-lg sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-white mr-3 p-2 rounded-md hover:bg-white/10"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-white" />
              <span className="text-xl font-bold text-white">Books Manager</span>
            </div>
          </div>
          
          {!isMobile && (
            <div className="flex items-center space-x-8">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Home },
                { id: 'books', label: 'Books', icon: Library },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    activeTab === id 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar