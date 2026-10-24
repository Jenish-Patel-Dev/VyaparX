import React, { useState, useRef, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  AreaChart,
  IndianRupee,
  BadgePercent,
  ReceiptText,
} from 'lucide-react';
import { formatCurrency, formatLakhsCr } from '../../utils/formatters';
import type { MonthlyTrendData, DailyTrendData } from '../../services/adminService';

interface AdminAnalyticsChartProps {
  monthlyData: MonthlyTrendData[];
  dailyData: DailyTrendData[];
  selectedFY?: string;
  selectedUser?: string;
}

export const AdminAnalyticsChart: React.FC<AdminAnalyticsChartProps> = ({
  monthlyData,
  dailyData,
  selectedFY,
  selectedUser,
}) => {
  const [metric, setMetric] = useState<'turnover' | 'brokerage' | 'tradesCount'>('turnover');
  const [timeframe, setTimeframe] = useState<'monthly' | 'daily'>('monthly');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Responsive container width tracking to prevent any SVG stretching or distortion
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const w = el.clientWidth;
      if (w > 0) setContainerWidth(w);
    };

    updateWidth();

    const ro = new ResizeObserver(() => {
      updateWidth();
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const activeDataset = timeframe === 'monthly' ? monthlyData : dailyData;

  // Extract values
  const values = activeDataset.map((d) => d[metric] || 0);
  const totalValue = values.reduce((acc, curr) => acc + curr, 0);
  const maxValue = Math.max(...values, metric === 'tradesCount' ? 5 : 1000);
  const avgValue = values.length > 0 ? totalValue / values.length : 0;

  // Find Peak
  let peakIndex = 0;
  values.forEach((v, idx) => {
    if (v > values[peakIndex]) peakIndex = idx;
  });
  const peakItem = activeDataset[peakIndex];

  // Chart Dimensions & Precise Coordinates
  const chartHeight = 200;
  const paddingLeft = 16;
  const paddingRight = 16;
  const paddingTop = 14;
  const paddingBottom = 14;
  const usableWidth = Math.max(containerWidth - paddingLeft - paddingRight, 100);
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const points = activeDataset.map((d, idx) => {
    const x =
      activeDataset.length <= 1
        ? containerWidth / 2
        : paddingLeft + (idx / (activeDataset.length - 1)) * usableWidth;
    const val = d[metric] || 0;
    const y = paddingTop + usableHeight - (val / maxValue) * usableHeight;
    return { x, y, data: d, val };
  });

  // Smooth Bezier Curve Path Generator
  const generateSmoothAreaPath = () => {
    if (points.length === 0) return { pathD: '', areaD: '' };
    if (points.length === 1) {
      const p = points[0];
      return {
        pathD: `M ${paddingLeft} ${p.y} L ${containerWidth - paddingRight} ${p.y}`,
        areaD: `M ${paddingLeft} ${p.y} L ${containerWidth - paddingRight} ${p.y} L ${containerWidth - paddingRight} ${paddingTop + usableHeight} L ${paddingLeft} ${paddingTop + usableHeight} Z`,
      };
    }

    let pathD = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const last = points[points.length - 1];
    const first = points[0];
    const areaD = `${pathD} L ${last.x} ${paddingTop + usableHeight} L ${first.x} ${paddingTop + usableHeight} Z`;

    return { pathD, areaD };
  };

  const { pathD, areaD } = generateSmoothAreaPath();

  // Color config according to metric
  const getMetricTheme = () => {
    if (metric === 'turnover') {
      return {
        stroke: '#2563EB',
        fillGradientStart: '#2563EB',
        fillGradientEnd: '#38BDF8',
        tagBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        activePill: 'text-blue-600 dark:text-blue-400',
        barGradient: 'from-blue-600 to-cyan-400',
        label: 'Turnover Volume',
      };
    }
    if (metric === 'brokerage') {
      return {
        stroke: '#059669',
        fillGradientStart: '#059669',
        fillGradientEnd: '#34D399',
        tagBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        activePill: 'text-emerald-600 dark:text-emerald-400',
        barGradient: 'from-emerald-600 to-teal-400',
        label: 'Brokerage Commission',
      };
    }
    return {
      stroke: '#D97706',
      fillGradientStart: '#D97706',
      fillGradientEnd: '#FBBF24',
      tagBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      activePill: 'text-amber-600 dark:text-amber-400',
      barGradient: 'from-amber-600 to-orange-400',
      label: 'Trades Count',
    };
  };

  const theme = getMetricTheme();

  // Helper format value
  const formatVal = (v: number) => {
    if (metric === 'tradesCount') return `${v} Trades`;
    return formatCurrency(v);
  };

  // Y-Axis Ticks (4 levels: 100%, 66%, 33%, 0%)
  const yTicks = [1, 0.66, 0.33, 0].map((ratio) => {
    const val = maxValue * ratio;
    const yPos = paddingTop + usableHeight - ratio * usableHeight;
    let label = '';
    if (metric === 'tradesCount') {
      label = Math.round(val).toString();
    } else if (val >= 10000000) {
      label = `₹${(val / 10000000).toFixed(1)}Cr`;
    } else if (val >= 100000) {
      label = `₹${(val / 100000).toFixed(1)}L`;
    } else if (val >= 1000) {
      label = `₹${Math.round(val / 1000)}k`;
    } else {
      label = `₹${Math.round(val)}`;
    }
    return { val, ratio, yPos, label };
  });

  return (
    <div className="neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-neu-raised-sm space-y-5 animate-fade-in">
      {/* Top Header & Interactive Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-3 border-b border-black/[0.06] dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Trade Volume & Revenue Performance Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Visual trend intelligence generated live from verified Mandi contracts
            {selectedUser && selectedUser !== 'ALL' ? ` for ${selectedUser}` : ''}
            {selectedFY && selectedFY !== 'ALL' ? ` (${selectedFY})` : ''}.
          </p>
        </div>

        {/* Action Controls: Metric Tabs, Timeframe & Chart Style */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector Tabs */}
          <div className="inline-flex p-1 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMetric('turnover')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                metric === 'turnover'
                  ? 'neu-raised-sm bg-[#F0F3F8] dark:bg-[#2B3140] text-blue-600 dark:text-blue-400 shadow-neu-raised-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Turnover</span>
            </button>

            <button
              type="button"
              onClick={() => setMetric('brokerage')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                metric === 'brokerage'
                  ? 'neu-raised-sm bg-[#F0F3F8] dark:bg-[#2B3140] text-emerald-600 dark:text-emerald-400 shadow-neu-raised-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BadgePercent className="w-3.5 h-3.5" />
              <span>Brokerage</span>
            </button>

            <button
              type="button"
              onClick={() => setMetric('tradesCount')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                metric === 'tradesCount'
                  ? 'neu-raised-sm bg-[#F0F3F8] dark:bg-[#2B3140] text-amber-600 dark:text-amber-400 shadow-neu-raised-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ReceiptText className="w-3.5 h-3.5" />
              <span>Trades</span>
            </button>
          </div>

          {/* Timeframe Selector (12 Months vs Last 7 Days) */}
          <div className="inline-flex p-1 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === 'monthly'
                  ? 'neu-raised-sm bg-[#F0F3F8] dark:bg-[#2B3140] text-slate-900 dark:text-white shadow-neu-raised-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              12 Months (FY)
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('daily')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === 'daily'
                  ? 'neu-raised-sm bg-[#F0F3F8] dark:bg-[#2B3140] text-slate-900 dark:text-white shadow-neu-raised-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Last 7 Days
            </button>
          </div>

          {/* Chart Type: Curve Area vs Bars */}
          <div className="inline-flex p-1 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setChartType('area')}
              title="Area Trend Curve"
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                chartType === 'area'
                  ? 'neu-raised-sm bg-[#F0F3F8] dark:bg-[#2B3140] text-blue-600 dark:text-blue-400 shadow-neu-raised-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AreaChart className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              title="Bar Growth View"
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'neu-raised-sm bg-[#F0F3F8] dark:bg-[#2B3140] text-blue-600 dark:text-blue-400 shadow-neu-raised-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Summary Intelligence Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total {theme.label}
            </span>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {formatVal(totalValue)}
            </p>
          </div>
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl border ${theme.tagBg}`}>
            {timeframe === 'monthly' ? 'FY Sum' : '7 Days'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Peak {timeframe === 'monthly' ? 'Month' : 'Day'}
            </span>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 truncate max-w-[180px]">
              {peakItem ? `${peakItem.label} (${formatVal(peakItem[metric])})` : '—'}
            </p>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Top Peak
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Average Rate
            </span>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {formatVal(Math.round(avgValue))} {timeframe === 'monthly' ? '/ mo' : '/ day'}
            </p>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Pacing
          </span>
        </div>
      </div>

      {/* Main Chart Graphic Layout (Crisp, Non-Distorted Typography) */}
      <div className="pt-2">
        <div className="flex gap-2 sm:gap-3 items-stretch">
          {/* Left Y-Axis HTML Column: Natural proportions, 100% crisp without stretching */}
          <div
            className="w-12 sm:w-16 shrink-0 relative select-none"
            style={{ height: `${chartHeight}px` }}
          >
            {yTicks.map((tick, i) => (
              <div
                key={i}
                className="absolute right-1 sm:right-2 text-right -translate-y-1/2 text-[10px] sm:text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap"
                style={{ top: `${tick.yPos}px` }}
              >
                {tick.label}
              </div>
            ))}
          </div>

          {/* Right Chart Canvas & X-Axis Column */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* SVG Canvas Area */}
            <div
              ref={containerRef}
              className="relative w-full"
              style={{ height: `${chartHeight}px` }}
            >
              {/* Floating Tooltip when hovering over a point/bar */}
              {hoveredIndex !== null && activeDataset[hoveredIndex] && (
                <div
                  className="absolute z-20 pointer-events-none transform -translate-x-1/2 -top-4 transition-all duration-150"
                  style={{
                    left: `${points[hoveredIndex]?.x ?? containerWidth / 2}px`,
                  }}
                >
                  <div className="p-3 rounded-2xl neu-raised bg-[#E8EDF3] dark:bg-[#20242D] border border-white/90 dark:border-white/15 shadow-neu-raised-lg text-xs space-y-1 min-w-[160px] animate-in fade-in zoom-in-95">
                    <div className="font-extrabold text-slate-900 dark:text-white border-b border-black/[0.06] dark:border-white/10 pb-1 flex items-center justify-between">
                      <span>{activeDataset[hoveredIndex].fullLabel}</span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                        #{hoveredIndex + 1}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-slate-500">Turnover:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(activeDataset[hoveredIndex].turnover)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Brokerage:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(activeDataset[hoveredIndex].brokerage)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Trades:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {activeDataset[hoveredIndex].tradesCount} Sauda
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pixel-perfect SVG (Exact 1:1 scale matching containerWidth & chartHeight) */}
              <svg
                viewBox={`0 0 ${containerWidth} ${chartHeight}`}
                className="w-full h-full select-none overflow-visible"
              >
                <defs>
                  <linearGradient id="chartGradientArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.fillGradientStart} stopOpacity="0.35" />
                    <stop offset="60%" stopColor={theme.fillGradientEnd} stopOpacity="0.12" />
                    <stop offset="100%" stopColor={theme.fillGradientEnd} stopOpacity="0.0" />
                  </linearGradient>

                  <linearGradient id="chartBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.fillGradientStart} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={theme.fillGradientEnd} stopOpacity="0.65" />
                  </linearGradient>
                </defs>

                {/* Horizontal Dashed Gridlines spanning across canvas */}
                {yTicks.map((tick, i) => (
                  <line
                    key={i}
                    x1={0}
                    y1={tick.yPos}
                    x2={containerWidth}
                    y2={tick.yPos}
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="text-black/[0.08] dark:text-white/[0.08]"
                  />
                ))}

                {/* Render Area Curve Mode */}
                {chartType === 'area' && (
                  <>
                    {/* Gradient Fill under path */}
                    {totalValue > 0 && (
                      <path
                        d={areaD}
                        fill="url(#chartGradientArea)"
                        className="transition-all duration-300"
                      />
                    )}

                    {/* Main Stroke Path Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={theme.stroke}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300"
                    />

                    {/* Data Points / Dots: Perfect circles with no distortion */}
                    {points.map((p, idx) => {
                      const isHovered = hoveredIndex === idx;
                      const isPeak = idx === peakIndex && p.val > 0;
                      return (
                        <g key={idx} className="cursor-pointer">
                          {/* Invisible wider hover hit target */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="18"
                            fill="transparent"
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />

                          {/* Outer Ring on Hover or Peak */}
                          {(isHovered || isPeak) && (
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={isHovered ? 9 : 6.5}
                              fill={theme.stroke}
                              fillOpacity={isHovered ? 0.25 : 0.15}
                              className="transition-all duration-150 animate-pulse"
                            />
                          )}

                          {/* Central Point Dot */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isHovered ? 5 : isPeak ? 4.5 : 3.5}
                            fill="#FFFFFF"
                            stroke={theme.stroke}
                            strokeWidth={isHovered ? 3 : 2.5}
                            className="transition-all duration-150"
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        </g>
                      );
                    })}
                  </>
                )}

                {/* Render Bar Chart Mode */}
                {chartType === 'bar' && (
                  <>
                    {points.map((p, idx) => {
                      const isHovered = hoveredIndex === idx;
                      const barWidth = Math.min(
                        32,
                        Math.max(16, (usableWidth / Math.max(activeDataset.length, 1)) * 0.45)
                      );
                      const barX = p.x - barWidth / 2;
                      const barHeight = Math.max((p.val / maxValue) * usableHeight, p.val > 0 ? 6 : 2);
                      const barY = paddingTop + usableHeight - barHeight;

                      return (
                        <g
                          key={idx}
                          className="cursor-pointer transition-all duration-200"
                          onMouseEnter={() => setHoveredIndex(idx)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        >
                          {/* Bar Background Track */}
                          <rect
                            x={barX}
                            y={paddingTop}
                            width={barWidth}
                            height={usableHeight}
                            rx="6"
                            fill="currentColor"
                            className="text-black/[0.02] dark:text-white/[0.02]"
                          />

                          {/* The Value Bar */}
                          <rect
                            x={barX}
                            y={barY}
                            width={barWidth}
                            height={barHeight}
                            rx="6"
                            fill="url(#chartBarGradient)"
                            className={`transition-all duration-200 ${
                              isHovered ? 'filter drop-shadow(0 0 6px rgba(37,99,235,0.4))' : ''
                            }`}
                          />

                          {/* Bar Value on top for active values */}
                          {p.val > 0 && (
                            <text
                              x={p.x}
                              y={barY - 6}
                              textAnchor="middle"
                              className="text-[10px] font-mono font-extrabold fill-slate-700 dark:fill-slate-200 select-none"
                            >
                              {metric === 'tradesCount' ? p.val : formatLakhsCr(p.val)}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>
            </div>

            {/* Bottom X-Axis HTML Row: Perfectly aligned with each point, 100% distortion-free */}
            <div className="relative w-full h-7 mt-2 select-none">
              {points.map((p, idx) => {
                const isHovered = hoveredIndex === idx;
                return (
                  <div
                    key={idx}
                    className="absolute -translate-x-1/2 text-center transition-all cursor-pointer"
                    style={{ left: `${p.x}px` }}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <span
                      className={`text-[11px] transition-all px-1.5 py-0.5 rounded-lg whitespace-nowrap ${
                        isHovered
                          ? `${theme.activePill} font-black bg-blue-500/10 dark:bg-blue-400/10`
                          : 'font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {p.data.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
