import { useEffect, useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { Loading } from '@/components/ui/Loading';

export interface PieDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieDataItem[];
  colors?: string[];
  height?: string | number;
  loading?: boolean;
  centerLabel?: {
    title?: string;
    subtitle?: string;
  };
  roseType?: boolean;
  radius?: string | [string, string];
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
  onItemClick?: (item: PieDataItem) => void;
}

const DEFAULT_COLORS = ['#2EC4B6', '#74C0FC', '#FFA94D', '#FF6B6B', '#0F4C81', '#9775FA', '#F06595', '#51CF66'];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function PieChart({
  data,
  colors,
  height = 360,
  loading = false,
  centerLabel,
  roseType = false,
  radius,
  title,
  subtitle,
  showLegend = true,
  onItemClick,
}: PieChartProps) {
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

  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  const option = useMemo((): EChartsOption => {
    const pieData = data.map((item, idx) => {
      const color = item.color || palette[idx % palette.length];
      return {
        value: item.value,
        name: item.name,
        itemStyle: {
          color: {
            type: 'radial' as const,
            x: 0.5,
            y: 0.5,
            r: 0.5,
            colorStops: [
              { offset: 0, color: hexToRgba(color, 0.85) },
              { offset: 0.7, color: color },
              { offset: 1, color: hexToRgba(color, 0.9) },
            ],
          },
          borderColor: '#fff',
          borderWidth: 3,
          shadowBlur: 12,
          shadowColor: hexToRgba(color, 0.25),
        },
        label: {
          show: true,
          formatter: (params: any) => {
            const percent = ((params.value / total) * 100).toFixed(1);
            return `{name|${params.name}}\n{value|${percent}%`;
          },
          rich: {
            name: {
              fontSize: 12,
              lineHeight: 20,
              color: '#475569',
              fontWeight: 500,
            },
            value: {
              fontSize: 14,
              lineHeight: 20,
              color: '#0F172A',
              fontWeight: 700,
            },
          },
        },
        labelLine: {
          show: true,
          length: 12,
          length2: 10,
          smooth: true,
          lineStyle: {
            color: '#CBD5E1',
            width: 1.5,
          },
        },
      };
    });

    const defaultRadius: [string, string] = radius
      ? (Array.isArray(radius)
          ? radius
          : [radius, radius]) as [string, string]
      : ['45%', '72%'];

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
          const percent = ((params.value / total) * 100).toFixed(1);
          return `
            <div style="font-size:14px;font-weight:700;color:#0F172A;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${params.color};"></span>
              ${params.name}
            </div>
            <div style="display:grid;grid-template-columns:auto auto;gap:4px 16px;font-size:13px;">
              <span style="color:#64748B;">数量</span><b style="color:#0F4C81;">${params.value.toLocaleString()}</b>
              <span style="color:#64748B;">占比</span><b style="color:#2EC4B6;">${percent}%</b>
            </div>
          `;
        },
      },
      legend: {
        show: showLegend,
        type: 'scroll',
        orient: 'vertical',
        right: 10,
        top: 'center',
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 14,
        textStyle: {
          color: '#475569',
          fontSize: 13,
          fontWeight: 500,
        },
        icon: 'circle',
        formatter: (name: string) => {
          const item = data.find((d) => d.name === name);
          if (!item) return name;
          const percent = (item.value / total) * 100;
          return `${name}  ${percent.toFixed(1)}%`;
        },
      },
      graphic: centerLabel
        ? ([
            {
              type: 'text' as const,
              left: 'center',
              top: '42%',
              style: {
                text: centerLabel.subtitle || '总计',
                textAlign: 'center',
                fill: '#64748B',
                fontSize: 13,
                fontWeight: 500,
              },
            },
            {
              type: 'text' as const,
              left: 'center',
              top: '50%',
              style: {
                text: centerLabel.title || total.toLocaleString(),
                textAlign: 'center',
                fill: '#0F4C81',
                fontSize: 28,
                fontWeight: 700,
                fontFamily: 'system-ui, sans-serif',
              },
            },
          ] as any)
        : undefined,
      series: [
        {
          name: 'PieChart',
          type: 'pie',
          radius: defaultRadius,
          center: ['38%', '50%'],
          avoidLabelOverlap: true,
          roseType: roseType ? 'radius' : undefined,
          itemStyle: {
            borderRadius: 6,
          },
          padAngle: 1,
          data: pieData,
          emphasis: {
            scale: true,
            scaleSize: 8,
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetY: 8,
              shadowColor: 'rgba(15, 76, 129, 0.2)',
            },
            label: {
              fontSize: 14,
              fontWeight: 600,
            },
          },
          selectedMode: 'single',
          animationType: 'scale',
          animationEasing: 'cubicOut',
          animationDuration: 1000,
          animationDelay: (idx: number) => idx * 80,
        },
      ],
    };
  }, [data, palette, centerLabel, roseType, radius, total]);

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
                    const item = data.find((x) => x.name === d.name);
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
