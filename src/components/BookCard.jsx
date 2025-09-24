import { motion } from "framer-motion";
import { Calendar, Edit2, Star, User, X } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

const BookCard = ({ book, onEdit, onDelete }) => (
    <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02, y: -5 }}
        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
    >
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{book.title}</h3>
            <div className="flex space-x-1 ml-2">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEdit(book)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded cursor-pointer"
                >
                    <Edit2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(book.id)}
                    className="text-red-600 hover:text-red-800 p-1 rounded cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </motion.button>
            </div>
        </div>

        <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>{book.author}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(book.published_date).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center">
                <div className="flex space-x-1 mr-2">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < book.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                        />
                    ))}
                </div>
                <span className="text-sm text-gray-600">({book.rating}/5)</span>
            </div>
        </div>
    </motion.div>
);

export default BookCard