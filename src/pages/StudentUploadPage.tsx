import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout, type BreadcrumbItem } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useDataStore } from '@/store/dataStore';
import type { StudentProfile, Gender, RiskLevel, AssessmentDimension, DimensionResult } from '@/types';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
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
  Users,
  ArrowLeft,
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
  gender: Gender | string;
  age: number | string;
  college: string;
  major: string;
  grade: string;
  className: string;
  phone: string;
  counselor: string;
  medicalHistory: string;
  familyHistory: string;
  currentEmotionIndex: number | string;
  depressionScore: number | string;
  status: 'success' | 'error' | 'skipped';
  errorMsg?: string;
}

const templateColumns = [
  '学号', '姓名', '性别', '年龄', '学院', '专业', '年级', '班级',
  '辅导员', '联系电话', '既往病史', '家族史', '当前情绪指数', '抑郁得分'
];

const templateSampleData = [
  ['2024010001', '张三', '男', 19, '计算机学院', '软件工程', '大一', '软工2401班', '王老师', '13812345678', '无', '无', 85, 30],
  ['2024010002', '李四', '女', 18, '经济管理学院', '金融学', '大一', '金融2402班', '李老师', '13987654321', '无', '无', 78, 45],
  ['2024010003', '王五', '男', 20, '文学院', '汉语言文学', '大二', '中文2301班', '张老师', '13611112222', '过敏性鼻炎', '无', 92, 25],
];

function getRiskLevelFromScore(depressionScore: number): RiskLevel {
  if (depressionScore < 40) return 'safe';
  if (depressionScore < 55) return 'low';
  if (depressionScore < 70) return 'medium';
  return 'high';
}

function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

function validateStudentNo(studentNo: string): boolean {
  return /^\d{6,12}$/.test(studentNo);
}

