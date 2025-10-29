'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { backlogAPI } from '@/lib/api';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Subject colors matching common subjects
const SUBJECT_COLORS: { [key: string]: string } = {
  'Mathematics': '#8B5CF6', // Purple
  'Math': '#8B5CF6', // Purple (alias)
  'Physics': '#3B82F6', // Blue
  'Chemistry': '#10B981', // Green
  'Biology': '#F59E0B', // Orange
  'All': '#6B7280', // Gray
};

const DONUT_COLORS = {
  correct: '#10B981', // Green
  incorrect: '#EF4444', // Red
};

interface DailyData {
  date: string;
  Mathematics?: number;
  Math?: number;
  Physics?: number;
  Chemistry?: number;
  Biology?: number;
  All?: number;
  [key: string]: number | string | undefined;
}

interface ExpData {
  date: string;
  Mathematics?: number;
  Math?: number;
  Physics?: number;
  Chemistry?: number;
  Biology?: number;
  All?: number;
  [key: string]: number | string | undefined;
}

interface AnalyticsData {
  dailyTasks: Array<{
    date: string;
    subject_name: string;
    completed_tasks: string;
  }>;
  correctness: {
    correct_count: string;
    incorrect_count: string;
  };
  dailyExp: Array<{
    date: string;
    subject_name: string;
    exp_earned: string;
  }>;
}

