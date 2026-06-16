import { useEffect, useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { Loading } from '@/components/ui/Loading';

export interface LineSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface LineChartProps {
  name?: string;
  xAxisData: string[];
  series: LineSeries[];
  colors?: string[];
  height?: string | number;
  loading?: boolean;
  yAxisName?: string;
  smooth?: boolean;
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
}

const DEFAULT_COLORS = [
  '#0F4C81',
  '#2EC4B6',
  '#FFA94D',
  '#FF6B6B',
  '#74C0FC',
  '#9775FA',
  '#F06595',
  '#51CF66',
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function LineChart({
  xAxisData,
  series,
  colors,
  height = 360,
  loading = false,
  yAxisName = '',
  smooth = true,
  title,
  subtitle,
  showLegend,
}: LineChartProps) {
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

  const option = useMemo((): EChartsOption => {
    const seriesConfig = series.map((s, idx) => {
      const color = s.color || palette[idx % palette.length];
      return {
        name: s.name,
        type: 'line' as const,
        data: s.data,
        smooth,
        symbol: 'circle' as const,
        symbolSize: 7,
        showSymbol: true,
        lineStyle: {
          width: 3,
          color,
          shadowBlur: 8,
          shadowColor: hexToRgba(color, 0.3),
          shadowOffsetY: 4,
        },
        itemStyle: {
          color,
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 6,
          shadowColor: hexToRgba(color, 0.4),
        },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba(color, 0.35) },
              { offset: 0.5, color: hexToRgba(color, 0.12) },
              { offset: 1, color: hexToRgba(color, 0.02) },
            ],
          },
        },
        emphasis: {
          focus: 'series' as const,
          itemStyle: {
            borderWidth: 3,
            shadowBlur: 12,
            shadowColor: hexToRgba(color, 0.5),
          },
        },
        animationDelay: (dataIndex: number) => idx * 100 + dataIndex * 40,
      };
    });

    return {
      backgroundColor: 'transparent',
      color: palette,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.97)',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: [14, 18],
        textStyle: {
          color: '#334155',
          fontSize: 13,
        },
        extraCssText: 'border-radius: 12px; box-shadow: 0 8px 32px rgba(15, 76, 129, 0.12);',
        axisPointer: {
          type: 'cross',
          lineStyle: {
            color: '#94A3B8',
            width: 1,
            type: 'dashed',
          },
          crossStyle: {
            color: '#94A3B8',
          },
          label: {
            backgroundColor: '#0F4C81',
            color: '#fff',
            borderRadius: 6,
            padding: [4, 8],
            fontSize: 12,
          },
        },
        valueFormatter: (value: any) =>
          typeof value === 'number' ? value.toLocaleString() : value,
      },
      legend: {
        show: showLegend !== undefined ? showLegend : series.length > 1,
        top: 0,
        right: 0,
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 20,
        textStyle: {
          color: '#475569',
          fontSize: 13,
          fontWeight: 500,
        },
        icon: 'roundRect',
      },
      grid: {
        left: 50,
        right: 24,
        top: series.length > 1 ? 56 : 32,
        bottom: 40,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLine: {
          lineStyle: {
            color: '#E2E8F0',
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#64748B',
          fontSize: 12,
          fontWeight: 500,
          margin: 12,
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        name: yAxisName,
        nameTextStyle: {
          color: '#64748B',
          fontSize: 12,
          padding: [0, 0, 8, 0],
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#64748B',
          fontSize: 12,
          margin: 10,
        },
        splitLine: {
          lineStyle: {
            color: '#F1F5F9',
            width: 1,
            type: 'dashed',
          },
        },
      },
      series: seriesConfig,
      animationDuration: 1200,
      animationEasing: 'cubicOut',
      animationDurationUpdate: 600,
      animationEasingUpdate: 'cubicInOut',
    };
  }, [xAxisData, series, palette, yAxisName, smooth]);

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
      />
    </div>
  );
}
