import { type LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string;
    trend: string;
    trendUp: boolean;
    icon: LucideIcon;
    color: string;
}

const StatsCard = ({ title, value, trend, trendUp, icon: Icon, color }: StatsCardProps) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
                    <Icon size={24} className={`text-${color.split('-')[1]}-600`} />
                </div>
                <span className={`text-sm font-medium ${trendUp ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            </div>
        </div>
    );
};

export default StatsCard;
