import type { RiskLevel, WarningLevel, TriggerType } from '../types';

export function formatNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return num.toLocaleString('zh-CN');
}

export function formatPercent(num: number, decimals: number = 1): string {
  if (num === null || num === undefined || isNaN(num)) return '0%';
  return `${(num * 100).toFixed(decimals)}%`;
}

export function formatDate(dateStr: string | Date): string {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTime(dateStr: string | Date): string {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatHours(hours: number): string {
  if (hours === null || hours === undefined || isNaN(hours) || hours < 0) return '0小时';
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}分钟`;
  }
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes === 0) {
    return `${wholeHours}小时`;
  }
  return `${wholeHours}小时${minutes}分钟`;
}

export function getRiskLevelText(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    safe: '安全',
    low: '低风险',
    medium: '中风险',
    high: '高风险',
  };
  return map[level] || '未知';
}

export function getRiskBadgeClass(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    safe: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    low: 'bg-sky-100 text-sky-700 border-sky-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-rose-100 text-rose-700 border-rose-200',
  };
  return map[level] || 'bg-gray-100 text-gray-700 border-gray-200';
}

export function getWarningLevelText(level: WarningLevel): string {
  return level === 1 ? '一级预警' : '二级预警';
}

export function getWarningBadgeClass(level: WarningLevel): string {
  return level === 1
    ? 'bg-orange-100 text-orange-700 border-orange-200'
    : 'bg-red-100 text-red-700 border-red-200';
}

export function getTriggerTypeText(type: TriggerType): string {
  const map: Record<TriggerType, string> = {
    emotion: '情绪异常',
    assessment: '测评风险',
    behavior: '行为异常',
    composite: '综合评估',
  };
  return map[type] || '未知';
}

export function getTriggerBadgeClass(type: TriggerType): string {
  const map: Record<TriggerType, string> = {
    emotion: 'bg-purple-100 text-purple-700 border-purple-200',
    assessment: 'bg-blue-100 text-blue-700 border-blue-200',
    behavior: 'bg-teal-100 text-teal-700 border-teal-200',
    composite: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };
  return map[type] || 'bg-gray-100 text-gray-700 border-gray-200';
}

export function getStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    approved: '已审批',
    resolved: '已解决',
    rejected: '已驳回',
  };
  return map[status] || status;
}

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
  };
  return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
}
