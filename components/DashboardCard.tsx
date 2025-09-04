
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: string; // e.g., "+5% vs last month"
  bgColorClass?: string;
  textColorClass?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  bgColorClass = 'bg-white',
  textColorClass = 'text-gray-900'
}) => {
  return (
    <div className={`${bgColorClass} ${textColorClass} shadow-lg rounded-xl p-6 transition-all duration-300 hover:shadow-xl`}>
      <div className="flex items-center justify-between">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-1 text-3xl font-semibold">{value}</p>
        </div>
      </div>
      {description && (
        <p className="mt-4 text-sm text-gray-500">{description}</p>
      )}
      {trend && (
        <p className={`mt-1 text-xs ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{trend}</p>
      )}
    </div>
  );
};

export default DashboardCard;
