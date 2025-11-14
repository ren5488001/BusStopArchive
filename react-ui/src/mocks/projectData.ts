export const mockProjects = [
  {
    id: '1',
    code: 'BUS-2024-001',
    name: '市中心公交站台建设项目',
    template: '标准公交站台项目模板',
    status: '在建中',
    completeness: 85,
    manager: '张三',
    createDate: '2024-01-15',
    startDate: '2024-01-20',
    endDate: '2024-06-30',
    latitude: 39.9042,
    longitude: 116.4074,
    description: '位于市中心核心区域的现代化公交站台建设项目',
    isDeleted: false
  },
  {
    id: '2',
    code: 'BUS-2024-002',
    name: '东区公交枢纽站建设',
    template: '大型枢纽站项目模板',
    status: '已竣工',
    completeness: 100,
    manager: '李四',
    createDate: '2023-12-01',
    startDate: '2023-12-15',
    endDate: '2024-03-15',
    latitude: 39.9142,
    longitude: 116.4174,
    description: '东区重要的公交枢纽站，集成多条线路',
    isDeleted: false
  },
  {
    id: '3',
    code: 'BUS-2024-003',
    name: '西郊公交站台改造',
    template: '站台改造项目模板',
    status: '暂停',
    completeness: 45,
    manager: '王五',
    createDate: '2024-02-01',
    startDate: '2024-02-15',
    endDate: '2024-05-30',
    latitude: 39.8942,
    longitude: 116.3974,
    description: '西郊老旧公交站台的现代化改造项目',
    isDeleted: false
  },
  {
    id: '4',
    code: 'BUS-2024-004',
    name: '南区智能公交站建设',
    template: '智能站台项目模板',
    status: '计划中',
    completeness: 20,
    manager: '赵六',
    createDate: '2024-03-01',
    startDate: '2024-04-01',
    endDate: '2024-08-31',
    latitude: 39.8842,
    longitude: 116.4274,
    description: '配备智能显示屏和实时信息系统的现代化公交站台',
    isDeleted: false
  },
  {
    id: '5',
    code: 'BUS-2023-015',
    name: '北区公交站台项目',
    template: '标准公交站台项目模板',
    status: '已竣工',
    completeness: 65,
    manager: '张三',
    createDate: '2023-10-15',
    startDate: '2023-11-01',
    endDate: '2024-01-31',
    latitude: 39.9242,
    longitude: 116.4374,
    description: '已删除的测试项目',
    isDeleted: true
  }
];

export const mockStageTemplates = [
  {
    id: '1',
    name: '标准公交站台项目模板',
    stageCount: 5,
    creator: '系统管理员',
    createDate: '2024-01-01',
    stages: [
      {
        id: 's1',
        name: '立项阶段',
        order: 1,
        requiredFiles: ['项目建议书', '可行性研究报告', '立项批复文件'],
        responsible: '张三'
      },
      {
        id: 's2',
        name: '设计阶段',
        order: 2,
        requiredFiles: ['初步设计文件', '施工图设计文件', '设计变更文件'],
        responsible: '李四'
      },
      {
        id: 's3',
        name: '施工阶段',
        order: 3,
        requiredFiles: ['施工组织设计', '施工合同', '质量检测报告', '安全检查记录'],
        responsible: '王五'
      },
      {
        id: 's4',
        name: '监理阶段',
        order: 4,
        requiredFiles: ['监理规划', '监理月报', '监理总结报告'],
        responsible: '赵六'
      },
      {
        id: 's5',
        name: '验收阶段',
        order: 5,
        requiredFiles: ['竣工验收报告', '财务决算报告', '工程移交清单'],
        responsible: '张三'
      }
    ]
  },
  {
    id: '2',
    name: '大型枢纽站项目模板',
    stageCount: 6,
    creator: '项目经理',
    createDate: '2024-01-10',
    stages: [
      {
        id: 's1',
        name: '前期准备',
        order: 1,
        requiredFiles: ['项目建议书', '可行性研究报告', '环评报告'],
        responsible: '张三'
      },
      {
        id: 's2',
        name: '规划设计',
        order: 2,
        requiredFiles: ['总体规划', '建筑设计', '结构设计', '设备设计'],
        responsible: '李四'
      },
      {
        id: 's3',
        name: '招标采购',
        order: 3,
        requiredFiles: ['招标文件', '投标文件', '中标通知书', '合同文件'],
        responsible: '王五'
      },
      {
        id: 's4',
        name: '施工建设',
        order: 4,
        requiredFiles: ['施工组织设计', '施工日志', '质量检测报告', '进度报告'],
        responsible: '赵六'
      },
      {
        id: 's5',
        name: '设备安装',
        order: 5,
        requiredFiles: ['设备清单', '安装方案', '调试报告', '验收报告'],
        responsible: '钱七'
      },
      {
        id: 's6',
        name: '竣工验收',
        order: 6,
        requiredFiles: ['竣工验收报告', '使用说明书', '保修承诺书', '移交清单'],
        responsible: '张三'
      }
    ]
  },
  {
    id: '3',
    name: '站台改造项目模板',
    stageCount: 4,
    creator: '技术主管',
    createDate: '2024-01-20',
    stages: [
      {
        id: 's1',
        name: '现状调研',
        order: 1,
        requiredFiles: ['现状调研报告', '改造需求分析', '技术方案'],
        responsible: '李四'
      },
      {
        id: 's2',
        name: '改造设计',
        order: 2,
        requiredFiles: ['改造设计方案', '施工图纸', '材料清单'],
        responsible: '王五'
      },
      {
        id: 's3',
        name: '施工改造',
        order: 3,
        requiredFiles: ['施工方案', '施工记录', '质量检查报告'],
        responsible: '赵六'
      },
      {
        id: 's4',
        name: '验收交付',
        order: 4,
        requiredFiles: ['改造验收报告', '使用培训记录', '维护手册'],
        responsible: '张三'
      }
    ]
  },
  {
    id: '4',
    name: '智能站台项目模板',
    stageCount: 7,
    creator: '技术总监',
    createDate: '2024-02-01',
    stages: [
      {
        id: 's1',
        name: '需求分析',
        order: 1,
        requiredFiles: ['需求规格书', '技术调研报告', '可行性分析'],
        responsible: '张三'
      },
      {
        id: 's2',
        name: '系统设计',
        order: 2,
        requiredFiles: ['系统架构设计', '接口设计文档', '数据库设计'],
        responsible: '李四'
      },
      {
        id: 's3',
        name: '硬件采购',
        order: 3,
        requiredFiles: ['设备技术规格', '采购合同', '设备验收报告'],
        responsible: '王五'
      },
      {
        id: 's4',
        name: '软件开发',
        order: 4,
        requiredFiles: ['开发计划', '代码文档', '测试报告'],
        responsible: '赵六'
      },
      {
        id: 's5',
        name: '系统集成',
        order: 5,
        requiredFiles: ['集成方案', '调试记录', '性能测试报告'],
        responsible: '钱七'
      },
      {
        id: 's6',
        name: '试运行',
        order: 6,
        requiredFiles: ['试运行方案', '运行日志', '问题处理记录'],
        responsible: '孙八'
      },
      {
        id: 's7',
        name: '正式交付',
        order: 7,
        requiredFiles: ['验收报告', '用户手册', '维护协议'],
        responsible: '张三'
      }
    ]
  }
];

