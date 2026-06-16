import { useEffect, useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { Loading } from '@/components/ui/Loading';

export interface RadarIndicator {
  name: string;
  max: number;
  threshold?: number;
}

export interface RadarSeries {
  name: string;
  data: number[];
}

export interface RadarChartProps {
  indicators: RadarIndicator[];
  series: RadarSeries[];
  colors?: string[];
  height?: string | number;
  loading?: boolean;
  showThreshold?: boolean;
}

const DEFAULT_COLORS = ['#0F4C81', '#2EC4B6', '#FFA94D', '#FF6B6B', '#9775FA'];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function RadarChart({
  indicators,
  series,
  colors,
  height = 400,
  loading = false,
  showThreshold = true,
}: RadarChartProps) {
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

  const option: EChartsOption = useMemo(() => {
    const radarIndicators = indicators.map((ind) => ({
      name: ind.name,
      max: ind.max,
    }));

    const thresholdData = showThreshold
      ? indicators.map((ind) => ind.threshold ?? ind.max * 0.7)
      : null;

    const seriesConfig = series.map((s, idx) => {
      const color = palette[idx % palette.length];
      return {
        name: s.name,
        type: 'radar',
        data: [
          {
            value: s.data,
            name: s.name,
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: {
              color,
              borderColor: '#fff',
              borderWidth: 2,
              shadowBlur: 8,
              shadowColor: hexToRgba(color, 0.4),
            },
            lineStyle: {
              width: 2.5,
              color,
              shadowBlur: 6,
              shadowColor: hexToRgba(color, 0.3),
            },
            areaStyle: {
              color: {
                type: 'radial',
                x: 0.5,
                y: 0.5,
                r: 0.5,
                colorStops: [
                  { offset: 0, color: hexToRgba(color, 0.05) },
                  { offset: 1, color: hexToRgba(color, 0.25) },
                ],
              },
            },
          },
        ],
        animationDelay: (idx: number) => idx * 100,
      };
    });

    if (showThreshold && thresholdData) {
      seriesConfig.push({
        name: '阈值线',
        type: 'radar' as const,
        data: [
          {
            value: thresholdData,
            name: '阈值',
            symbol: 'none' as const,
            itemStyle: {
              color: 'transparent',
              borderColor: 'transparent',
              borderWidth: 0,
              shadowBlur: 0,
              shadowColor: 'transparent',
            },
            lineStyle: {
              width: 1.5,
              color: '#FF6B6B',
              type: 'dashed' as const,
              shadowBlur: 0,
              shadowColor: 'transparent',
              opacity: 0.7,
            },
            areaStyle: undefined as any,
          },
        ],
        z: 0,
      } as any);
    }

    return {
      backgroundColor: 'transparent',
      color: palette,
      tooltip: {
        trigger: 'item',
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
          if (!params.data || !params.data.value) return '';
          const values = params.data.value as number[];
          const rows = indicators
            .map((ind, i) => {
              const val = values[i] ?? 0;
              const threshold = ind.threshold ?? ind.max * 0.7;
              const isOver = showThreshold && val >= threshold;
              const color = isOver ? '#FF6B6B' : '#0F4C81';
              const flag = isOver ? ' ⚠️' : '';
              return `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                  <span style="color:#64748B;">${ind.name}${flag}</span>
                  <b style="color:${color};margin-left:16px;">${val} / ${ind.max}</b>
                </div>
              `;
            })
            .join('');
          return `
            <div style="font-size:14px;font-weight:700;color:#0F172A;margin-bottom:10px;display:flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${params.color};"></span>
              ${params.data.name}
            </div>
            <div style="font-size:13px;">${rows}</div>
          `;
        },
      },
      legend: {
        show: series.length > 1,
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
      radar: {
        center: ['50%', '55%'],
        radius: '65%',
        indicator: radarIndicators,
        shape: 'polygon',
        splitNumber: 4,
        axisName: {
          color: '#475569',
          fontSize: 13,
          fontWeight: 600,
          backgroundColor: 'rgba(248, 250, 252, 0.8)',
          borderRadius: 4,
          padding: [4, 8],
        },
        splitArea: {
          areaStyle: {
            color: ['rgba(248, 250, 252, 0.8)', 'rgba(241, 245, 249, 0.5)'],
          },
        },
        axisLine: {
          lineStyle: {
            color: '#E2E8F0',
            width: 1,
          },
        },
        splitLine: {
          lineStyle: {
            color: '#E2E8F0',
            width: 1,
            type: 'dashed',
          },
        },
      },
      series: seriesConfig as any,
      animationDuration: 1200,
      animationEasing: 'cubicOut',
      animationDurationUpdate: 600,
      animationEasingUpdate: 'cubicInOut',
    };
  }, [indicators, series, palette, showThreshold]);

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
