import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { MapPin, Users, AlertTriangle, TrendingUp } from 'lucide-react';

export interface ProvinceRiskData {
  name: string;
  value: number;
  studentCount: number;
  warningCount: number;
  highRiskCount: number;
}

export interface ChinaHeatMapProps {
  data: ProvinceRiskData[];
  title?: string;
  subtitle?: string;
  className?: string;
  onProvinceClick?: (province: ProvinceRiskData) => void;
}

const provincePositions: Record<string, { x: number; y: number; size: number }> = {
  '黑龙江': { x: 82, y: 12, size: 14 },
  '吉林': { x: 80, y: 20, size: 11 },
  '辽宁': { x: 76, y: 28, size: 11 },
  '内蒙古': { x: 58, y: 18, size: 18 },
  '新疆': { x: 16, y: 26, size: 20 },
  '西藏': { x: 22, y: 52, size: 18 },
  '青海': { x: 38, y: 42, size: 14 },
  '甘肃': { x: 46, y: 36, size: 13 },
  '宁夏': { x: 52, y: 34, size: 7 },
  '陕西': { x: 56, y: 40, size: 11 },
  '山西': { x: 62, y: 36, size: 10 },
  '河北': { x: 68, y: 32, size: 11 },
  '北京': { x: 70, y: 28, size: 6 },
  '天津': { x: 73, y: 30, size: 5 },
  '山东': { x: 72, y: 38, size: 12 },
  '河南': { x: 64, y: 44, size: 11 },
  '江苏': { x: 74, y: 46, size: 10 },
  '上海': { x: 78, y: 50, size: 5 },
  '安徽': { x: 68, y: 50, size: 10 },
  '浙江': { x: 76, y: 54, size: 9 },
  '湖北': { x: 60, y: 50, size: 11 },
  '湖南': { x: 58, y: 58, size: 10 },
  '江西': { x: 66, y: 58, size: 10 },
  '福建': { x: 72, y: 62, size: 9 },
  '台湾': { x: 78, y: 64, size: 6 },
  '广东': { x: 62, y: 68, size: 12 },
  '广西': { x: 52, y: 66, size: 11 },
  '海南': { x: 54, y: 78, size: 7 },
  '四川': { x: 44, y: 54, size: 14 },
  '重庆': { x: 52, y: 52, size: 8 },
  '贵州': { x: 50, y: 62, size: 9 },
  '云南': { x: 38, y: 64, size: 12 },
  '香港': { x: 65, y: 72, size: 4 },
  '澳门': { x: 63, y: 73, size: 3 },
};

const getRiskColor = (value: number, maxValue: number) => {
  const ratio = Math.min(value / maxValue, 1);
  if (ratio < 0.25) return { bg: 'bg-risk-safe/20', border: 'border-risk-safe/40', text: 'text-risk-safe', glow: 'shadow-[0_0_12px_rgba(46,196,182,0.3)]' };
  if (ratio < 0.5) return { bg: 'bg-risk-low/25', border: 'border-risk-low/50', text: 'text-risk-low', glow: 'shadow-[0_0_12px_rgba(116,192,252,0.4)]' };
  if (ratio < 0.75) return { bg: 'bg-risk-medium/30', border: 'border-risk-medium/60', text: 'text-risk-medium', glow: 'shadow-[0_0_16px_rgba(255,169,77,0.5)]' };
  return { bg: 'bg-risk-high/35', border: 'border-risk-high/70', text: 'text-risk-high', glow: 'shadow-[0_0_20px_rgba(255,107,107,0.6)]' };
};

export function ChinaHeatMap({
  data,
  title = '全国心理健康风险热力分布',
  subtitle = '数据更新于 刚刚',
  className,
  onProvinceClick,
}: ChinaHeatMapProps) {
  const [selectedProvince, setSelectedProvince] = useState<ProvinceRiskData | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const handleProvinceClick = (province: ProvinceRiskData) => {
    setSelectedProvince(province);
    onProvinceClick?.(province);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-1">{subtitle}</CardDescription>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-risk-safe/50" />
            <span className="text-ink-500">低</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-risk-low/50" />
            <span className="text-ink-500">较低</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-risk-medium/60" />
            <span className="text-ink-500">中</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-risk-high/70" />
            <span className="text-ink-500">高</span>
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full" style={{ paddingTop: '85%' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-mint-50/30 rounded-xl" />
          
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 90" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#E2E8F0" strokeWidth="0.1" />
              </pattern>
            </defs>
            <rect width="100" height="90" fill="url(#grid)" />
          </svg>

          {Object.entries(provincePositions).map(([name, pos]) => {
            const provinceData = data.find((d) => d.name === name);
            if (!provinceData) return null;
            const colors = getRiskColor(provinceData.value, maxValue);
            const isSelected = selectedProvince?.name === name;
            const isHovered = hoveredProvince === name;

            return (
              <div
                key={name}
                className={cn(
                  'absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 cursor-pointer transition-all duration-300 flex items-center justify-center',
                  colors.bg,
                  colors.border,
                  isSelected && cn(colors.glow, 'scale-125 z-20 ring-2 ring-offset-2 ring-offset-white', colors.border),
                  isHovered && !isSelected && cn('scale-110 z-10', colors.glow)
                )}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: `${pos.size}%`,
                  height: `${pos.size * 0.9}%`,
                }}
                onClick={() => handleProvinceClick(provinceData)}
                onMouseEnter={() => setHoveredProvince(name)}
                onMouseLeave={() => setHoveredProvince(null)}
              >
                <span className={cn('text-[9px] md:text-[10px] font-semibold truncate px-1', colors.text)}>
                  {name.length > 2 ? name.slice(0, 2) : name}
                </span>
              </div>
            );
          })}
        </div>

        {selectedProvince && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-mint-50 border border-primary-100 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                <h4 className="text-lg font-bold text-ink-900 font-serif">{selectedProvince.name}</h4>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  getRiskColor(selectedProvince.value, maxValue).bg,
                  getRiskColor(selectedProvince.value, maxValue).text,
                  getRiskColor(selectedProvince.value, maxValue).border
                )}>
                  风险指数 {selectedProvince.value}
                </span>
              </div>
              <button
                onClick={() => setSelectedProvince(null)}
                className="text-ink-400 hover:text-ink-600 text-sm"
              >
                关闭
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-1 text-xs text-ink-500 mb-1">
                  <Users className="w-3 h-3" />
                  监测学生
                </div>
                <p className="text-xl font-bold text-ink-900">
                  {(selectedProvince.studentCount / 10000).toFixed(1)}万
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs text-ink-500 mb-1">
                  <AlertTriangle className="w-3 h-3 text-warning-high" />
                  预警数量
                </div>
                <p className="text-xl font-bold text-warning-high">
                  {selectedProvince.warningCount}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs text-ink-500 mb-1">
                  <TrendingUp className="w-3 h-3 text-warning-high" />
                  高风险学生
                </div>
                <p className="text-xl font-bold text-warning-high">
                  {selectedProvince.highRiskCount}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
