import { motion } from "framer-motion";

const cardHover = {
    rest: { scale: 1, y: 0 },
    hover: {
        scale: 1.02,
        y: -5,
        transition: { duration: 0.3, ease: "easeOut" }
    }
};

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color}`}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                {trend && (
                    <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                        {trend > 0 ? '+' : ''}{trend}% from last month
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-full bg-opacity-20 ${color.includes('blue') ? 'bg-blue-500' :
                    color.includes('green') ? 'bg-green-500' :
                        color.includes('purple') ? 'bg-purple-500' :
                            'bg-yellow-500'
                }`}>
                <Icon className={`w-8 h-8 ${color.includes('blue') ? 'text-blue-600' :
                        color.includes('green') ? 'text-green-600' :
                            color.includes('purple') ? 'text-purple-600' :
                                'text-yellow-600'
                    }`} />
            </div>
        </div>
    </motion.div>
);

export default StatCard