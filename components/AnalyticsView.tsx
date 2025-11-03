import React, { useMemo, useState } from 'react';
import { HistoryEntry, HistoryEntryWithStatus } from '../types';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsViewProps {
  history: HistoryEntryWithStatus[];
}

const COLORS = ['#0ea5e9', '#14b8a6', '#f97316', '#8b5cf6', '#ec4899', '#ef4444'];
type WorkshopSortType = 'name' | 'value';

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ history }) => {
  const [workshopSort, setWorkshopSort] = useState<WorkshopSortType>('value');

  const activitiesByMonth = useMemo(() => {
    const counts: { [key: string]: number } = {};
    history.forEach(entry => {
      const date = new Date(entry.maintenanceDate);
      const monthYear = `${date.toLocaleString('vi-VN', { month: '2-digit' })}/${date.getFullYear()}`;
      counts[monthYear] = (counts[monthYear] || 0) + 1;
    });

    const sortedMonths = Object.keys(counts).sort((a, b) => {
        const [monthA, yearA] = a.split('/');
        const [monthB, yearB] = b.split('/');
        return new Date(parseInt(yearA), parseInt(monthA) -1).getTime() - new Date(parseInt(yearB), parseInt(monthB) -1).getTime();
    });
    
    return sortedMonths.map(key => ({
      name: key,
      'Số lượng bảo trì': counts[key],
    })).slice(-12); // Get last 12 months
  }, [history]);

  const activitiesByWorkshop = useMemo(() => {
    const counts: { [key: string]: number } = {};
    history.forEach(entry => {
      counts[entry.workshopName] = (counts[entry.workshopName] || 0) + 1;
    });
    const data = Object.keys(counts).map(key => ({
      name: key,
      value: counts[key],
    }));

    if (workshopSort === 'name') {
      data.sort((a, b) => a.name.localeCompare(b.name));
    } else { // 'value'
      data.sort((a, b) => b.value - a.value);
    }
    return data;

  }, [history, workshopSort]);

  if (history.length === 0) {
    return <p className="text-center text-slate-500 dark:text-slate-400">Không có dữ liệu để phân tích.</p>;
  }

  const ChartContainer: React.FC<{title: string; children: React.ReactNode; controls?: React.ReactNode}> = ({ title, children, controls }) => (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">{title}</h3>
            {controls}
        </div>
        <div style={{ width: '100%', height: 300 }}>
            {children}
        </div>
    </div>
  );

  const workshopSortControls = (
     <div className="flex items-center space-x-2 text-sm">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Sắp xếp theo:</span>
        <button
            onClick={() => setWorkshopSort('value')}
            className={`px-3 py-1 rounded-md transition-colors ${workshopSort === 'value' ? 'bg-sky-600 text-white shadow' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
        >
            Số lượng
        </button>
        <button
            onClick={() => setWorkshopSort('name')}
            className={`px-3 py-1 rounded-md transition-colors ${workshopSort === 'name' ? 'bg-sky-600 text-white shadow' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
        >
            Tên
        </button>
    </div>
  )

  return (
    <div className="space-y-8">
      <ChartContainer title="Hoạt động bảo trì hàng tháng (12 tháng gần nhất)">
        <ResponsiveContainer>
          <BarChart data={activitiesByMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)"/>
            <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: 'currentColor', fontSize: 12 }}/>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                borderColor: '#334155',
                color: '#f1f5f9',
                borderRadius: '0.5rem'
              }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Legend wrapperStyle={{ color: 'currentColor' }} />
            <Bar dataKey="Số lượng bảo trì" fill="#38bdf8" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Phân bổ công việc theo xưởng" controls={workshopSortControls}>
        <ResponsiveContainer>
            <PieChart>
                <Pie
                    data={activitiesByWorkshop}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                >
                    {activitiesByWorkshop.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    borderColor: '#334155',
                    color: '#f1f5f9',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ color: 'currentColor', fontSize: '12px' }}/>
            </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default AnalyticsView;