import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, BookOpen, Download, ExternalLink, Library, Plus, RefreshCw, Search, Star, TrendingUp, User } from "lucide-react";
import { useEffect, useState } from "react";
import StatCard from "./StatCard";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import BookCard from "./BookCard";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import AddBookModal from "./AddBookModal";
import ConfirmModal from "./ConfirmModal";
import debounce from "lodash.debounce";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = 'http://127.0.0.1:8000';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 }
    }
};

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            staggerChildren: 0.1
        }
    }
};

// -----------------------------
// API helpers
// -----------------------------
const fetchBooks = async () => {
    const res = await fetch(`${API_BASE_URL}/api/books/`);
    if (!res.ok) throw new Error("Failed to fetch books");
    return res.json();
};

const fetchStats = async () => {
    const res = await fetch(`${API_BASE_URL}/api/report/`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
};

// -----------------------------
// Google Books Search w/ Debounce
// -----------------------------
const GoogleBooksSearch = ({ onBookAdded }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);

    const doSearch = async (query) => {
        if (!query.trim()) return;
        setIsLoading(true);
        setResult(null);

        try {
            const res = await fetch(`${API_BASE_URL}/api/fetch-book-info/${encodeURIComponent(query)}/?save=true`);
            const data = await res.json();
            if (res.ok) {
                setResult({ type: "success", data });
                if (data.saved_to_db && onBookAdded) onBookAdded(data);
            } else {
                setResult({ type: "error", message: data.error });
            }
        } catch (err) {
            setResult({ type: "error", message: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    // debounce search calls
    const debouncedSearch = debounce(doSearch, 500);

    return (
        <motion.div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Search className="w-5 h-5 mr-2 text-blue-600" />
                Google Books Search
            </h3>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        debouncedSearch(e.target.value);
                    }}
                    placeholder="Enter book title..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <motion.button
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Search"}
                </motion.button>
            </div>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-md mt-4 ${result.type === "success" ? "bg-green-50" : "bg-red-50"}`}
                    >
                        {result.type === "success" ? (
                            <>
                                <p className="font-medium">✓ Found: {result.data.title}</p>
                                <p>Author(s): {result.data.authors?.join(", ")}</p>
                            </>
                        ) : (
                            <p>Error: {result.message}</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};


export default function BooksApp() {
    const [isMobile, setIsMobile] = useState(false);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, book: null });

    const queryClient = useQueryClient();

    // Queries
    const { data: books = [], isLoading: booksLoading } = useQuery(["books"], fetchBooks);
    const { data: stats = {}, isLoading: statsLoading } = useQuery(["stats"], fetchStats);

    // Mutations
    const addBookMutation = useMutation(
        (book) => fetch(`${API_BASE_URL}/api/books/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(book),
        }).then((res) => res.json()),
        {
            onSuccess: (newBook) => {
                queryClient.setQueryData(["books"], (old = []) => [...old, newBook]);
                queryClient.invalidateQueries(["stats"]);
            },
        }
    );

    const editBookMutation = useMutation(
        ({ id, data }) => fetch(`${API_BASE_URL}/api/books/${id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then((res) => res.json()),
        {
            onSuccess: (updatedBook) => {
                queryClient.setQueryData(["books"], (old = []) =>
                    old.map((b) => (b.id === updatedBook.id ? updatedBook : b))
                );
                queryClient.invalidateQueries(["stats"]);
            },
        }
    );

    const deleteBookMutation = useMutation(
        (id) => fetch(`${API_BASE_URL}/api/books/${id}/`, { method: "DELETE" }),
        {
            onSuccess: (_, id) => {
                queryClient.setQueryData(["books"], (old = []) => old.filter((b) => b.id !== id));
                queryClient.invalidateQueries(["stats"]);
            },
        }
    );

    const isLoading = booksLoading || statsLoading;

    // Check mobile screen
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const deleteBook = async (bookId) => {
        setConfirmDelete({ isOpen: true, bookId });
    };

    const renderDashboard = () => (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Hero Section */}
            <motion.div variants={itemVariants} className="text-center py-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Welcome to Your Book Collection
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Manage your personal library, discover new books, and track your reading journey
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Books"
                    value={stats?.total_books || 0}
                    icon={BookOpen}
                    color="border-blue-500"
                    trend={5}
                />
                <StatCard
                    title="Average Rating"
                    value={stats?.average_rating || 0}
                    icon={Star}
                    color="border-yellow-500"
                />
                <StatCard
                    title="Authors"
                    value={stats?.top_authors?.length || 0}
                    icon={User}
                    color="border-green-500"
                />
                <StatCard
                    title="Recent Additions"
                    value={books.filter(book =>
                        new Date(book.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    ).length}
                    icon={TrendingUp}
                    color="border-purple-500"
                    trend={12}
                />
            </div>

            {/* Charts */}
            {stats?.rating_distribution && (
                <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                        Rating Distribution
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.rating_distribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="rating" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center cursor-pointer space-x-2 p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add New Book</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('books')}
                        className="flex items-center justify-center cursor-pointer space-x-2 p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                    >
                        <Library className="w-5 h-5" />
                        <span>Browse Books</span>
                    </motion.button>

                    <motion.a
                        href={`${API_BASE_URL}/api/chart/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center cursor-pointer space-x-2 p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
                    >
                        <Download className="w-5 h-5" />
                        <span>Download Chart</span>
                    </motion.a>
                </div>
            </motion.div>

            {/* Google Books Search */}
            <GoogleBooksSearch onBookFound={() => { fetchBooks(); fetchStats(); }} />
        </motion.div>
    );

    const renderBooks = () => (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Your Books</h1>
                    <p className="text-gray-600">{books.length} books in your collection</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Book</span>
                </motion.button>
            </div>

            {/* Books Grid */}
            <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {books.map((book) => (
                    <BookCard
                        key={book.id}
                        book={book}
                        onEdit={(book) => {
                            setEditingBook(book);       // set book to edit
                            setIsAddModalOpen(true);    // open modal
                        }}
                        onDelete={deleteBook}
                    />
                ))}
            </motion.div>


            {books.length === 0 && (
                <motion.div
                    variants={itemVariants}
                    className="text-center py-12"
                >
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No books yet</h3>
                    <p className="text-gray-600 mb-6">Start building your library by adding your first book</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                        Add Your First Book
                    </motion.button>
                </motion.div>
            )}
        </motion.div>
    );

    const renderAnalytics = () => (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
                <p className="text-gray-600">Insights into your reading habits and collection</p>
            </motion.div>

            {stats && (
                <>
                    {/* Rating Distribution */}
                    <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">Rating Distribution</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.rating_distribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="rating" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Top Authors */}
                    <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">Top Authors</h3>
                        <div className="space-y-3">
                            {stats.top_authors.map((author, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${index === 0 ? 'bg-yellow-500' :
                                            index === 1 ? 'bg-gray-400' :
                                                index === 2 ? 'bg-amber-600' :
                                                    'bg-blue-500'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <span className="font-medium">{author.author}</span>
                                    </div>
                                    <span className="text-gray-600">{author.book_count} book{author.book_count !== 1 ? 's' : ''}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* API Endpoints Reference */}
                    <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">API Endpoints</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">CRUD Operations</h4>
                                <div className="space-y-2">
                                    {[
                                        { method: 'GET', endpoint: '/api/books/', desc: 'List all books', color: 'bg-green-100 text-green-800' },
                                        { method: 'POST', endpoint: '/api/books/', desc: 'Create book', color: 'bg-blue-100 text-blue-800' },
                                        { method: 'GET', endpoint: '/api/books/{id}/', desc: 'Get book details', color: 'bg-green-100 text-green-800' },
                                        { method: 'PUT', endpoint: '/api/books/{id}/', desc: 'Update book', color: 'bg-yellow-100 text-yellow-800' },
                                        { method: 'DELETE', endpoint: '/api/books/{id}/', desc: 'Delete book', color: 'bg-red-100 text-red-800' },
                                    ].map((api, index) => (
                                        <div key={index} className="flex items-center space-x-3 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${api.color}`}>
                                                {api.method}
                                            </span>
                                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">{api.endpoint}</code>
                                            <span className="text-gray-600">{api.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Special Features</h4>
                                <div className="space-y-2">
                                    {[
                                        { method: 'GET', endpoint: '/api/fetch-book-info/{title}/', desc: 'Google Books API', color: 'bg-purple-100 text-purple-800' },
                                        { method: 'GET', endpoint: '/api/report/', desc: 'Statistics report', color: 'bg-gray-100 text-gray-800' },
                                        { method: 'GET', endpoint: '/api/chart/', desc: 'Rating chart (PNG)', color: 'bg-indigo-100 text-indigo-800' },
                                    ].map((api, index) => (
                                        <div key={index} className="flex items-center space-x-3 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${api.color}`}>
                                                {api.method}
                                            </span>
                                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">{api.endpoint}</code>
                                            <span className="text-gray-600">{api.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </motion.div>
    );

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <RefreshCw className="w-8 h-8 text-blue-600" />
                    </motion.div>
                </div>
            );
        }

        switch (activeTab) {
            case 'dashboard':
                return renderDashboard();
            case 'books':
                return renderBooks();
            case 'analytics':
                return renderAnalytics();
            default:
                return renderDashboard();
        }
    };

    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
    </main>

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} setSidebarOpen={setSidebarOpen} />
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderContent()}
            </main>

            {/* Modals */}
            <AddBookModal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setEditingBook(null); }}
                initialData={editingBook}
                onSubmit={(data) => {
                    if (editingBook) {
                        editBookMutation.mutate({ id: editingBook.id, data });
                    } else {
                        addBookMutation.mutate(data);
                    }
                }}
                mode={editingBook ? "edit" : "add"}
            />

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, book: null })}
                onConfirm={() => deleteBookMutation.mutate(confirmDelete.book.id)}
                title="Delete Book"
                message={`Are you sure you want to delete "${confirmDelete.book?.title}"?`}
            />
        </div>
    );
}