export default function BacklogAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.uuid as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile();

  // Date range states
  const [dateRange, setDateRange] = useState<'7' | '14' | '28' | 'custom'>('7');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Handle date range change
  const handleDateRangeChange = (value: '7' | '14' | '28' | 'custom') => {
    setDateRange(value);
    
    // If switching to custom and dates are empty, set them to past 7 days
    if (value === 'custom' && !customStartDate && !customEndDate) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      
      setCustomStartDate(start.toISOString().split('T')[0]);
      setCustomEndDate(end.toISOString().split('T')[0]);
    }
  };

  // Data states
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Processed data for charts
  const [dailyTasksData, setDailyTasksData] = useState<DailyData[]>([]);
  const [dailyExpData, setDailyExpData] = useState<ExpData[]>([]);
  const [donutData, setDonutData] = useState<Array<{ name: string; value: number }>>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!isAuthenticated || !profile) {
        notFound();
      }
      // Users can only view their own analytics unless they're admin
      if (profile.user_id !== userId && profile.role !== 'admin') {
        notFound();
      }
    }
  }, [isAuthenticated, profile, authLoading, profileLoading, userId]);

  // Calculate date range
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();

    if (dateRange === 'custom' && customStartDate && customEndDate) {
      // For custom range, add one day to end date to include the entire end date
      const endDateObj = new Date(customEndDate);
      endDateObj.setDate(endDateObj.getDate() + 1);
      
      return {
        start: customStartDate,
        end: endDateObj.toISOString().split('T')[0],
      };
    }

    const days = parseInt(dateRange);
    start.setDate(start.getDate() - days);
    
    // Add one day to end date to include today
    end.setDate(end.getDate() + 1);

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!profile || !userId) return;

      setIsLoading(true);
      try {
        const { start, end } = getDateRange();
        const response = await backlogAPI.getAnalytics(userId, start, end);

        if (response.data) {
          setAnalyticsData(response.data);
          processAnalyticsData(response.data);
        } else {
          // Even if no data, process empty data to show date range
          processAnalyticsData({
            dailyTasks: [],
            correctness: { correct_count: '0', incorrect_count: '0' },
            dailyExp: []
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        // Show empty graphs with date range on error
        processAnalyticsData({
          dailyTasks: [],
          correctness: { correct_count: '0', incorrect_count: '0' },
          dailyExp: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (profile && userId) {
      fetchAnalytics();
    }
  }, [profile, userId, dateRange, customStartDate, customEndDate]);

  // Process analytics data for charts
  const processAnalyticsData = (data: AnalyticsData) => {
    // Get the current date range
    const { start, end } = getDateRange();
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // Create array of all dates in range
    const allDates: string[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      allDates.push(new Date(currentDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Process daily tasks data
    const tasksMap = new Map<string, DailyData>();
    
    // Initialize all dates with 0 values
    allDates.forEach(date => {
      tasksMap.set(date, { 
        date, 
        Mathematics: 0,
        Math: 0, 
        Physics: 0, 
        Chemistry: 0, 
        Biology: 0, 
        All: 0 
      });
    });
    
    // Fill in actual data
    data.dailyTasks.forEach(item => {
      const date = new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      if (tasksMap.has(date)) {
        const entry = tasksMap.get(date)!;
        entry[item.subject_name as keyof DailyData] = parseInt(item.completed_tasks);
      }
    });

    // Calculate "All" totals for each day
    tasksMap.forEach(entry => {
      const math = (entry.Mathematics || 0) + (entry.Math || 0);
      entry.All = math + (entry.Physics || 0) + (entry.Chemistry || 0) + (entry.Biology || 0);
    });

    setDailyTasksData(Array.from(tasksMap.values()));

    // Process daily exp data
    const expMap = new Map<string, ExpData>();
    
    // Initialize all dates with 0 values
    allDates.forEach(date => {
      expMap.set(date, { 
        date, 
        Mathematics: 0,
        Math: 0, 
        Physics: 0, 
        Chemistry: 0, 
        Biology: 0, 
        All: 0 
      });
    });
    
    // Fill in actual data
    data.dailyExp.forEach(item => {
      const date = new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      if (expMap.has(date)) {
        const entry = expMap.get(date)!;
        entry[item.subject_name as keyof ExpData] = parseInt(item.exp_earned);
      }
    });

    // Calculate "All" totals for each day
    expMap.forEach(entry => {
      const math = (entry.Mathematics || 0) + (entry.Math || 0);
      entry.All = math + (entry.Physics || 0) + (entry.Chemistry || 0) + (entry.Biology || 0);
    });

    setDailyExpData(Array.from(expMap.values()));

    // Process donut data
    const correct = parseInt(data.correctness.correct_count) || 0;
    const incorrect = parseInt(data.correctness.incorrect_count) || 0;
    
    setDonutData([
      { name: 'Correct', value: correct },
      { name: 'Incorrect', value: incorrect },
    ]);
  };

  // Custom tooltip for line charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for donut chart
  const DonutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = donutData.reduce((sum, item) => sum + item.value, 0);
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">Count: {data.value}</p>
          <p className="text-sm text-gray-600">Percentage: {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  if (authLoading || profileLoading || !isMounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Return Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/profile/${userId}`)}
            className="flex items-center gap-2 mb-4 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Return to Profile
          </button>
          
          <h1 className="text-4xl font-bold text-purple-600 mb-2">
            Learning Analytics
          </h1>
          <p className="text-gray-600">
            Track your progress and performance over time
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Date Range</h2>
            <button
              onClick={() => {
                // TODO: Implement download report functionality
                alert('Download report feature coming soon!');
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Report
            </button>
          </div>
          
          <div className="flex flex-wrap gap-4 items-end">
            {/* Dropdown selector */}
              <div className="flex-1 min-w-[200px] max-w-[300px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time Period
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value as '7' | '14' | '28' | 'custom')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="7">Past 7 Days</option>
                  <option value="14">Past 14 Days</option>
                  <option value="28">Past 28 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
            </div>

            {/* Custom date inputs */}
            {dateRange === 'custom' && (
              <div className="flex gap-4 items-end flex-wrap">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    max={(() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      return yesterday.toISOString().split('T')[0];
                    })()}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="text-gray-700 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    min={customStartDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="text-gray-700 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Debug info - check if there's actual data, not just empty date entries */}
            {dailyTasksData.length === 0 || (dailyTasksData.every(d => d.All === 0)) ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  No data available for the selected date range. Complete some tasks to see your analytics!
                </p>
              </div>
            ) : null}

            {/* Graph 1: Daily Completed Tasks */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Daily Completed Tasks
              </h2>
              <p className="text-gray-600 mb-6">
                Track how many tasks you complete each day across different subjects
              </p>
              
              {dailyTasksData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={dailyTasksData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6B7280"
                      style={{ fontSize: '12px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      style={{ fontSize: '14px' }}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Mathematics" 
                      stroke={SUBJECT_COLORS['Mathematics']} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Physics" 
                      stroke={SUBJECT_COLORS['Physics']} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Chemistry" 
                      stroke={SUBJECT_COLORS['Chemistry']} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Biology" 
                      stroke={SUBJECT_COLORS['Biology']} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="All" 
                      stroke={SUBJECT_COLORS['All']} 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">No data to display</p>
                </div>
              )}
            </div>

            {/* Graph 2: Correct vs Incorrect Donut Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Accuracy Overview
              </h2>
              <p className="text-gray-600 mb-6">
                Your overall performance across all attempts
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                    >
                      {donutData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === 'Correct' ? DONUT_COLORS.correct : DONUT_COLORS.incorrect}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Stats summary */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: DONUT_COLORS.correct }}></div>
                    <div>
                      <p className="text-sm text-gray-600">Correct Answers</p>
                      <p className="text-2xl font-bold text-green-600">
                        {donutData.find(d => d.name === 'Correct')?.value || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: DONUT_COLORS.incorrect }}></div>
                    <div>
                      <p className="text-sm text-gray-600">Incorrect Answers</p>
                      <p className="text-2xl font-bold text-red-600">
                        {donutData.find(d => d.name === 'Incorrect')?.value || 0}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">Total Attempts</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {donutData.reduce((sum, item) => sum + item.value, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graph 3: Daily EXP Earned */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Daily Experience Points Earned
              </h2>
              <p className="text-gray-600 mb-6">
                Track your EXP gains from correct answers across different subjects
              </p>
              
              {dailyExpData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={dailyExpData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6B7280"
                      style={{ fontSize: '12px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      style={{ fontSize: '14px' }}
                      label={{ value: 'EXP', angle: -90, position: 'insideLeft' }}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Mathematics" 
                      stroke={SUBJECT_COLORS['Mathematics']} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Physics" 
                      stroke={SUBJECT_COLORS['Physics']} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Chemistry" 
                      stroke={SUBJECT_COLORS['Chemistry']} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Biology" 
                      stroke={SUBJECT_COLORS['Biology']} 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="All" 
                      stroke={SUBJECT_COLORS['All']} 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">No data to display</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
