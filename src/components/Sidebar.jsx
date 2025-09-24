import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Home, Library, TrendingUp, X } from "lucide-react";

const Sidebar = ({ isOpen, setIsOpen, activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'books', label: 'Books', icon: Library },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 lg:hidden"
                    >
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <BookOpen className="w-6 h-6 text-blue-600" />
                                    <span className="font-semibold text-gray-900">Menu</span>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <nav className="p-4 space-y-2">
                            {menuItems.map(({ id, label, icon: Icon }) => (
                                <motion.button
                                    key={id}
                                    onClick={() => {
                                        setActiveTab(id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${activeTab === id
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    whileHover={{ x: 5 }}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{label}</span>
                                </motion.button>
                            ))}
                        </nav>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar