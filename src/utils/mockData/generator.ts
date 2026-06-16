import type {
  ProvinceData,
  School,
  SchoolType,
  RiskLevel,
  WarningLevel,
  TriggerType,
  WarningStatus,
  WarningRecord,
  ApprovalRecord,
  ApprovalStatus,
  InterventionRecord,
  InterventionType,
  StudentProfile,
  Gender,
  AssessmentDimension,
  AssessmentLevel,
  AssessmentRecord,
  EmotionPoint,
  EmotionSource,
  CollegeEmotionTrend,
  CrisisEvent,
  CrisisEventType,
  WeeklyReport,
  ReportScope,
  KPIData,
} from '../../types';

const PROVINCES: string[] = [
  '北京市', '天津市', '河北省', '山西省', '内蒙古自治区',
  '辽宁省', '吉林省', '黑龙江省',
  '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省',
  '重庆市', '四川省', '贵州省', '云南省', '西藏自治区',
  '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区',
  '台湾省', '香港特别行政区', '澳门特别行政区',
];

const UNIVERSITIES: { name: string; province: string; type: SchoolType; base: number }[] = [
  { name: '清华大学', province: '北京市', type: '本科', base: 48000 },
  { name: '北京大学', province: '北京市', type: '本科', base: 46000 },
  { name: '中国人民大学', province: '北京市', type: '本科', base: 28000 },
  { name: '北京师范大学', province: '北京市', type: '本科', base: 25000 },
  { name: '北京航空航天大学', province: '北京市', type: '本科', base: 37000 },
  { name: '北京理工大学', province: '北京市', type: '本科', base: 31000 },
  { name: '中国农业大学', province: '北京市', type: '本科', base: 26000 },
  { name: '北京邮电大学', province: '北京市', type: '本科', base: 24000 },
  { name: '北京交通大学', province: '北京市', type: '本科', base: 26000 },
  { name: '北京科技大学', province: '北京市', type: '本科', base: 24000 },
  { name: '北京协和医学院', province: '北京市', type: '本科', base: 8000 },
  { name: '中央财经大学', province: '北京市', type: '本科', base: 15000 },
  { name: '对外经济贸易大学', province: '北京市', type: '本科', base: 16000 },
  { name: '首都师范大学', province: '北京市', type: '本科', base: 28000 },
  { name: '北京工业大学', province: '北京市', type: '本科', base: 25000 },
  { name: '北京信息科技大学', province: '北京市', type: '本科', base: 20000 },
  { name: '北京工商大学', province: '北京市', type: '本科', base: 18000 },
  { name: '北京电子科技职业学院', province: '北京市', type: '高职', base: 12000 },
  { name: '北京工业职业技术学院', province: '北京市', type: '高职', base: 9000 },

  { name: '复旦大学', province: '上海市', type: '本科', base: 35000 },
  { name: '上海交通大学', province: '上海市', type: '本科', base: 42000 },
  { name: '同济大学', province: '上海市', type: '本科', base: 38000 },
  { name: '华东师范大学', province: '上海市', type: '本科', base: 26000 },
  { name: '上海财经大学', province: '上海市', type: '本科', base: 18000 },
  { name: '上海外国语大学', province: '上海市', type: '本科', base: 13000 },
  { name: '华东理工大学', province: '上海市', type: '本科', base: 26000 },
  { name: '东华大学', province: '上海市', type: '本科', base: 22000 },
  { name: '上海大学', province: '上海市', type: '本科', base: 38000 },
  { name: '上海师范大学', province: '上海市', type: '本科', base: 28000 },
  { name: '上海理工大学', province: '上海市', type: '本科', base: 24000 },
  { name: '上海海事大学', province: '上海市', type: '本科', base: 20000 },
  { name: '上海职业技术学院', province: '上海市', type: '高职', base: 10000 },
  { name: '上海城建职业学院', province: '上海市', type: '高职', base: 11000 },

  { name: '南京大学', province: '江苏省', type: '本科', base: 36000 },
  { name: '东南大学', province: '江苏省', type: '本科', base: 34000 },
  { name: '南京航空航天大学', province: '江苏省', type: '本科', base: 28000 },
  { name: '南京理工大学', province: '江苏省', type: '本科', base: 27000 },
  { name: '河海大学', province: '江苏省', type: '本科', base: 25000 },
  { name: '南京师范大学', province: '江苏省', type: '本科', base: 26000 },
  { name: '苏州大学', province: '江苏省', type: '本科', base: 38000 },
  { name: '江南大学', province: '江苏省', type: '本科', base: 26000 },
  { name: '中国矿业大学', province: '江苏省', type: '本科', base: 28000 },
  { name: '南京工业职业技术大学', province: '江苏省', type: '高职', base: 15000 },
  { name: '无锡职业技术学院', province: '江苏省', type: '高职', base: 12000 },

  { name: '浙江大学', province: '浙江省', type: '本科', base: 54000 },
  { name: '浙江工业大学', province: '浙江省', type: '本科', base: 28000 },
  { name: '宁波大学', province: '浙江省', type: '本科', base: 26000 },
  { name: '浙江师范大学', province: '浙江省', type: '本科', base: 28000 },
  { name: '杭州电子科技大学', province: '浙江省', type: '本科', base: 24000 },
  { name: '浙江工商大学', province: '浙江省', type: '本科', base: 22000 },
  { name: '温州大学', province: '浙江省', type: '本科', base: 20000 },
  { name: '金华职业技术学院', province: '浙江省', type: '高职', base: 14000 },
  { name: '浙江金融职业学院', province: '浙江省', type: '高职', base: 10000 },

  { name: '中山大学', province: '广东省', type: '本科', base: 48000 },
  { name: '华南理工大学', province: '广东省', type: '本科', base: 36000 },
  { name: '暨南大学', province: '广东省', type: '本科', base: 32000 },
  { name: '华南师范大学', province: '广东省', type: '本科', base: 30000 },
  { name: '深圳大学', province: '广东省', type: '本科', base: 34000 },
  { name: '南方科技大学', province: '广东省', type: '本科', base: 8000 },
  { name: '广东工业大学', province: '广东省', type: '本科', base: 32000 },
  { name: '广州大学', province: '广东省', type: '本科', base: 28000 },
  { name: '深圳职业技术学院', province: '广东省', type: '高职', base: 22000 },
  { name: '广州番禺职业技术学院', province: '广东省', type: '高职', base: 13000 },

  { name: '武汉大学', province: '湖北省', type: '本科', base: 45000 },
  { name: '华中科技大学', province: '湖北省', type: '本科', base: 48000 },
  { name: '华中师范大学', province: '湖北省', type: '本科', base: 28000 },
  { name: '武汉理工大学', province: '湖北省', type: '本科', base: 36000 },
  { name: '中国地质大学(武汉)', province: '湖北省', type: '本科', base: 26000 },
  { name: '中南财经政法大学', province: '湖北省', type: '本科', base: 22000 },
  { name: '湖北工业大学', province: '湖北省', type: '本科', base: 22000 },
  { name: '武汉职业技术学院', province: '湖北省', type: '高职', base: 14000 },

  { name: '四川大学', province: '四川省', type: '本科', base: 52000 },
  { name: '电子科技大学', province: '四川省', type: '本科', base: 34000 },
  { name: '西南交通大学', province: '四川省', type: '本科', base: 30000 },
  { name: '四川农业大学', province: '四川省', type: '本科', base: 32000 },
  { name: '西南财经大学', province: '四川省', type: '本科', base: 20000 },
  { name: '四川师范大学', province: '四川省', type: '本科', base: 28000 },
  { name: '成都理工大学', province: '四川省', type: '本科', base: 26000 },
  { name: '成都纺织高等专科学校', province: '四川省', type: '高职', base: 11000 },

  { name: '山东大学', province: '山东省', type: '本科', base: 48000 },
  { name: '中国海洋大学', province: '山东省', type: '本科', base: 20000 },
  { name: '中国石油大学(华东)', province: '山东省', type: '本科', base: 22000 },
  { name: '青岛大学', province: '山东省', type: '本科', base: 34000 },
  { name: '山东师范大学', province: '山东省', type: '本科', base: 30000 },
  { name: '济南大学', province: '山东省', type: '本科', base: 32000 },
  { name: '山东商业职业技术学院', province: '山东省', type: '高职', base: 15000 },

  { name: '西安交通大学', province: '陕西省', type: '本科', base: 38000 },
  { name: '西北工业大学', province: '陕西省', type: '本科', base: 30000 },
  { name: '西安电子科技大学', province: '陕西省', type: '本科', base: 32000 },
  { name: '西北农林科技大学', province: '陕西省', type: '本科', base: 22000 },
  { name: '陕西师范大学', province: '陕西省', type: '本科', base: 24000 },
  { name: '长安大学', province: '陕西省', type: '本科', base: 26000 },
  { name: '西安航空职业技术学院', province: '陕西省', type: '高职', base: 11000 },

  { name: '天津大学', province: '天津市', type: '本科', base: 34000 },
  { name: '南开大学', province: '天津市', type: '本科', base: 30000 },
  { name: '天津工业大学', province: '天津市', type: '本科', base: 24000 },
  { name: '天津师范大学', province: '天津市', type: '本科', base: 26000 },
  { name: '天津职业大学', province: '天津市', type: '高职', base: 13000 },

  { name: '重庆大学', province: '重庆市', type: '本科', base: 42000 },
  { name: '西南大学', province: '重庆市', type: '本科', base: 40000 },
  { name: '西南政法大学', province: '重庆市', type: '本科', base: 22000 },
  { name: '重庆邮电大学', province: '重庆市', type: '本科', base: 24000 },
  { name: '重庆电子工程职业学院', province: '重庆市', type: '高职', base: 16000 },

  { name: '厦门大学', province: '福建省', type: '本科', base: 36000 },
  { name: '福州大学', province: '福建省', type: '本科', base: 28000 },
  { name: '福建师范大学', province: '福建省', type: '本科', base: 26000 },
  { name: '厦门城市职业学院', province: '福建省', type: '高职', base: 9000 },

  { name: '湖南大学', province: '湖南省', type: '本科', base: 34000 },
  { name: '中南大学', province: '湖南省', type: '本科', base: 46000 },
  { name: '湖南师范大学', province: '湖南省', type: '本科', base: 32000 },
  { name: '长沙民政职业技术学院', province: '湖南省', type: '高职', base: 16000 },

  { name: '哈尔滨工业大学', province: '黑龙江省', type: '本科', base: 36000 },
  { name: '哈尔滨工程大学', province: '黑龙江省', type: '本科', base: 24000 },
  { name: '东北林业大学', province: '黑龙江省', type: '本科', base: 22000 },

  { name: '吉林大学', province: '吉林省', type: '本科', base: 50000 },
  { name: '东北师范大学', province: '吉林省', type: '本科', base: 24000 },
  { name: '长春职业技术学院', province: '吉林省', type: '高职', base: 10000 },

  { name: '大连理工大学', province: '辽宁省', type: '本科', base: 32000 },
  { name: '东北大学', province: '辽宁省', type: '本科', base: 34000 },
  { name: '辽宁大学', province: '辽宁省', type: '本科', base: 26000 },
  { name: '辽宁轨道交通职业学院', province: '辽宁省', type: '高职', base: 8000 },

  { name: '郑州大学', province: '河南省', type: '本科', base: 54000 },
  { name: '河南大学', province: '河南省', type: '本科', base: 38000 },
  { name: '河南师范大学', province: '河南省', type: '本科', base: 28000 },
  { name: '黄河水利职业技术学院', province: '河南省', type: '高职', base: 13000 },

  { name: '河北工业大学', province: '河北省', type: '本科', base: 24000 },
  { name: '燕山大学', province: '河北省', type: '本科', base: 28000 },
  { name: '河北师范大学', province: '河北省', type: '本科', base: 26000 },
  { name: '河北工业职业技术学院', province: '河北省', type: '高职', base: 11000 },

  { name: '安徽大学', province: '安徽省', type: '本科', base: 30000 },
  { name: '中国科学技术大学', province: '安徽省', type: '本科', base: 15000 },
  { name: '合肥工业大学', province: '安徽省', type: '本科', base: 30000 },
  { name: '芜湖职业技术学院', province: '安徽省', type: '高职', base: 12000 },

  { name: '南昌大学', province: '江西省', type: '本科', base: 38000 },
  { name: '江西师范大学', province: '江西省', type: '本科', base: 26000 },
  { name: '江西财经大学', province: '江西省', type: '本科', base: 22000 },
  { name: '江西应用技术职业学院', province: '江西省', type: '高职', base: 11000 },

  { name: '广西大学', province: '广西壮族自治区', type: '本科', base: 34000 },
  { name: '广西师范大学', province: '广西壮族自治区', type: '本科', base: 24000 },
  { name: '南宁职业技术学院', province: '广西壮族自治区', type: '高职', base: 10000 },

  { name: '贵州大学', province: '贵州省', type: '本科', base: 30000 },
  { name: '贵州师范大学', province: '贵州省', type: '本科', base: 22000 },
  { name: '贵州交通职业技术学院', province: '贵州省', type: '高职', base: 9000 },

  { name: '云南大学', province: '云南省', type: '本科', base: 28000 },
  { name: '昆明理工大学', province: '云南省', type: '本科', base: 30000 },
  { name: '云南师范大学', province: '云南省', type: '本科', base: 24000 },
  { name: '昆明冶金高等专科学校', province: '云南省', type: '高职', base: 10000 },

  { name: '甘肃农业大学', province: '甘肃省', type: '本科', base: 18000 },
  { name: '兰州大学', province: '甘肃省', type: '本科', base: 26000 },
  { name: '兰州资源环境职业技术学院', province: '甘肃省', type: '高职', base: 8000 },

  { name: '海南大学', province: '海南省', type: '本科', base: 28000 },
  { name: '海南师范大学', province: '海南省', type: '本科', base: 18000 },
  { name: '海南职业技术学院', province: '海南省', type: '高职', base: 7000 },

  { name: '内蒙古大学', province: '内蒙古自治区', type: '本科', base: 22000 },
  { name: '内蒙古师范大学', province: '内蒙古自治区', type: '本科', base: 20000 },
  { name: '内蒙古建筑职业技术学院', province: '内蒙古自治区', type: '高职', base: 7000 },

  { name: '宁夏大学', province: '宁夏回族自治区', type: '本科', base: 16000 },
  { name: '宁夏职业技术学院', province: '宁夏回族自治区', type: '高职', base: 6000 },

  { name: '青海大学', province: '青海省', type: '本科', base: 14000 },
  { name: '青海师范大学', province: '青海省', type: '本科', base: 10000 },

  { name: '西藏大学', province: '西藏自治区', type: '本科', base: 12000 },
  { name: '西藏民族大学', province: '西藏自治区', type: '本科', base: 10000 },

  { name: '新疆大学', province: '新疆维吾尔自治区', type: '本科', base: 26000 },
  { name: '石河子大学', province: '新疆维吾尔自治区', type: '本科', base: 22000 },
  { name: '新疆农业职业技术学院', province: '新疆维吾尔自治区', type: '高职', base: 9000 },

  { name: '山西大学', province: '山西省', type: '本科', base: 24000 },
  { name: '太原理工大学', province: '山西省', type: '本科', base: 26000 },
  { name: '山西职业技术学院', province: '山西省', type: '高职', base: 10000 },
];

const SURNAMES = '王李张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁宋郑谢韩唐冯于董萧程曹袁邓许傅沈曾彭吕苏卢蒋蔡贾丁魏薛叶阎余潘杜戴夏钟汪田任姜范方石姚谭廖邹熊金陆郝孔白崔康毛邱秦江史顾侯邵孟龙万段漕钱汤尹黎易常武乔贺赖龚文欧阳司马上官诸葛东方';
const GIVEN_NAMES_M = ['伟', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英', '文', '辉', '力', '健', '世', '广', '志', '义', '兴', '良', '海', '山', '仁', '波', '宁', '贵', '福', '生', '龙', '元', '全', '国', '胜', '学', '祥', '才', '发', '武', '新', '利', '清', '飞', '彬', '富', '顺', '信', '子', '杰', '浩', '俊', '泽', '宇', '辰', '睿', '博'];
const GIVEN_NAMES_F = ['芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '艳', '杰', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英', '文', '辉', '雪', '琳', '欣', '颖', '佳', '怡', '璐', '瑶', '萱', '梦', '琪', '彤', '蕊', '馨', '悦', '晨', '薇', '妮', '茜', '菲', '娟', '英', '华', '慧', '巧', '美', '淑', '惠', '珠', '翠', '雅', '芝', '玉', '萍', '红', '娥', '玲', '琴'];

const COLLEGES_COMMON = [
  '计算机学院', '信息工程学院', '机械工程学院', '电气工程学院', '土木工程学院',
  '经济管理学院', '外国语学院', '艺术设计学院', '生命科学学院', '化学学院',
  '物理学院', '数学学院', '文学院', '法学院', '新闻传播学院',
  '医学部', '药学院', '护理学院', '公共卫生学院', '心理学院',
  '体育学院', '音乐学院', '历史学院', '哲学学院', '教育学院',
];

const MAJORS_BY_COLLEGE: Record<string, string[]> = {
  '计算机学院': ['计算机科学与技术', '软件工程', '人工智能', '数据科学与大数据技术', '网络空间安全'],
  '信息工程学院': ['通信工程', '电子信息工程', '物联网工程', '微电子科学与工程'],
  '机械工程学院': ['机械设计制造及其自动化', '机械电子工程', '车辆工程', '工业设计'],
  '电气工程学院': ['电气工程及其自动化', '自动化', '测控技术与仪器', '能源与动力工程'],
  '土木工程学院': ['土木工程', '建筑环境与能源应用工程', '给排水科学与工程', '工程管理'],
  '经济管理学院': ['工商管理', '会计学', '金融学', '市场营销', '国际经济与贸易', '人力资源管理'],
  '外国语学院': ['英语', '日语', '法语', '德语', '翻译'],
  '艺术设计学院': ['视觉传达设计', '环境设计', '产品设计', '数字媒体艺术', '动画'],
  '生命科学学院': ['生物科学', '生物技术', '生物工程', '生态学'],
  '化学学院': ['化学', '应用化学', '化学工程与工艺', '制药工程'],
  '物理学院': ['物理学', '应用物理学', '核物理'],
  '数学学院': ['数学与应用数学', '信息与计算科学', '统计学'],
  '文学院': ['汉语言文学', '汉语国际教育', '秘书学'],
  '法学院': ['法学', '知识产权'],
  '新闻传播学院': ['新闻学', '广播电视学', '广告学', '传播学'],
  '医学部': ['临床医学', '基础医学', '口腔医学'],
  '药学院': ['药学', '药物制剂', '临床药学'],
  '护理学院': ['护理学', '助产学'],
  '公共卫生学院': ['预防医学', '公共事业管理', '卫生检验与检疫'],
  '心理学院': ['心理学', '应用心理学'],
  '体育学院': ['体育教育', '运动训练', '社会体育指导与管理'],
  '音乐学院': ['音乐表演', '音乐学', '舞蹈表演'],
  '历史学院': ['历史学', '考古学', '文物与博物馆学'],
  '哲学学院': ['哲学', '宗教学'],
  '教育学院': ['教育学', '学前教育', '特殊教育'],
};

const GRADES = ['大一', '大二', '大三', '大四', '研一', '研二', '研三', '博一', '博二'];

const COUNSELOR_NAMES = [
  '张老师', '李老师', '王老师', '刘老师', '陈老师', '杨老师', '赵老师', '黄老师',
  '周老师', '吴老师', '徐老师', '孙老师', '胡老师', '朱老师', '高老师', '林老师',
  '何老师', '郭老师', '马老师', '罗老师', '梁老师', '宋老师', '郑老师', '谢老师',
];

const ASSESSMENT_NAMES = ['SCL-90症状自评量表', 'PHQ-9抑郁量表', 'GAD-7焦虑量表', 'UCLA孤独量表', 'PSS压力知觉量表', 'PSQI睡眠质量量表', '综合心理健康测评', 'SAS焦虑自评量表', 'SDS抑郁自评量表'];

const TRIGGER_REASONS_EMOTION = [
  '连续7天情绪指数低于正常阈值',
  '社交平台内容出现消极词汇频率突增',
  '深夜APP使用时长异常增加',
  'APP情绪标签数据持续走低',
];
const TRIGGER_REASONS_ASSESSMENT = [
  '最新测评PHQ-9得分显示中度抑郁倾向',
  'SCL-90量表多个维度得分异常',
  'GAD-7得分显示严重焦虑',
  '复测结果未改善且有加重趋势',
];
const TRIGGER_REASONS_BEHAVIOR = [
  '连续多日未参与校园活动',
  '图书馆门禁记录异常减少',
  '消费模式突变（消费骤降）',
  '学业成绩大幅下滑',
];
const TRIGGER_REASONS_COMPOSITE = [
  '综合评估情绪、测评、行为多维异常',
  '辅导员报告+AI分析综合触发',
  '室友上报+数据分析综合判断',
];

const APPROVER_ROLES = ['辅导员', '学院心理工作站', '学校心理咨询中心'];
const APPROVAL_STAGES = [1, 2, 3] as const;
const STAGE_NAMES: Record<number, string> = {
  1: '学院初审',
  2: '中心复核',
  3: '学校审批',
};

const INTERVENTION_TYPE_NAMES: Record<InterventionType, string> = {
  counsel: '心理咨询',
  referral: '转介就医',
  contact_family: '联系家属',
  follow_up: '跟踪随访',
  other: '其他措施',
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pickRandom<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randomInt(min: number, max: number, rand: () => number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number, rand: () => number): number {
  const num = rand() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
}

function generateName(gender: Gender, rand: () => number): string {
  const surname = SURNAMES[Math.floor(rand() * SURNAMES.length)];
  const givenPool = gender === '男' ? GIVEN_NAMES_M : GIVEN_NAMES_F;
  const len = rand() > 0.4 ? 1 : 2;
  let given = '';
  for (let i = 0; i < len; i++) {
    given += givenPool[Math.floor(rand() * givenPool.length)];
  }
  return surname + given;
}

function generatePhone(rand: () => number): string {
  const prefixes = ['138', '139', '150', '151', '152', '158', '159', '182', '183', '186', '187', '188', '189', '135', '136', '137'];
  let phone = pickRandom(prefixes, rand);
  for (let i = 0; i < 8; i++) {
    phone += Math.floor(rand() * 10).toString();
  }
  return phone;
}

function generateStudentNo(rand: () => number): string {
  const year = 2020 + randomInt(0, 4, rand);
  let no = year.toString();
  for (let i = 0; i < 6; i++) {
    no += Math.floor(rand() * 10).toString();
  }
  return no;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateStr(date: Date): string {
  return formatDateISO(date) + ' ' +
    String(date.getHours()).padStart(2, '0') + ':' +
    String(date.getMinutes()).padStart(2, '0') + ':' +
    String(date.getSeconds()).padStart(2, '0');
}

function formatDateISO(date: Date): string {
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
}

function getAssessmentLevel(score: number, dimension: AssessmentDimension): AssessmentLevel {
  const thresholds: Record<AssessmentDimension, [number, number, number]> = {
    depression: [5, 10, 20],
    anxiety: [5, 10, 15],
    stress: [13, 27, 40],
    sleep: [7, 11, 15],
    social: [10, 20, 30],
  };
  const [a, b, c] = thresholds[dimension];
  if (score < a) return '正常';
  if (score < b) return '轻度';
  if (score < c) return '中度';
  return '重度';
}

function getRiskFromScore(emotionIndex: number, depressionScore: number): RiskLevel {
  if (emotionIndex >= 75 && depressionScore < 5) return 'safe';
  if (emotionIndex >= 60 && depressionScore < 10) return 'low';
  if (emotionIndex >= 45 && depressionScore < 20) return 'medium';
  return 'high';
}

export function generateProvinces(seed: number = 42): ProvinceData[] {
  const rand = seededRandom(seed);
  return PROVINCES.map((name) => {
    const baseStudentCount = randomInt(150000, 2500000, rand);
    const highRiskRatio = randomFloat(0.003, 0.015, 4, rand);
    const highRiskCount = Math.round(baseStudentCount * highRiskRatio);
    return {
      name,
      value: randomInt(25, 85, rand),
      studentCount: baseStudentCount,
      highRiskCount,
      warningCount: Math.round(highRiskCount * randomFloat(1.2, 2.5, 2, rand)),
    };
  });
}

export function generateSchools(seed: number = 42): School[] {
  const rand = seededRandom(seed);
  return UNIVERSITIES.map((u, i) => {
    const variance = 1 + randomFloat(-0.05, 0.1, 4, rand);
    const studentCount = Math.round(u.base * variance);
    const warningCount = Math.round(studentCount * randomFloat(0.003, 0.018, 4, rand));
    return {
      id: `SCH${String(i + 1).padStart(4, '0')}`,
      name: u.name,
      province: u.province,
      type: u.type,
      studentCount,
      warningCount,
      avgResponseHours: randomFloat(1.5, 12, 1, rand),
      resolutionRate: randomFloat(0.82, 0.98, 4, rand),
    };
  });
}

function generateSchoolsMap(): Record<string, School[]> {
  const schools = generateSchools();
  const map: Record<string, School[]> = {};
  schools.forEach((s) => {
    if (!map[s.province]) map[s.province] = [];
    map[s.province].push(s);
  });
  return map;
}

export function generateKPIData(seed: number = 42): KPIData {
  const rand = seededRandom(seed);
  return {
    totalStudents: randomInt(38000000, 42000000, rand),
    totalStudentsYoY: randomFloat(0.02, 0.05, 4, rand),
    riskStudents: randomInt(450000, 650000, rand),
    riskStudentsYoY: randomFloat(-0.08, 0.02, 4, rand),
    resolutionRate: randomFloat(0.9, 0.96, 4, rand),
    resolutionRateYoY: randomFloat(0.01, 0.04, 4, rand),
    avgResponseHours: randomFloat(3.5, 5.5, 2, rand),
    avgResponseHoursYoY: randomFloat(-0.15, -0.05, 4, rand),
  };
}

export function generateStudents(
  schools: School[],
  count: number = 220,
  seed: number = 42
): StudentProfile[] {
  const rand = seededRandom(seed);
  const students: StudentProfile[] = [];

  for (let i = 0; i < count; i++) {
    const school = pickRandom(schools, rand);
    const gender: Gender = rand() > 0.5 ? '男' : '女';
    const college = pickRandom(COLLEGES_COMMON, rand);
    const majorList = MAJORS_BY_COLLEGE[college] || ['综合专业'];
    const major = pickRandom(majorList, rand);
    const grade = pickRandom(GRADES, rand);
    const className = `${grade.slice(0, 2)}${major.slice(0, 2)}${randomInt(1, 6, rand)}班`;
    const age = grade.includes('研') || grade.includes('博') ? randomInt(22, 30, rand) : randomInt(17, 24, rand);
    const currentEmotionIndex = randomInt(30, 95, rand);
    const depressionScore = currentEmotionIndex > 70 ? randomInt(1, 8, rand) :
                           currentEmotionIndex > 55 ? randomInt(5, 18, rand) : randomInt(10, 27, rand);
    const riskLevel = getRiskFromScore(currentEmotionIndex, depressionScore);
    const warningCount = riskLevel === 'high' ? randomInt(2, 5, rand) :
                         riskLevel === 'medium' ? randomInt(1, 3, rand) :
                         riskLevel === 'low' ? randomInt(0, 1, rand) : 0;

    const assessmentHistory = generateAssessmentHistory(`STD${String(i + 1).padStart(5, '0')}`, rand);
    const emotionHistory = generateEmotionHistory(rand);
    const warningHistory: WarningRecord[] = [];
    const tagsPool = ['独生子女', '离异家庭', '新生适应', '学业压力', '就业焦虑', '情感问题', '经济困难', '人际关系', '自卑心理'];
    const tagCount = riskLevel === 'high' ? randomInt(2, 4, rand) : riskLevel === 'medium' ? randomInt(1, 3, rand) : randomInt(0, 2, rand);
    const tags: string[] = [];
    const poolCopy = [...tagsPool];
    for (let t = 0; t < tagCount && poolCopy.length > 0; t++) {
      const idx = Math.floor(rand() * poolCopy.length);
      tags.push(poolCopy.splice(idx, 1)[0]);
    }

    const hasMedical = rand() < 0.15;
    const hasFamily = rand() < 0.2;

    students.push({
      id: `STD${String(i + 1).padStart(5, '0')}`,
      name: generateName(gender, rand),
      gender,
      age,
      studentNo: generateStudentNo(rand),
      schoolId: school.id,
      schoolName: school.name,
      college,
      major,
      grade,
      className,
      phone: generatePhone(rand),
      counselor: pickRandom(COUNSELOR_NAMES, rand),
      currentEmotionIndex,
      riskLevel,
      warningCount,
      assessmentHistory,
      emotionHistory,
      warningHistory,
      medicalHistory: hasMedical ? pickRandom(['曾确诊轻度抑郁', '焦虑症病史', '睡眠障碍', '曾就诊心理科'], rand) : undefined,
      familyHistory: hasFamily ? pickRandom(['父母离异', '家庭关系紧张', '亲人离世', '家庭教育严苛'], rand) : undefined,
      tags,
    });
  }

  return students;
}

function generateAssessmentHistory(studentId: string, rand: () => number): AssessmentRecord[] {
  const count = randomInt(2, 5, rand);
  const records: AssessmentRecord[] = [];
  const baseDate = new Date();
  baseDate.setFullYear(baseDate.getFullYear() - 1);

  let prevScore = 0;
  for (let i = 0; i < count; i++) {
    const daysOffset = randomInt(60, 120, rand) * (i + 1);
    const assessDate = addDays(new Date(), -daysOffset);
    const dimensions: Record<AssessmentDimension, { score: number; level: AssessmentLevel }> = {
      depression: { score: 0, level: '正常' },
      anxiety: { score: 0, level: '正常' },
      stress: { score: 0, level: '正常' },
      sleep: { score: 0, level: '正常' },
      social: { score: 0, level: '正常' },
    };
    let totalScore = 0;
    const dims: AssessmentDimension[] = ['depression', 'anxiety', 'stress', 'sleep', 'social'];
    dims.forEach((d) => {
      const score = randomInt(0, 28, rand);
      dimensions[d] = { score, level: getAssessmentLevel(score, d) };
      totalScore += score;
    });
    const isRetest = i > 0;
    const improvedPercent = isRetest && prevScore > 0 ?
      parseFloat(((prevScore - totalScore) / prevScore * 100).toFixed(1)) : undefined;
    prevScore = totalScore;

    records.push({
      id: `ASM${studentId}-${i}`,
      studentId,
      assessmentName: pickRandom(ASSESSMENT_NAMES, rand),
      assessmentDate: formatDateISO(assessDate),
      overallScore: totalScore,
      dimensions,
      conclusion: generateAssessmentConclusion(dimensions, rand),
      isRetest,
      improvedPercent,
    });
  }

  return records.sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
}

function generateAssessmentConclusion(
  dimensions: Record<AssessmentDimension, { score: number; level: AssessmentLevel }>,
  rand: () => number
): string {
  const moderateOrHigher: string[] = [];
  const dimNames: Record<AssessmentDimension, string> = {
    depression: '抑郁',
    anxiety: '焦虑',
    stress: '压力',
    sleep: '睡眠',
    social: '社交',
  };
  (Object.keys(dimensions) as AssessmentDimension[]).forEach((d) => {
    if (dimensions[d].level === '中度' || dimensions[d].level === '重度') {
      moderateOrHigher.push(dimNames[d]);
    }
  });

  if (moderateOrHigher.length === 0) {
    return pickRandom(['整体心理健康状况良好，各项维度均在正常范围内。', '心理状态稳定，建议继续保持良好的生活习惯。', '测评结果正常，情绪调适能力良好。'], rand);
  }
  const dimsStr = moderateOrHigher.join('、');
  if (moderateOrHigher.length <= 2) {
    return `存在${dimsStr}方面的困扰，建议加强自我调节，必要时可寻求专业心理咨询。`;
  }
  return `在${dimsStr}等方面存在较明显的心理压力，建议尽快预约心理咨询师进行进一步评估与干预。`;
}

function generateEmotionHistory(rand: () => number): EmotionPoint[] {
  const days = randomInt(30, 90, rand);
  const points: EmotionPoint[] = [];
  const sources: EmotionSource[] = ['social', 'app_usage', 'counsel', 'assessment'];
  let baseValue = randomInt(55, 80, rand);

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(new Date(), -i);
    const delta = randomInt(-8, 8, rand);
    baseValue = Math.max(25, Math.min(95, baseValue + delta));
    points.push({
      date: formatDateISO(date),
      value: baseValue,
      source: pickRandom(sources, rand),
    });
  }
  return points;
}

export function generateWarnings(
  schools: School[],
  students: StudentProfile[],
  count: number = 60,
  seed: number = 42
): WarningRecord[] {
  const rand = seededRandom(seed);
  const warnings: WarningRecord[] = [];

  const atRiskStudents = students.filter((s) => s.riskLevel !== 'safe');

  for (let i = 0; i < count; i++) {
    const student = atRiskStudents.length > 0 && i < atRiskStudents.length * 2
      ? atRiskStudents[i % atRiskStudents.length]
      : pickRandom(students, rand);
    const school = schools.find((s) => s.id === student.schoolId) || pickRandom(schools, rand);

    const level: WarningLevel = (student.riskLevel === 'high' && rand() > 0.4) ? 2 : (rand() > 0.7 ? 2 : 1);
    const triggerTypes: TriggerType[] = ['emotion', 'assessment', 'behavior', 'composite'];
    const triggerType = pickRandom(triggerTypes, rand);
    const triggerReason = pickRandom(
      triggerType === 'emotion' ? TRIGGER_REASONS_EMOTION :
      triggerType === 'assessment' ? TRIGGER_REASONS_ASSESSMENT :
      triggerType === 'behavior' ? TRIGGER_REASONS_BEHAVIOR : TRIGGER_REASONS_COMPOSITE,
      rand
    );

    const createdAtDays = randomInt(0, 60, rand);
    const createdAt = addDays(new Date(), -createdAtDays);
    createdAt.setHours(randomInt(8, 22, rand), randomInt(0, 59, rand), randomInt(0, 59, rand));

    const updatedAtDays = randomInt(0, createdAtDays, rand);
    const updatedAt = addDays(createdAt, updatedAtDays);

    const statuses: WarningStatus[] = ['pending', 'processing', 'approved', 'resolved', 'rejected'];
    const statusWeights = [0.08, 0.15, 0.2, 0.5, 0.07];
    let r = rand();
    let status: WarningStatus = 'resolved';
    let cumulative = 0;
    for (let s = 0; s < statuses.length; s++) {
      cumulative += statusWeights[s];
      if (r < cumulative) {
        status = statuses[s];
        break;
      }
    }
    const statusTextMap: Record<WarningStatus, string> = {
      pending: '待处理',
      processing: '处理中',
      approved: '已审批',
      resolved: '已解决',
      rejected: '已驳回',
      escalating: '升级中',
    };

    let approvalStage: 0 | 1 | 2 | 3 | 4 = 0;
    let statusText = statusTextMap[status];

    if (level === 2) {
      if (status === 'pending') {
        approvalStage = 1;
        status = 'processing';
        statusText = '待辅导员确认';
      } else if (status === 'processing') {
        approvalStage = randomInt(1, 2, rand) as 1 | 2;
        const stageTexts: Record<number, string> = {
          1: '待辅导员确认',
          2: '待联络员复核',
          3: '待中心批准',
        };
        statusText = stageTexts[approvalStage] || '处理中';
      } else if (status === 'approved') {
        approvalStage = 4;
        statusText = '审批通过';
      } else if (status === 'resolved') {
        approvalStage = 4;
      } else if (status === 'rejected') {
        approvalStage = randomInt(1, 3, rand) as 1 | 2 | 3;
      }
    } else {
      approvalStage = 0;
    }

    const approvals = approvalStage > 0 ? generateApprovals(`WRN${String(i + 1).padStart(5, '0')}`, approvalStage, status, createdAt, rand) : [];
    const interventions = (status === 'processing' || status === 'approved' || status === 'resolved')
      ? generateInterventions(`WRN${String(i + 1).padStart(5, '0')}`, createdAt, rand) : [];

    const escalatedAt = level === 2
      ? formatDateStr(addDays(createdAt, randomInt(0, 1, rand)))
      : undefined;

    const emotionIndex = level === 2 ? randomInt(30, 55, rand) : randomInt(45, 68, rand);
    const depressionScore = level === 2 ? randomInt(15, 28, rand) : randomInt(8, 18, rand);

    warnings.push({
      id: `WRN${String(i + 1).padStart(5, '0')}`,
      studentId: student.id,
      studentName: student.name,
      schoolId: school.id,
      schoolName: school.name,
      college: student.college,
      major: student.major,
      grade: student.grade,
      level,
      riskLevel: student.riskLevel,
      triggerType,
      triggerReason,
      emotionIndex,
      depressionScore,
      createdAt: formatDateStr(createdAt),
      updatedAt: formatDateStr(updatedAt),
      escalatedAt,
      status,
      statusText,
      approvalStage,
      approvals,
      interventions,
    });
  }

  return warnings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function generateApprovals(
  warningId: string,
  stage: number,
  status: WarningStatus,
  warningCreatedAt: Date,
  rand: () => number
): ApprovalRecord[] {
  const approvals: ApprovalRecord[] = [];
  const stagesToGenerate = status === 'rejected' ? Math.min(stage, randomInt(1, 2, rand)) : stage;

  for (let s = 1; s <= stagesToGenerate; s++) {
    const stg = s as 1 | 2 | 3;
    const approvalStatus: ApprovalStatus =
      (status === 'rejected' && s === stagesToGenerate)
        ? 'rejected'
        : (s === stagesToGenerate && (status === 'pending' || status === 'processing'))
          ? 'pending'
          : 'approved';

    const approverBase = ['张主任', '李老师', '王主任', '赵教授', '陈医生', '刘老师', '杨主任'];
    approvals.push({
      id: `${warningId}-AP${s}`,
      warningId,
      stage: stg,
      stageName: STAGE_NAMES[s],
      approverId: `USR${String(randomInt(100, 999, rand))}`,
      approverName: pickRandom(approverBase, rand),
      approverRole: APPROVER_ROLES[s - 1] || '审批人',
      status: approvalStatus,
      comment: approvalStatus === 'approved'
        ? pickRandom(['情况属实，同意处理方案。', '已核实，按流程办理。', '建议加强后续跟踪。'], rand)
        : approvalStatus === 'rejected'
          ? pickRandom(['需补充更多评估材料。', '暂不满足升级条件，请继续观察。', '建议先进行干预再提审。'], rand)
          : undefined,
      createdAt: formatDateStr(addDays(warningCreatedAt, s * randomInt(0, 2, rand))),
    });
  }

  return approvals;
}

function generateInterventions(
  warningId: string,
  warningCreatedAt: Date,
  rand: () => number
): InterventionRecord[] {
  const count = randomInt(1, 4, rand);
  const interventions: InterventionRecord[] = [];
  const types: InterventionType[] = ['counsel', 'referral', 'contact_family', 'follow_up', 'other'];
  const operators = ['李心理咨询师', '王老师', '张医生', '赵辅导员', '陈主任', '刘医生'];
  const descriptionsByType: Record<InterventionType, string[]> = {
    counsel: [
      '进行面对面个体心理咨询1次，时长50分钟，建立信任关系。',
      '采用CBT认知行为疗法，针对负性思维进行梳理。',
      '进行了2次沙盘游戏治疗，学生情绪有所缓解。',
    ],
    referral: [
      '已转介至市精神卫生中心进行专业评估。',
      '联系校医院进行进一步医学检查。',
      '建议至三甲医院临床心理科就诊，已协助预约。',
    ],
    contact_family: [
      '已电话联系家长，告知学生近期情况，建议家长多关注。',
      '与家长进行了视频沟通，制定家校共育方案。',
      '家长已到校配合处理，签署知情同意书。',
    ],
    follow_up: [
      '随访学生状态，情绪较前稳定，学业恢复正常。',
      '每周进行一次电话随访，持续跟踪中。',
      '二周后复诊，评估干预效果。',
    ],
    other: [
      '与宿舍同学沟通，请求日常关注与陪伴。',
      '协调教务处调整学业压力，申请缓考。',
      '安排学生加入团体辅导小组。',
    ],
  };

  for (let i = 0; i < count; i++) {
    const type = pickRandom(types, rand);
    const operator = pickRandom(operators, rand);
    const date = addDays(warningCreatedAt, i * randomInt(1, 4, rand) + 1);

    interventions.push({
      id: `${warningId}-IV${i + 1}`,
      warningId,
      type,
      typeName: INTERVENTION_TYPE_NAMES[type],
      operatorId: `USR${String(randomInt(100, 999, rand))}`,
      operatorName: operator,
      description: pickRandom(descriptionsByType[type], rand),
      createdAt: formatDateStr(date),
      nextFollowUpAt: type === 'follow_up' ? formatDateStr(addDays(date, randomInt(3, 14, rand))) : undefined,
    });
  }

  return interventions;
}

export function generateCollegeEmotionTrends(
  school: School,
  seed: number = 42
): CollegeEmotionTrend[] {
  const rand = seededRandom(seed + school.name.length);
  const collegeCount = randomInt(4, 8, rand);
  const selectedColleges: string[] = [];
  const poolCopy = [...COLLEGES_COMMON];
  for (let i = 0; i < collegeCount && poolCopy.length > 0; i++) {
    const idx = Math.floor(rand() * poolCopy.length);
    selectedColleges.push(poolCopy.splice(idx, 1)[0]);
  }

  const sources: EmotionSource[] = ['social', 'app_usage', 'counsel', 'assessment'];
  const days = 30;

  return selectedColleges.map((college) => {
    let baseValue = randomInt(60, 80, rand);
    const data: EmotionPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = addDays(new Date(), -i);
      const delta = randomInt(-5, 5, rand);
      baseValue = Math.max(40, Math.min(92, baseValue + delta));
      data.push({
        date: formatDateISO(date),
        value: baseValue,
        source: pickRandom(sources, rand),
      });
    }
    return { collegeName: college, data };
  });
}

export function generateCrisisTimeline(
  seed: number = 42
): CrisisEvent[] {
  const rand = seededRandom(seed);
  const count = randomInt(12, 24, rand);
  const events: CrisisEvent[] = [];
  const typeNames: Record<CrisisEventType, string> = {
    warning: '触发预警',
    approve: '审批通过',
    intervene: '开始干预',
    resolve: '危机解除',
    followup: '随访跟踪',
  };
  const types: CrisisEventType[] = ['warning', 'approve', 'intervene', 'resolve', 'followup'];
  const titleTemplates: Record<CrisisEventType, string[]> = {
    warning: ['系统检测到异常，触发二级预警', '辅导员上报，触发一级预警', 'AI综合分析触发一级预警'],
    approve: ['学院初审通过', '中心复核通过', '学校审批通过'],
    intervene: ['启动心理危机干预', '开展个体心理辅导', '联系家属共同干预'],
    resolve: ['学生状态恢复正常', '干预效果评估达标', '经综合评估解除预警'],
    followup: ['首周随访完成', '月度跟踪随访', '学期末综合回访'],
  };
  const descTemplates = [
    '学生情绪指数回升至正常范围，睡眠质量改善。',
    '学生积极参与校园活动，学业情况稳定。',
    '家庭沟通顺畅，支持系统健全。',
    '心理咨询持续进行中，疗效稳定。',
  ];
  const operators = ['系统自动', '张辅导员', '李心理咨询师', '王主任', '赵医生'];

  for (let i = 0; i < count; i++) {
    const type = pickRandom(types, rand);
    const time = addDays(new Date(), -(count - i) * randomInt(1, 5, rand));
    events.push({
      id: `EVT${String(i + 1).padStart(4, '0')}`,
      time: formatDateStr(time),
      type,
      typeName: typeNames[type],
      title: pickRandom(titleTemplates[type], rand),
      description: pickRandom(descTemplates, rand),
      operator: pickRandom(operators, rand),
    });
  }

  return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

export function generateWeeklyReports(
  schools: School[],
  scope: ReportScope = 'national',
  scopeName: string = '全国',
  seed: number = 42
): WeeklyReport[] {
  const rand = seededRandom(seed);
  const reports: WeeklyReport[] = [];
  const today = new Date();
  const startMonday = getPreviousMonday(today);

  for (let w = 11; w >= 0; w--) {
    const weekStart = addDays(startMonday, -w * 7);
    const weekEnd = addDays(weekStart, 6);

    const safe = randomInt(8200, 9500, rand);
    const low = randomInt(500, 1200, rand);
    const medium = randomInt(150, 400, rand);
    const high = randomInt(30, 100, rand);

    const topRiskSchools: { name: string; warningCount: number }[] | undefined = scope !== 'school'
      ? [...schools]
          .sort(() => rand() - 0.5)
          .slice(0, 5)
          .map((s) => ({
            name: s.name,
            warningCount: randomInt(3, 15, rand),
          }))
      : undefined;

    const riskTrend = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(weekStart, d);
      riskTrend.push({
        date: formatDateISO(date),
        safe: randomInt(1100, 1400, rand),
        low: randomInt(60, 180, rand),
        medium: randomInt(20, 60, rand),
        high: randomInt(4, 14, rand),
      });
    }

    const dims = ['抑郁', '焦虑', '压力', '睡眠', '社交'];
    const dimensionDistribution = dims.map((d) => ({
      dimension: d,
      normal: randomInt(800, 1200, rand),
      mild: randomInt(80, 180, rand),
      moderate: randomInt(20, 60, rand),
      severe: randomInt(2, 15, rand),
    }));

    const totalWarnings = randomInt(80, 220, rand);
    const resolvedWarnings = Math.round(totalWarnings * randomFloat(0.72, 0.95, 2, rand));

    const recommendations = [
      '建议重点关注毕业年级学生就业压力，开展专场减压活动。',
      '加强重点高校夜间值班巡查，完善危机快速响应机制。',
      '组织心理健康教育宣传月活动，提升学生心理素养。',
      '开展辅导员心理干预技能专项培训，提升基层工作能力。',
      '加强家校沟通，完善家长告知与协同干预流程。',
    ].slice(0, randomInt(2, 4, rand));

    reports.push({
      id: `RPT-${formatDateISO(weekStart)}`,
      weekStart: formatDateISO(weekStart),
      weekEnd: formatDateISO(weekEnd),
      scope,
      scopeName,
      riskDistribution: { safe, low, medium, high },
      avgResponseHours: randomFloat(3.5, 6.5, 1, rand),
      avgResponseCompared: randomFloat(-0.12, 0.08, 4, rand),
      retestImprovementRate: randomFloat(0.58, 0.78, 4, rand),
      retestImprovementCompared: randomFloat(-0.05, 0.1, 4, rand),
      totalWarnings,
      warningsCompared: randomFloat(-0.15, 0.12, 4, rand),
      resolvedWarnings,
      recommendations,
      summary: `本周${scopeName}心理健康状况总体平稳。累计产生预警${totalWarnings}起，已解决${resolvedWarnings}起，解决率${((resolvedWarnings / totalWarnings) * 100).toFixed(1)}%。平均响应时间${randomFloat(3.5, 6.5, 1, rand)}小时。高风险学生数量${w > 6 ? '略有上升' : '呈下降趋势'}，建议继续加强重点人群关注。`,
      topRiskSchools,
      charts: { riskTrend, dimensionDistribution },
    });
  }

  return reports.sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
}

function getPreviousMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function generateAllMockData(seed: number = 42) {
  const provinces = generateProvinces(seed);
  const schools = generateSchools(seed);
  const kpi = generateKPIData(seed + 1);
  const students = generateStudents(schools, 220, seed + 2);
  const warnings = generateWarnings(schools, students, 65, seed + 3);
  const reports = generateWeeklyReports(schools, 'national', '全国', seed + 4);

  students.forEach((s) => {
    s.warningHistory = warnings
      .filter((w) => w.studentId === s.id)
      .map((w) => ({ ...w, approvals: [], interventions: [] }));
  });

  const schoolCollegeTrends: Record<string, CollegeEmotionTrend[]> = {};
  schools.forEach((school, idx) => {
    schoolCollegeTrends[school.id] = generateCollegeEmotionTrends(school, seed + 100 + idx);
  });

  const schoolCrisisTimeline: Record<string, CrisisEvent[]> = {};
  schools.forEach((school, idx) => {
    schoolCrisisTimeline[school.id] = generateCrisisTimeline(seed + 200 + idx);
  });

  return {
    provinces,
    schools,
    kpi,
    students,
    warnings,
    reports,
    schoolCollegeTrends,
    schoolCrisisTimeline,
  };
}

export default generateAllMockData;