export default function StudentUploadPage() {
  const navigate = useNavigate();
  const { students, addStudents, getUploadRecords, addUploadRecord, initializeData } = useDataStore();
  const [step, setStep] = useState<UploadStep>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedRows, setParsedRows] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const historyRecords = useMemo(() => getUploadRecords(), [getUploadRecords]);

  const stats = useMemo(() => {
    const success = previewData.filter(r => r.status === 'success').length;
    const fail = previewData.filter(r => r.status === 'error').length;
    const skip = previewData.filter(r => r.status === 'skipped').length;
    return { success, fail, skip };
  }, [previewData]);

  const handleDownloadTemplate = useCallback(() => {
    const wsData = [templateColumns, ...templateSampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '学生档案');
    XLSX.writeFile(wb, '学生档案导入模板.xlsx');
  }, []);

  const parseExcelFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setParsedRows(0);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

      if (jsonData.length < 2) {
        alert('Excel文件内容为空或格式不正确');
        setIsUploading(false);
        return;
      }

      const headers = jsonData[0].map((h: any) => String(h || '').trim());
      const rows = jsonData.slice(1);
      setTotalRows(rows.length);

      const existingNos = new Set(students.map(s => s.studentNo));

      const preview: PreviewRow[] = rows.map((row, idx) => {
        const rowData: Record<string, any> = {};
        headers.forEach((header, i) => {
          rowData[header] = row[i];
        });

        const studentNo = String(rowData['学号'] || rowData['studentNo'] || '').trim();
        const name = String(rowData['姓名'] || rowData['name'] || '').trim();
        const gender = String(rowData['性别'] || rowData['gender'] || '').trim();
        const age = rowData['年龄'] || rowData['age'] || '';
        const college = String(rowData['学院'] || rowData['college'] || '').trim();
        const major = String(rowData['专业'] || rowData['major'] || '').trim();
        const grade = String(rowData['年级'] || rowData['grade'] || '').trim();
        const className = String(rowData['班级'] || rowData['className'] || '').trim();
        const phone = String(rowData['联系电话'] || rowData['phone'] || '').trim();
        const counselor = String(rowData['辅导员'] || rowData['counselor'] || '').trim();
        const medicalHistory = String(rowData['既往病史'] || rowData['medicalHistory'] || '').trim();
        const familyHistory = String(rowData['家族史'] || rowData['familyHistory'] || '').trim();
        const currentEmotionIndex = rowData['当前情绪指数'] || rowData['currentEmotionIndex'] || '';
        const depressionScore = rowData['抑郁得分'] || rowData['depressionScore'] || '';

        let status: 'success' | 'error' | 'skipped' = 'success';
        const errors: string[] = [];

        if (!studentNo) {
          status = 'error';
          errors.push('学号不能为空');
        } else if (!validateStudentNo(studentNo)) {
          status = 'error';
          errors.push('学号格式不正确，应为6-12位数字');
        } else if (existingNos.has(studentNo)) {
          status = 'skipped';
          errors.push('学号已存在，跳过导入');
        }

        if (!name) {
          status = 'error';
          errors.push('姓名不能为空');
        }

        if (gender && gender !== '男' && gender !== '女') {
          if (status === 'success') status = 'error';
          errors.push('性别只能是"男"或"女"');
        }

        if (currentEmotionIndex !== '' && currentEmotionIndex !== undefined) {
          const val = Number(currentEmotionIndex);
          if (isNaN(val) || val < 0 || val > 100) {
            if (status === 'success') status = 'error';
            errors.push('情绪指数必须在0-100之间');
          }
        }

        if (phone && !validatePhone(phone)) {
          if (status === 'success') status = 'error';
          errors.push('手机号格式不正确');
        }

        return {
          index: idx + 1,
          studentNo,
          name,
          gender: gender as Gender | string,
          age,
          college,
          major,
          grade,
          className,
          phone,
          counselor,
          medicalHistory,
          familyHistory,
          currentEmotionIndex,
          depressionScore,
          status,
          errorMsg: errors.join('；') || undefined,
        };
      });

      setPreviewData(preview);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 8 + Math.random() * 15;
        const currentRows = Math.floor((progress / 100) * rows.length);
        setUploadProgress(Math.min(progress, 100));
        setParsedRows(Math.min(currentRows, rows.length));

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setStep(3);
          }, 300);
        }
      }, 150);

    } catch (error) {
      console.error('解析Excel失败:', error);
      alert('解析Excel文件失败，请检查文件格式是否正确');
      setIsUploading(false);
    }
  }, [students]);

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
        setImportSuccess(false);
        parseExcelFile(file);
      } else {
        alert('请上传 .xlsx 或 .xls 格式的Excel文件');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setStep(2);
        setImportSuccess(false);
        parseExcelFile(file);
      } else {
        alert('请上传 .xlsx 或 .xls 格式的Excel文件');
      }
    }
  };

  const handleReupload = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setParsedRows(0);
    setTotalRows(0);
    setPreviewData([]);
    setImportSuccess(false);
    setStep(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmImport = () => {
    const successRows = previewData.filter(r => r.status === 'success');
    if (successRows.length === 0) {
      alert('没有可导入的数据');
      return;
    }

    const newStudents: StudentProfile[] = successRows.map((row) => {
      const emotionIndex = row.currentEmotionIndex ? Number(row.currentEmotionIndex) : 80;
      const depressionScore = row.depressionScore ? Number(row.depressionScore) : 0;
      const riskLevel = row.depressionScore 
        ? getRiskLevelFromScore(Number(row.depressionScore))
        : 'safe';

      const dimensions: Record<AssessmentDimension, DimensionResult> = {
        depression: { score: Number(row.depressionScore) || 0, level: riskLevel === 'safe' ? '正常' : riskLevel === 'low' ? '轻度' : riskLevel === 'medium' ? '中度' : '重度' },
        anxiety: { score: Math.floor(Math.random() * 50) + 20, level: '正常' },
        stress: { score: Math.floor(Math.random() * 50) + 20, level: '正常' },
        sleep: { score: Math.floor(Math.random() * 50) + 20, level: '正常' },
        social: { score: Math.floor(Math.random() * 50) + 20, level: '正常' },
      };

      const emotionHistory = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return {
          date: d.toISOString().split('T')[0],
          value: Math.max(30, Math.min(100, Math.floor(emotionIndex + (Math.random() - 0.5) * 20))),
          source: 'assessment' as const,
        };
      });

      return {
        id: `STD${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
        name: row.name,
        gender: (row.gender as Gender) || '男',
        age: Number(row.age) || 18,
        studentNo: row.studentNo,
        schoolId: 'SCH0001',
        schoolName: '清华大学',
        college: row.college || '计算机学院',
        major: row.major || '软件工程',
        grade: row.grade || '大一',
        className: row.className || '',
        phone: row.phone || undefined,
        counselor: row.counselor || '未分配',
        currentEmotionIndex: emotionIndex,
        riskLevel,
        warningCount: 0,
        assessmentHistory: [{
          id: `ASM${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
          studentId: '',
          assessmentName: 'SDS自评量表',
          assessmentDate: new Date().toISOString().split('T')[0],
          overallScore: Math.floor(emotionIndex),
          dimensions,
          conclusion: '导入时初始化测评数据',
          isRetest: false,
        }],
        emotionHistory,
        warningHistory: [],
        medicalHistory: row.medicalHistory || undefined,
        familyHistory: row.familyHistory || undefined,
        tags: [],
      };
    });

    newStudents.forEach(s => {
      s.assessmentHistory[0].studentId = s.id;
    });

    const addedIds = addStudents(newStudents);

    addUploadRecord({
      fileName: selectedFile?.name || '未知文件',
      successCount: addedIds.length,
      failCount: stats.fail,
      skipCount: stats.skip,
      operator: '管理员',
    });

    setImportSuccess(true);
  };

  const handleGoToList = () => {
    navigate('/students');
  };

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 stagger-reveal">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回学生列表
          </button>
        </div>

        <div className="flex items-center justify-center py-3">
          <div className="flex items-center gap-2 max-w-2xl w-full">
            {[
              { num: 1, label: '下载模板', icon: FileSpreadsheet },
              { num: 2, label: '上传文件', icon: Upload },
              { num: 3, label: '确认导入', icon: Check },
            ].map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isDone = step > s.num || importSuccess;
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
                {step <= 2 && !importSuccess && (
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
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
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

                {importSuccess && (
                  <div className="py-10 text-center animate-fade-in-up">
                    <div className="w-20 h-20 rounded-full bg-mint-100 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-12 w-12 text-mint-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-ink-800 mb-3">导入成功！</h3>
                    <p className="text-ink-600 mb-6">
                      成功导入 <span className="font-bold text-mint-600">{stats.success}</span> 条学生数据
                    </p>
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                      <div className="p-4 rounded-xl bg-mint-50 border border-mint-200">
                        <div className="text-2xl font-bold text-mint-600">{stats.success}</div>
                        <div className="text-xs text-mint-600/70">成功</div>
                      </div>
                      <div className="p-4 rounded-xl bg-warning-high/10 border border-warning-high/30">
                        <div className="text-2xl font-bold text-warning-high">{stats.fail}</div>
                        <div className="text-xs text-warning-high/70">失败</div>
                      </div>
                      <div className="p-4 rounded-xl bg-warning-low/15 border border-warning-low/40">
                        <div className="text-2xl font-bold text-warning-low">{stats.skip}</div>
                        <div className="text-xs text-warning-low/70">跳过</div>
                      </div>
                    </div>
                    <button
                      onClick={handleGoToList}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      查看学生列表
                    </button>
                  </div>
                )}

                {step === 3 && !importSuccess && (
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
                          数据预览
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
                      <div className="overflow-x-auto rounded-xl border border-ink-200 max-h-[400px] overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="sticky top-0 bg-ink-50 z-10">
                            <tr className="border-b border-ink-200">
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">#</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">学号</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">姓名</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">性别</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">学院</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">专业</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">年级</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">辅导员</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">情绪指数</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">状态</th>
                              <th className="px-3 py-2.5 text-left font-semibold text-ink-600 whitespace-nowrap">错误原因</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.slice(0, 50).map((row) => (
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
                                <td className="px-3 py-2.5 font-medium text-ink-700">{row.name || '—'}</td>
                                <td className="px-3 py-2.5 text-ink-600">{row.gender || '—'}</td>
                                <td className="px-3 py-2.5 text-ink-600 whitespace-nowrap">{row.college || '—'}</td>
                                <td className="px-3 py-2.5 text-ink-600 whitespace-nowrap">{row.major || '—'}</td>
                                <td className="px-3 py-2.5 text-ink-600">{row.grade || '—'}</td>
                                <td className="px-3 py-2.5 text-ink-600 whitespace-nowrap">{row.counselor || '—'}</td>
                                <td className="px-3 py-2.5 text-ink-600">{row.currentEmotionIndex || '—'}</td>
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
                      {previewData.length > 50 && (
                        <p className="text-xs text-ink-400 mt-2 text-center">
                          仅显示前50行，共 {previewData.length} 行数据
                        </p>
                      )}
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
              {step === 3 && !importSuccess && (
                <button
                  onClick={handleConfirmImport}
                  disabled={stats.success === 0}
                  className={cn(
                    'btn-primary flex items-center gap-2',
                    stats.success === 0 && 'opacity-50 cursor-not-allowed pointer-events-none'
                  )}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  确认导入 {stats.success} 条数据
                </button>
              )}
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
                    { title: '必填字段', desc: '学号、姓名为必填项，不能为空' },
                    { title: '学号格式', desc: '学号为6-12位纯数字，不可重复' },
                    { title: '性别格式', desc: '只能填写"男"或"女"' },
                    { title: '手机号格式', desc: '11位中国大陆手机号' },
                    { title: '情绪指数', desc: '0-100的整数，数值越高情绪越好' },
                    { title: '抑郁得分', desc: '用于计算风险等级，得分越高风险越大' },
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
                <CardDescription>最近 20 次批量导入</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {historyRecords.length === 0 ? (
                  <p className="text-sm text-ink-400 text-center py-4">暂无上传记录</p>
                ) : (
                  historyRecords.map((record, idx) => (
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
                  ))
                )}
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
