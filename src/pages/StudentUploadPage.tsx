import { useState, useRef, useMemo, useCallback } from 'react';
import { MainLayout, type BreadcrumbItem } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Gender } from '@/types';
import { cn } from '@/lib/utils';
import {
  CloudUpload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  X,
  FileCheck2,
  History,
  FileQuestion,
  Upload,
  ChevronRight,
  Check,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { label: '首页', href: '/dashboard' },
  { label: '学生档案', href: '/students' },
  { label: '批量导入' },
];

type UploadStep = 1 | 2 | 3;

interface PreviewRow {
  index: number;
  studentNo: string;
  name: string;
  gender: Gender;
  age: number;
  college: string;
  major: string;
  grade: string;
  className: string;
  phone: string;
  counselor: string;
  status: 'success' | 'error' | 'skipped';
  errorMsg?: string;
}

interface UploadRecord {
  id: string;
  time: string;
  fileName: string;
  successCount: number;
  failCount: number;
  skipCount: number;
  operator: string;
}

const generatePreviewData = (): PreviewRow[] => {
  const surnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴'];
  const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋'];
  const colleges = ['计算机学院', '经济管理学院', '文学院', '理学院', '工学院', '医学院', '法学院', '外国语学院'];
  const majors = ['计算机科学', '软件工程', '金融学', '汉语言文学', '数学', '机械工程', '临床医学', '法学'];
  const grades = ['大一', '大二', '大三', '大四', '研一', '研二'];
  const counselors = ['王老师', '李老师', '张老师', '刘老师', '陈老师'];

  return Array.from({ length: 10 }, (_, i) => {
    const hasError = i === 3 || i === 7;
    const isSkipped = i === 5;
    const gender: Gender = i % 2 === 0 ? '男' : '女';

    return {
      index: i + 1,
      studentNo: hasError ? '' : `202${i % 5}${String(10000 + i).padStart(6, '0')}`,
      name: `${surnames[i % surnames.length]}${names[(i + 3) % names.length]}`,
      gender,
      age: 18 + (i % 8),
      college: colleges[i % colleges.length],
      major: majors[i % majors.length],
      grade: grades[i % grades.length],
      className: `${grades[i % grades.length]}${1 + (i % 5)}班`,
      phone: `1${3 + (i % 4)}${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      counselor: counselors[i % counselors.length],
      status: hasError ? 'error' : isSkipped ? 'skipped' : 'success',
      errorMsg: hasError
        ? i === 3 ? '学号不能为空，格式应为10位数字' : '学号格式错误，应为纯数字'
        : undefined,
    };
  });
};

const generateHistoryRecords = (): UploadRecord[] => {
  return Array.from({ length: 5 }, (_, i) => {
    const now = new Date();
    now.setDate(now.getDate() - i * (1 + (i % 3)));
    now.setHours(10 + (i % 8), (i * 17) % 60);

    const success = 40 + Math.floor(Math.random() * 80);
    const fail = Math.floor(Math.random() * 6);
    const skip = Math.floor(Math.random() * 4);

    return {
      id: `UP${String(1000 - i).padStart(4, '0')}`,
      time: now.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      fileName: `学生档案_${now.toISOString().split('T')[0]}_batch${i + 1}.xlsx`,
      successCount: success,
      failCount: fail,
      skipCount: skip,
      operator: ['管理员', '李老师', '王老师', '张老师', '辅导员'][i % 5],
    };
  });
};

export default function StudentUploadPage() {
  const [step, setStep] = useState<UploadStep>(2);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedRows, setParsedRows] = useState(0);
  const [totalRows] = useState(126);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewData = useMemo(() => generatePreviewData(), []);
  const historyRecords = useMemo(() => generateHistoryRecords(), []);

  const stats = useMemo(() => {
    const success = previewData.filter(r => r.status === 'success').length;
    const fail = previewData.filter(r => r.status === 'error').length;
    const skip = previewData.filter(r => r.status === 'skipped').length;
    return {
      success: Math.round((totalRows * success) / previewData.length),
      fail: Math.round((totalRows * fail) / previewData.length),
      skip: Math.round((totalRows * skip) / previewData.length),
    };
  }, [previewData, totalRows]);

  const simulateUpload = useCallback(() => {
    setIsUploading(true);
    setUploadProgress(0);
    setParsedRows(0);

    let progress = 0;
    let rows = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 12 + 4;
      rows += Math.floor(Math.random() * 15) + 8;

      if (progress >= 100) {
        progress = 100;
        rows = totalRows;
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setStep(3);
        }, 400);
      }
      setUploadProgress(Math.min(progress, 100));
      setParsedRows(Math.min(rows, totalRows));
    }, 220);
  }, [totalRows]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setStep(2);
        simulateUpload();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setStep(2);
      simulateUpload();
    }
  };

  const handleReupload = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setParsedRows(0);
    setStep(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadTemplate = () => {
    alert('模板下载功能：将下载学生档案模板.xlsx');
  };

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 stagger-reveal">
        <div className="flex items-center justify-center py-3">
          <div className="flex items-center gap-2 max-w-2xl w-full">
            {[
              { num: 1, label: '下载模板', icon: FileSpreadsheet },
              { num: 2, label: '上传文件', icon: Upload },
              { num: 3, label: '确认导入', icon: Check },
            ].map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <div key={s.num} className="flex items-center flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border-2',
                        isActive && 'bg-gradient-primary text-white border-primary-400 shadow-lg shadow-primary-500/30 scale-105',
                        isDone && 'bg-mint-500 text-white border-mint-400',
                        !isActive && !isDone && 'bg-white text-ink-400 border-ink-200'
                      )}
                    >
                      {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div className="hidden sm:block">
                      <div
                        className={cn(
                          'text-sm font-semibold transition-colors',
                          isActive ? 'text-primary-600' : isDone ? 'text-mint-600' : 'text-ink-400'
                        )}
                      >
                        步骤 {s.num}
                      </div>
                      <div
                        className={cn(
                          'text-xs transition-colors',
                          isActive ? 'text-primary-500' : 'text-ink-500'
                        )}
                      >
                        {s.label}
                      </div>
                    </div>
                  </div>
                  {i < 2 && (
                    <div className="flex-1 mx-2 sm:mx-4 relative">
                      <div className="h-0.5 bg-ink-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            isDone ? 'w-full bg-mint-400' : step === s.num + 1 ? 'w-full bg-gradient-to-r from-primary-400 to-mint-400' : 'w-0'
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-5 lg:p-7">
                {step <= 2 && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={cn(
                      'relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden',
                      isDragging
                        ? 'border-primary-400 bg-primary-50/60 scale-[1.01]'
                        : selectedFile
                        ? 'border-mint-300 bg-mint-50/40'
                        : 'border-ink-200 bg-ink-50/50 hover:border-primary-300 hover:bg-primary-50/30',
                      isUploading && 'cursor-not-allowed'
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <div className="p-10 lg:p-14 flex flex-col items-center justify-center text-center">
                      <div
                        className={cn(
                          'w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300',
                          isDragging
                            ? 'bg-gradient-primary scale-110 shadow-xl'
                            : selectedFile
                            ? 'bg-mint-100'
                            : 'bg-primary-50 group-hover:bg-primary-100'
                        )}
                      >
                        <CloudUpload
                          className={cn(
                            'h-10 w-10 transition-all',
                            isDragging
                              ? 'text-white animate-bounce'
                              : selectedFile
                              ? 'text-mint-600'
                              : 'text-primary-500'
                          )}
                        />
                      </div>

                      <h3 className="text-xl font-bold text-ink-800 mb-2">
                        {isDragging
                          ? '松开以上传文件'
                          : selectedFile
                          ? '文件已选择，正在解析...'
                          : '点击或拖拽Excel文件到此处'}
                      </h3>
                      <p className="text-sm text-ink-500 mb-6 max-w-md">
                        支持 <span className="font-semibold text-primary-600">.xlsx</span> 和{' '}
                        <span className="font-semibold text-primary-600">.xls</span> 格式，
                        单个文件大小不超过 <span className="font-semibold">50MB</span>
                      </p>

                      {!isUploading && !selectedFile && (
                        <button className="btn-primary flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          选择文件
                        </button>
                      )}

                      {selectedFile && !isUploading && step === 2 && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-mint-200 shadow-sm">
                          <div className="w-10 h-10 rounded-lg bg-mint-100 flex items-center justify-center">
                            <FileSpreadsheet className="h-5 w-5 text-mint-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-ink-800 text-sm">{selectedFile.name}</div>
                            <div className="text-xs text-ink-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · {totalRows} 条数据
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                            }}
                            className="ml-2 p-1.5 rounded-lg hover:bg-ink-100 text-ink-400 hover:text-ink-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {isUploading && (
                        <div className="w-full max-w-sm mt-2 space-y-3 animate-fade-in-up">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-ink-600 font-medium">解析进度</span>
                            <span className="text-primary-600 font-bold">
                              {parsedRows} / {totalRows} 行
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-white border border-primary-200 overflow-hidden shadow-inner">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary-500 via-primary-400 to-mint-400 transition-all duration-300 relative overflow-hidden"
                              style={{ width: `${uploadProgress}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer bg-[length:200%_100%]" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-ink-400">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            正在解析Excel数据，请稍候...
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-fade-in-up">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-mint-50 to-mint-100/40 border border-mint-200/60">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-mint-600" />
                          <span className="text-sm font-medium text-mint-700">成功</span>
                        </div>
                        <div className="text-3xl font-bold text-mint-700">{stats.success}</div>
                        <div className="text-xs text-mint-600/70 mt-1">条数据正常</div>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-warning-high/10 to-warning-high/5 border border-warning-high/30">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="h-5 w-5 text-warning-high" />
                          <span className="text-sm font-medium text-warning-high">失败</span>
                        </div>
                        <div className="text-3xl font-bold text-warning-high">{stats.fail}</div>
                        <div className="text-xs text-warning-high/70 mt-1">条数据有误</div>
                      </div>
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-warning-low/15 to-warning-low/5 border border-warning-low/40">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-warning-low" />
                          <span className="text-sm font-medium text-warning-low">跳过</span>
                        </div>
                        <div className="text-3xl font-bold text-warning-low">{stats.skip}</div>
                        <div className="text-xs text-warning-low/70 mt-1">条重复数据</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-ink-800 flex items-center gap-2">
                          <FileCheck2 className="h-4 w-4 text-primary-500" />
                          数据预览（前10行）
                        </h4>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-mint-500" />
                            成功
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-warning-high" />
                            失败
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-warning-low" />
                            跳过
                          </span>
                        </div>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-ink-200">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-ink-50 border-b border-ink-200">
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">#</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">学号</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">姓名</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">性别</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">学院</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">专业</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">年级</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">辅导员</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">状态</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">错误原因</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.map((row) => (
                              <tr
                                key={row.index}
                                className={cn(
                                  'border-b border-ink-100 transition-colors',
                                  row.status === 'error' && 'bg-warning-high/5',
                                  row.status === 'skipped' && 'bg-warning-low/5'
                                )}
                              >
                                <td className="px-3 py-2.5 text-ink-400 font-mono">{row.index}</td>
                                <td className="px-3 py-2.5">
                                  <span className={cn(
                                    'font-mono',
                                    row.status === 'error' && !row.studentNo && 'text-warning-high'
                                  )}>
                                    {row.studentNo || '—'}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 font-medium text-ink-700">{row.name}</td>
                                <td className="px-3 py-2.5 text-ink-600">{row.gender}</td>
                                <td className="px-3 py-2.5 text-ink-600 whitespace-nowrap">{row.college}</td>
                                <td className="px-3 py-2.5 text-ink-600 whitespace-nowrap">{row.major}</td>
                                <td className="px-3 py-2.5 text-ink-600">{row.grade}</td>
                                <td className="px-3 py-2.5 text-ink-600 whitespace-nowrap">{row.counselor}</td>
                                <td className="px-3 py-2.5">
                                  {row.status === 'success' && (
                                    <Badge color="risk-safe" size="sm" withDot>成功</Badge>
                                  )}
                                  {row.status === 'error' && (
                                    <Badge color="risk-high" size="sm" withDot>失败</Badge>
                                  )}
                                  {row.status === 'skipped' && (
                                    <Badge color="risk-medium" size="sm" withDot>跳过</Badge>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-warning-high text-xs max-w-[200px]">
                                  {row.errorMsg || '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center justify-end gap-3 p-4 rounded-2xl bg-white border border-ink-200 shadow-card">
              <button
                onClick={handleReupload}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                重新上传
              </button>
              <button
                onClick={() => setShowConfirmCancel(true)}
                className="px-5 py-2.5 bg-white border border-ink-200 text-ink-600 rounded-xl font-medium hover:bg-ink-50 hover:border-ink-300 transition-all duration-200"
              >
                取消
              </button>
              <button
                disabled={step < 3 || stats.fail > 5}
                className={cn(
                  'btn-primary flex items-center gap-2',
                  (step < 3 || stats.fail > 5) && 'opacity-50 cursor-not-allowed pointer-events-none'
                )}
              >
                <CheckCircle2 className="h-4 w-4" />
                确认导入 {stats.success} 条数据
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <Card className="border-primary-200/60 bg-gradient-to-br from-primary-50/40 to-white">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
                    <FileSpreadsheet className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-ink-800">学生档案模板</h4>
                    <p className="text-xs text-ink-500">学生档案模板.xlsx</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/70 border border-ink-100 mb-4 text-xs text-ink-600 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-mint-500 shrink-0" />
                    包含全部必填字段和示例
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-mint-500 shrink-0" />
                    字段说明和格式提示
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-mint-500 shrink-0" />
                    3 条示例数据参考
                  </div>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  下载模板文件
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileQuestion className="h-4 w-4 text-warning-low" />
                  上传须知
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {[
                    { title: '必填字段', desc: '学号、姓名、性别、学院、专业、年级为必填项，不能为空' },
                    { title: '学号格式', desc: '学号为10-12位纯数字，不可重复' },
                    { title: '日期格式', desc: '出生日期、入学日期请使用 YYYY-MM-DD 格式' },
                    { title: '手机号格式', desc: '11位中国大陆手机号，带区号固话请用 "-" 分隔' },
                    { title: '重复数据', desc: '系统将自动跳过学号已存在的重复记录，不会覆盖原有数据' },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-ink-700 mb-0.5">{item.title}</div>
                        <div className="text-xs text-ink-500 leading-relaxed">{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4 text-primary-500" />
                  历史上传记录
                </CardTitle>
                <CardDescription>最近 5 次批量导入</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {historyRecords.map((record, idx) => (
                  <div
                    key={record.id}
                    className="p-3 rounded-xl border border-ink-100 bg-ink-50/50 hover:bg-white hover:border-primary-100 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-ink-700 truncate group-hover:text-primary-600 transition-colors">
                          {record.fileName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ink-400">
                          <span>{record.time}</span>
                          <span>·</span>
                          <span>{record.operator}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-ink-300 group-hover:text-primary-400 transition-colors shrink-0 mt-0.5" />
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <Badge color="risk-safe" size="sm" variant="soft">
                        成功 {record.successCount}
                      </Badge>
                      {record.failCount > 0 && (
                        <Badge color="risk-high" size="sm" variant="soft">
                          失败 {record.failCount}
                        </Badge>
                      )}
                      {record.skipCount > 0 && (
                        <Badge color="risk-medium" size="sm" variant="soft">
                          跳过 {record.skipCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {showConfirmCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-slide-in">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-warning-high/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="h-6 w-6 text-warning-high" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-ink-800 mb-1">确认取消导入？</h3>
                    <p className="text-sm text-ink-500 leading-relaxed">
                      取消后当前上传进度将丢失，已解析的数据不会被保存。确定要取消吗？
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-ink-50 border-t border-ink-100">
                <button
                  onClick={() => setShowConfirmCancel(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-ink-200 text-ink-600 text-sm font-medium hover:bg-ink-100 transition-colors"
                >
                  继续上传
                </button>
                <button
                  onClick={() => {
                    setShowConfirmCancel(false);
                    handleReupload();
                  }}
                  className="px-4 py-2 rounded-xl bg-warning-high text-white text-sm font-medium hover:shadow-md transition-all"
                >
                  确认取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
