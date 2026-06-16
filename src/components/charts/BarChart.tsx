import { useEffect, useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { Loading } from '@/components/ui/Loading';

export interface BarExtra {
  avgDuration?: string;
  handleRate?: number;
  [key: string]: any;
}

export interface BarDataItem {
  name: string;
  value: number;
  extra?: BarExtra;
}

export interface BarChartProps {
  data: BarDataItem[];
  horizontal?: boolean;
  colors?: string[];
  height?: string | number;
  loading?: boolean;
  showRank?: boolean;
  showMedals?: boolean;
  xAxisName?: string;
  yAxisName?: string;
  title?: string;
  subtitle?: string;
  onItemClick?: (item: BarDataItem) => void;
}

const DEFAULT_COLORS = ['#0F4C81', '#2EC4B6', '#FFA94D', '#FF6B6B', '#74C0FC'];

const MEDAL_COLORS: Record<number, { start: string; end: string }> = {
  0: { start: '#FFD700', end: '#FFA500' },
  1: { start: '#C0C0C0', end: '#A8A8A8' },
  2: { start: '#CD7F32', end: '#B87333' },
};

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function BarChart({
  data,
  horizontal = false,
  colors,
  height = 400,
  loading = false,
  showRank = true,
  showMedals,
  xAxisName = '',
  yAxisName = '',
  title,
  subtitle,
  onItemClick,
}: BarChartProps) {
  const chartRef = useRef<ReactECharts>(null);
  const palette = colors && colors.length > 0 ? colors : DEFAULT_COLORS;

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.getEchartsInstance().resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);

  const option = useMemo((): EChartsOption => {
    const categories = sortedData.map((d) => d.name);
    const useMedals = showMedals !== undefined ? showMedals : showRank;
    const values = sortedData.map((d, idx) => {
      const medalColor = MEDAL_COLORS[idx];
      if (useMedals && medalColor) {
        return {
          value: d.value,
          itemStyle: {
            color: {
              type: 'linear' as const,
              x: horizontal ? 0 : 0,
              y: horizontal ? 0 : 0,
              x2: horizontal ? 1 : 0,
              y2: horizontal ? 0 : 1,
              colorStops: [
                { offset: 0, color: medalColor.start },
                { offset: 1, color: medalColor.end },
              ],
            },
            borderRadius: horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0],
            shadowBlur: 10,
            shadowColor: hexToRgba(medalColor.start, 0.3),
          },
          extra: d.extra,
          name: d.name,
        } as any;
      }
      const color = palette[idx % palette.length];
      return {
        value: d.value,
        itemStyle: {
          color: {
            type: 'linear' as const,
            x: horizontal ? 0 : 0,
            y: horizontal ? 0 : 0,
            x2: horizontal ? 1 : 0,
            y2: horizontal ? 0 : 1,
            colorStops: [
              { offset: 0, color: color },
              { offset: 1, color: hexToRgba(color, 0.5) },
            ],
          },
          borderRadius: horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0],
          shadowBlur: 6,
          shadowColor: hexToRgba(color, 0.2),
        },
        extra: d.extra,
        name: d.name,
      } as any;
    });

    const categoryAxis = {
      type: 'category' as const,
      data: horizontal ? categories.reverse() : categories,
      axisLine: {
        lineStyle: { color: '#E2E8F0' },
      },
      axisTick: { show: false },
      axisLabel: {
        color: '#475569',
        fontSize: 12,
        fontWeight: 500,
        margin: 10,
        ...(horizontal ? {} : { interval: 0, rotate: categories.length > 6 ? 30 : 0 }),
        formatter: (value: string, index: number) => {
          if (!showRank) return value;
          const displayIdx = horizontal ? categories.length - 1 - index : index;
          if (displayIdx === 0) return `🥇 ${value}`;
          if (displayIdx === 1) return `🥈 ${value}`;
          if (displayIdx === 2) return `🥉 ${value}`;
          return value;
        },
      },
      name: horizontal ? yAxisName : xAxisName,
      nameTextStyle: {
        color: '#64748B',
        fontSize: 12,
        padding: [8, 0, 0, 0],
      },
    };

    const valueAxis = {
      type: 'value' as const,
      name: horizontal ? xAxisName : yAxisName,
      nameTextStyle: {
        color: '#64748B',
        fontSize: 12,
        padding: [0, 0, 8, 0],
      },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#64748B',
        fontSize: 12,
        margin: 8,
      },
      splitLine: {
        lineStyle: {
          color: '#F1F5F9',
          width: 1,
          type: 'dashed' as const,
        },
      },
    };

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: horizontal ? 'shadow' : 'shadow',
          shadowStyle: {
            color: 'rgba(15, 76, 129, 0.04)',
          },
        },
        backgroundColor: 'rgba(255, 255, 255, 0.97)',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: [14, 18],
        textStyle: {
          color: '#334155',
          fontSize: 13,
        },
        extraCssText: 'border-radius: 12px; box-shadow: 0 8px 32px rgba(15, 76, 129, 0.12);',
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params;
          if (!param) return '';
          const d = param.data;
          const rankIdx = sortedData.findIndex((x) => x.name === d.name);
          const rankBadge =
            rankIdx === 0
              ? '<span style="display:inline-block;padding:2px 8px;border-radius:4px;background:linear-gradient(135deg,#FFD700,#FFA500);color:#fff;font-size:11px;font-weight:600;margin-left:8px;">第1名</span>'
              : rankIdx === 1
              ? '<span style="display:inline-block;padding:2px 8px;border-radius:4px;background:linear-gradient(135deg,#C0C0C0,#A8A8A8);color:#fff;font-size:11px;font-weight:600;margin-left:8px;">第2名</span>'
              : rankIdx === 2
              ? '<span style="display:inline-block;padding:2px 8px;border-radius:4px;background:linear-gradient(135deg,#CD7F32,#B87333);color:#fff;font-size:11px;font-weight:600;margin-left:8px;">第3名</span>'
              : `<span style="display:inline-block;padding:2px 8px;border-radius:4px;background:#F1F5F9;color:#64748B;font-size:11px;font-weight:600;margin-left:8px;">第${rankIdx + 1}名</span>`;

          const extraInfo = d.extra
            ? `
                <div style="margin-top:10px;padding-top:10px;border-top:1px solid #F1F5F9;">
                  ${d.extra.avgDuration !== undefined ? `<div style="margin-bottom:4px;"><span style="color:#64748B;">平均处置时长：</span><b style="color:#0F4C81;">${d.extra.avgDuration}</b></div>` : ''}
                  ${d.extra.handleRate !== undefined ? `<div><span style="color:#64748B;">处置率：</span><b style="color:#2EC4B6;">${d.extra.handleRate}%</b></div>` : ''}
                  ${Object.entries(d.extra)
                    .filter(([k]) => !['avgDuration', 'handleRate'].includes(k))
                    .map(([k, v]) => `<div style="margin-top:4px;"><span style="color:#64748B;">${k}：</span><b style="color:#0F4C81;">${v}</b></div>`)
                    .join('')}
                </div>
              `
            : '';

          return `
            <div style="font-size:14px;font-weight:700;color:#0F172A;margin-bottom:8px;">
              ${d.name}${rankBadge}
            </div>
            <div style="font-size:13px;">
              <span style="color:#64748B;">综合得分：</span>
              <b style="font-size:18px;color:#0F4C81;">${param.value}</b>
            </div>
            ${extraInfo}
          `;
        },
      },
      grid: {
        left: horizontal ? 140 : 50,
        right: 30,
        top: 30,
        bottom: horizontal ? 40 : 60,
        containLabel: true,
      },
      xAxis: horizontal ? valueAxis : categoryAxis,
      yAxis: horizontal ? categoryAxis : valueAxis,
      series: [
        {
          type: 'bar',
          data: horizontal ? values.reverse() : values,
          barWidth: horizontal ? 22 : '45%',
          barMaxWidth: 40,
          label: {
            show: true,
            position: horizontal ? 'right' : 'top',
            color: '#475569',
            fontSize: 12,
            fontWeight: 600,
            distance: 6,
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 16,
            },
          },
          animationDelay: (idx: number) => idx * 60,
        },
      ],
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      animationDurationUpdate: 500,
      animationEasingUpdate: 'cubicInOut',
    };
  }, [sortedData, horizontal, palette, showRank, showMedals, xAxisName, yAxisName]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center w-full bg-white/50 rounded-2xl"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <Loading />
      </div>
    );
  }

  return (
    <div
      className="w-full"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ width: '100%', height: '100%' }}
        notMerge={true}
        lazyUpdate={true}
        onEvents={
          onItemClick
            ? {
                click: (params: any) => {
                  const d = params.data;
                  if (d && d.name) {
                    const item = sortedData.find((x) => x.name === d.name);
                    if (item) onItemClick(item);
                  }
                },
              }
            : undefined
        }
      />
    </div>
  );
}
