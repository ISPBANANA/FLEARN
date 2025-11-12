'use client';

import { useEffect, useState, useRef } from 'react';
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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Get current date in Bangkok timezone (YYYY-MM-DD format)
const getBangkokDateString = () => {
  const date = new Date();
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }); // en-CA gives YYYY-MM-DD format
};

// Get date N days ago in Bangkok timezone
const getBangkokDateNDaysAgo = (days: number) => {
  // Get current date in Bangkok timezone as YYYY-MM-DD
  const todayStr = getBangkokDateString();
  const today = new Date(todayStr + 'T00:00:00'); // Parse as local date
  today.setDate(today.getDate() - days);
  
  // Format as YYYY-MM-DD
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

  // Refs for chart elements
  const dailyTasksChartRef = useRef<HTMLDivElement>(null);
  const accuracyChartRef = useRef<HTMLDivElement>(null);
  const dailyExpChartRef = useRef<HTMLDivElement>(null);

  // PDF generation state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Date range states
  const [dateRange, setDateRange] = useState<'7' | '14' | '28' | 'custom'>('7');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Handle date range change
  const handleDateRangeChange = (value: '7' | '14' | '28' | 'custom') => {
    setDateRange(value);
    
    // If switching to custom and dates are empty, set them to past 7 days (Bangkok timezone)
    if (value === 'custom' && !customStartDate && !customEndDate) {
      const end = getBangkokDateString();
      const start = getBangkokDateNDaysAgo(7);
      
      setCustomStartDate(start);
      setCustomEndDate(end);
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
  
  // Refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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

  // Calculate date range using Bangkok timezone
  const getDateRange = () => {
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      // For custom range, add one day to end date for the query (SQL uses <, not <=)
      const endDate = customEndDate.split('-');
      const endDateObj = new Date(Date.UTC(
        parseInt(endDate[0]), 
        parseInt(endDate[1]) - 1, 
        parseInt(endDate[2]) + 1
      ));
      
      return {
        start: customStartDate,
        end: endDateObj.toISOString().split('T')[0],
      };
    }

    const days = parseInt(dateRange);
    const start = getBangkokDateNDaysAgo(days);
    const end = getBangkokDateString();
    
    // Add one day to end date for the query (SQL uses <, not <=)
    // This ensures we include all of today's data
    const endParts = end.split('-');
    const endDateObj = new Date(Date.UTC(
      parseInt(endParts[0]), 
      parseInt(endParts[1]) - 1, 
      parseInt(endParts[2]) + 1
    ));

    return {
      start: start,
      end: endDateObj.toISOString().split('T')[0],
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
          setLastUpdated(new Date());
        } else {
          // Even if no data, process empty data to show date range
          processAnalyticsData({
            dailyTasks: [],
            correctness: { correct_count: '0', incorrect_count: '0' },
            dailyExp: []
          });
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        // Show empty graphs with date range on error
        processAnalyticsData({
          dailyTasks: [],
          correctness: { correct_count: '0', incorrect_count: '0' },
          dailyExp: []
        });
        setLastUpdated(new Date());
      } finally {
        setIsLoading(false);
      }
    };

    if (profile && userId) {
      fetchAnalytics();
    }
  }, [profile, userId, dateRange, customStartDate, customEndDate, refreshKey]);

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

  // Generate PDF Report using jsPDF and html2canvas
  const generatePDFReport = async () => {
    if (isGeneratingPDF || !dailyTasksChartRef.current || !accuracyChartRef.current || !dailyExpChartRef.current) {
      // console.log('PDF generation cancelled: refs not available or already generating');
      return;
    }

    setIsGeneratingPDF(true);

    try {
      // Wait a bit to ensure charts are fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      // Pre-process all chart elements to remove LAB colors BEFORE html2canvas
      const preprocessColors = (element: HTMLElement) => {
        try {
          const allElements = element.querySelectorAll('*');
          allElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              const computedStyle = window.getComputedStyle(el);
              
              // Check and fix color
              const color = computedStyle.color;
              if (color && (color.includes('lab') || color.includes('lch'))) {
                el.style.color = '#000000';
              }
              
              // Check and fix background color
              const bgColor = computedStyle.backgroundColor;
              if (bgColor && (bgColor.includes('lab') || bgColor.includes('lch'))) {
                el.style.backgroundColor = 'transparent';
              }
              
              // Check and fix border color
              const borderColor = computedStyle.borderColor;
              if (borderColor && (borderColor.includes('lab') || borderColor.includes('lch'))) {
                el.style.borderColor = '#000000';
              }
              
              // Fix SVG elements
              if (el instanceof SVGElement) {
                const fill = el.getAttribute('fill');
                if (fill && (fill.includes('lab') || fill.includes('lch'))) {
                  el.setAttribute('fill', '#000000');
                }
                const stroke = el.getAttribute('stroke');
                if (stroke && (stroke.includes('lab') || stroke.includes('lch'))) {
                  el.setAttribute('stroke', '#000000');
                }
              }
            }
          });
        } catch (e) {
          console.warn('Error preprocessing colors:', e);
        }
      };

      // Preprocess all chart containers
      if (dailyTasksChartRef.current) {
        preprocessColors(dailyTasksChartRef.current);
      }
      if (accuracyChartRef.current) {
        preprocessColors(accuracyChartRef.current);
      }
      if (dailyExpChartRef.current) {
        preprocessColors(dailyExpChartRef.current);
      }

      // Create PDF document (A4 size: 210mm x 297mm)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (2 * margin);
      
      let yPosition = margin;

      // Add title
      pdf.setFontSize(24);
      pdf.setTextColor(147, 51, 234); // Purple color
      pdf.text('Learning Analytics Report', margin, yPosition);
      yPosition += 10;

      // Add date range
      pdf.setFontSize(11);
      pdf.setTextColor(107, 114, 128); // Gray color
      const { start, end } = getDateRange();
      const dateRangeText = `Date Range: ${formatDateForDisplay(start)} to ${formatDateForDisplay(end)}`;
      pdf.text(dateRangeText, margin, yPosition);
      yPosition += 12;

      // Simplified html2canvas options (colors already preprocessed)
      const canvasOptions = {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        useCORS: true,
      };

      // Capture and add Daily Completed Tasks chart
      // console.log('Capturing Daily Completed Tasks chart...');
      if (!dailyTasksChartRef.current) {
        throw new Error('Daily tasks chart reference is null');
      }
      
      const dailyTasksCanvas = await html2canvas(dailyTasksChartRef.current, canvasOptions);
      const dailyTasksImgData = dailyTasksCanvas.toDataURL('image/png');
      const chartHeight = (dailyTasksCanvas.height * contentWidth) / dailyTasksCanvas.width;
      
      // Check if we need a new page
      if (yPosition + chartHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.addImage(dailyTasksImgData, 'PNG', margin, yPosition, contentWidth, chartHeight);
      yPosition += chartHeight + 10;

      // Capture and add Accuracy Overview chart
      // console.log('Capturing Accuracy Overview chart...');
      if (!accuracyChartRef.current) {
        throw new Error('Accuracy chart reference is null');
      }
      
      const accuracyCanvas = await html2canvas(accuracyChartRef.current, canvasOptions);
      const accuracyImgData = accuracyCanvas.toDataURL('image/png');
      const accuracyHeight = (accuracyCanvas.height * contentWidth) / accuracyCanvas.width;
      
      // Check if we need a new page
      if (yPosition + accuracyHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.addImage(accuracyImgData, 'PNG', margin, yPosition, contentWidth, accuracyHeight);
      yPosition += accuracyHeight + 10;

      // Capture and add Daily EXP Earned chart
      // console.log('Capturing Daily EXP Earned chart...');
      if (!dailyExpChartRef.current) {
        throw new Error('Daily EXP chart reference is null');
      }
      
      const dailyExpCanvas = await html2canvas(dailyExpChartRef.current, canvasOptions);
      const dailyExpImgData = dailyExpCanvas.toDataURL('image/png');
      const dailyExpHeight = (dailyExpCanvas.height * contentWidth) / dailyExpCanvas.width;
      
      // Check if we need a new page
      if (yPosition + dailyExpHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.addImage(dailyExpImgData, 'PNG', margin, yPosition, contentWidth, dailyExpHeight);

      // Add footer with generation date
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175); // Light gray
        pdf.text(
          `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save the PDF with sanitized filename
      const sanitizedStart = start.replace(/[/:]/g, '-');
      const sanitizedEnd = end.replace(/[/:]/g, '-');
      const fileName = `Learning_Analytics_${sanitizedStart}_to_${sanitizedEnd}.pdf`;
      
      // console.log('Saving PDF as:', fileName);
      pdf.save(fileName);
      
      // console.log('PDF generated successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Provide more specific error message
      let errorMessage = 'Failed to generate PDF. Please try again.';
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        if (error.message.includes('color')) {
          errorMessage = 'Failed to generate PDF due to color rendering issues. Please try again or contact support if the problem persists.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'PDF generation timed out. Please try again with a smaller date range.';
        } else if (error.message.includes('reference is null')) {
          errorMessage = 'Charts are not ready. Please wait a moment and try again.';
        } else {
          errorMessage = `Failed to generate PDF: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsGeneratingPDF(false);
    }
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

  // Helper function to format date for display
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
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

      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-8 print:px-0 print:py-4">
        {/* Header with Return Button */}
        <div className="mb-6 lg:mb-8 no-print">
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
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600 mb-2">
            Learning Analytics
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Track your progress and performance over time
          </p>
        </div>

        {/* Print-only header */}
        <div className="hidden print:block mb-4">
          <h1 className="text-3xl font-bold text-purple-600 mb-1">
            Learning Analytics Report
          </h1>
          <p className="text-sm text-gray-600">
            Date Range: {formatDateForDisplay(getDateRange().start)} to {formatDateForDisplay(getDateRange().end)}
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 lg:mb-8 no-print">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Date Range</h2>
              {lastUpdated && (
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setRefreshKey(prev => prev + 1)}
                disabled={isLoading}
                className={`px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm sm:text-base ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Refresh analytics data"
              >
                <svg
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={generatePDFReport}
                disabled={isLoading || isGeneratingPDF}
                className={`px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm sm:text-base ${
                  (isLoading || isGeneratingPDF) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isGeneratingPDF ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">Generating PDF...</span>
                    <span className="sm:hidden">PDF...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
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
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            {/* Dropdown selector */}
              <div className="w-full sm:flex-1 sm:min-w-[200px] sm:max-w-[300px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time Period
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value as '7' | '14' | '28' | 'custom')}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="7">Past 7 Days</option>
                  <option value="14">Past 14 Days</option>
                  <option value="28">Past 28 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
            </div>

            {/* Custom date inputs */}
            {dateRange === 'custom' && (
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="w-full sm:w-auto">
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
                    className="text-gray-700 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white w-full"
                  />
                </div>
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    min={customStartDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="text-gray-700 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading analytics...</p>
          </div>
        ) : (
          <div className="space-y-6 lg:space-y-8 print:space-y-3">
            {/* Debug info - check if there's actual data, not just empty date entries */}
            {dailyTasksData.length === 0 || (dailyTasksData.every(d => d.All === 0)) ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 no-print">
                <p className="text-yellow-800 text-sm">
                  No data available for the selected date range. Complete some tasks to see your analytics!
                </p>
              </div>
            ) : null}

            {/* Graph 1: Daily Completed Tasks */}
            <div ref={dailyTasksChartRef} className="bg-white rounded-lg shadow-md p-4 sm:p-6 print:p-4 print:mb-3 avoid-break">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4 print:text-lg print:mb-2">
                Daily Completed Tasks
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base print:text-sm print:mb-2">
                Track how many tasks you complete each day across different subjects
              </p>
              
              {dailyTasksData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300} className="sm:!h-[400px] print:!h-[250px]">
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
                <div className="h-[300px] sm:h-[400px] flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500 text-sm sm:text-base">No data to display</p>
                </div>
              )}
            </div>

            {/* Graph 2: Correct vs Incorrect Donut Chart */}
            <div ref={accuracyChartRef} className="bg-white rounded-lg shadow-md p-4 sm:p-6 print:p-4 print:mb-3 avoid-break">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4 print:text-lg print:mb-2">
                Accuracy Overview
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base print:text-sm print:mb-2">
                Your overall performance across all attempts
              </p>

              <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-8 print:gap-4">
                <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px] print:!h-[200px]">
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
                <div className="space-y-3 sm:space-y-4 print:space-y-2">
                  <div className="flex items-center gap-3 sm:gap-4 print:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full print:w-3 print:h-3" style={{ backgroundColor: DONUT_COLORS.correct }}></div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 print:text-xs">Correct Answers</p>
                      <p className="text-lg sm:text-2xl font-bold text-green-600 print:text-lg">
                        {donutData.find(d => d.name === 'Correct')?.value || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 print:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full print:w-3 print:h-3" style={{ backgroundColor: DONUT_COLORS.incorrect }}></div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 print:text-xs">Incorrect Answers</p>
                      <p className="text-lg sm:text-2xl font-bold text-red-600 print:text-lg">
                        {donutData.find(d => d.name === 'Incorrect')?.value || 0}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 sm:pt-4 border-t border-gray-200 print:pt-2">
                    <p className="text-xs sm:text-sm text-gray-600 print:text-xs">Total Attempts</p>
                    <p className="text-xl sm:text-3xl font-bold text-purple-600 print:text-xl">
                      {donutData.reduce((sum, item) => sum + item.value, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graph 3: Daily EXP Earned */}
            <div ref={dailyExpChartRef} className="bg-white rounded-lg shadow-md p-4 sm:p-6 print:p-4 print:mb-3 avoid-break">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4 print:text-lg print:mb-2">
                Daily Experience Points Earned
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base print:text-sm print:mb-2">
                Track your EXP gains from correct answers across different subjects
              </p>
              
              {dailyExpData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300} className="sm:!h-[400px] print:!h-[250px]">
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
                <div className="h-[300px] sm:h-[400px] flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500 text-sm sm:text-base">No data to display</p>
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
