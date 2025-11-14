
export const mockProjects = [
  {
    id: 'proj001',
    name: '朝阳区公交站台改造项目',
    location: '北京市朝阳区建国门外大街',
    coordinates: [116.4074, 39.9042] as [number, number],
    status: '在建中',
    completeness: 85,
    manager: '张建国',
    totalArchives: 156,
    phases: [
      { name: '立项阶段', completeness: 100, total: 12, completed: 12 },
      { name: '设计阶段', completeness: 95, total: 24, completed: 23 },
      { name: '施工阶段', completeness: 78, total: 45, completed: 35 },
      { name: '验收阶段', completeness: 0, total: 18, completed: 0 }
    ]
  },
  {
    id: 'proj002',
    name: '海淀区智能公交站台建设',
    location: '北京市海淀区中关村大街',
    coordinates: [116.3074, 39.9842] as [number, number],
    status: '已竣工',
    completeness: 98,
    manager: '李明华',
    totalArchives: 234,
    phases: [
      { name: '立项阶段', completeness: 100, total: 15, completed: 15 },
      { name: '设计阶段', completeness: 100, total: 28, completed: 28 },
      { name: '施工阶段', completeness: 100, total: 52, completed: 52 },
      { name: '验收阶段', completeness: 95, total: 22, completed: 21 }
    ]
  },
  {
    id: 'proj003',
    name: '西城区公交站台维护项目',
    location: '北京市西城区西单北大街',
    coordinates: [116.3774, 39.9142] as [number, number],
    status: '在建中',
    completeness: 65,
    manager: '王小红',
    totalArchives: 89,
    phases: [
      { name: '立项阶段', completeness: 100, total: 8, completed: 8 },
      { name: '设计阶段', completeness: 85, total: 16, completed: 14 },
      { name: '施工阶段', completeness: 45, total: 32, completed: 14 },
      { name: '验收阶段', completeness: 0, total: 12, completed: 0 }
    ]
  },
  {
    id: 'proj004',
    name: '东城区公交站台升级改造',
    location: '北京市东城区王府井大街',
    coordinates: [116.4174, 39.9242] as [number, number],
    status: '已竣工',
    completeness: 92,
    manager: '陈志强',
    totalArchives: 178,
    phases: [
      { name: '立项阶段', completeness: 100, total: 10, completed: 10 },
      { name: '设计阶段', completeness: 100, total: 22, completed: 22 },
      { name: '施工阶段', completeness: 95, total: 38, completed: 36 },
      { name: '验收阶段', completeness: 85, total: 20, completed: 17 }
    ]
  },
  {
    id: 'proj005',
    name: '丰台区公交站台新建项目',
    location: '北京市丰台区南三环西路',
    coordinates: [116.2874, 39.8542] as [number, number],
    status: '已暂停',
    completeness: 45,
    manager: '刘德华',
    totalArchives: 67,
    phases: [
      { name: '立项阶段', completeness: 100, total: 9, completed: 9 },
      { name: '设计阶段', completeness: 70, total: 18, completed: 13 },
      { name: '施工阶段', completeness: 20, total: 25, completed: 5 },
      { name: '验收阶段', completeness: 0, total: 15, completed: 0 }
    ]
  },
  {
    id: 'proj006',
    name: '石景山区公交站台智能化改造',
    location: '北京市石景山区石景山路',
    coordinates: [116.2274, 39.9142] as [number, number],
    status: '在建中',
    completeness: 72,
    manager: '赵敏',
    totalArchives: 123,
    phases: [
      { name: '立项阶段', completeness: 100, total: 11, completed: 11 },
      { name: '设计阶段', completeness: 90, total: 20, completed: 18 },
      { name: '施工阶段', completeness: 60, total: 35, completed: 21 },
      { name: '验收阶段', completeness: 0, total: 16, completed: 0 }
    ]
  },
  {
    id: 'proj007',
    name: '通州区公交站台扩建工程',
    location: '北京市通州区通胡大街',
    coordinates: [116.6574, 39.9042] as [number, number],
    status: '在建中',
    completeness: 88,
    manager: '孙丽娟',
    totalArchives: 145,
    phases: [
      { name: '立项阶段', completeness: 100, total: 13, completed: 13 },
      { name: '设计阶段', completeness: 100, total: 25, completed: 25 },
      { name: '施工阶段', completeness: 82, total: 42, completed: 34 },
      { name: '验收阶段', completeness: 0, total: 19, completed: 0 }
    ]
  },
  {
    id: 'proj008',
    name: '昌平区公交站台节能改造',
    location: '北京市昌平区回龙观东大街',
    coordinates: [116.3274, 40.0742] as [number, number],
    status: '已竣工',
    completeness: 96,
    manager: '周建军',
    totalArchives: 189,
    phases: [
      { name: '立项阶段', completeness: 100, total: 14, completed: 14 },
      { name: '设计阶段', completeness: 100, total: 26, completed: 26 },
      { name: '施工阶段', completeness: 98, total: 48, completed: 47 },
      { name: '验收阶段', completeness: 90, total: 21, completed: 19 }
    ]
  }
];

export const mockArchiveData = {
  archiveTypes: [
    { name: '合同文件', count: 245, color: '#3b82f6' },
    { name: '设计图纸', count: 189, color: '#10b981' },
    { name: '施工记录', count: 156, color: '#f59e0b' },
    { name: '验收报告', count: 98, color: '#ef4444' },
    { name: '批准文件', count: 134, color: '#8b5cf6' },
    { name: '其他资料', count: 67, color: '#6b7280' }
  ],
  phaseArchives: [
    { phase: '立项阶段', count: 92 },
    { phase: '设计阶段', count: 159 },
    { phase: '施工阶段', count: 287 },
    { phase: '验收阶段', count: 123 },
    { phase: '维护阶段', count: 45 }
  ],
  monthlyTrend: [
    { month: '8月', count: 45 },
    { month: '9月', count: 52 },
    { month: '10月', count: 38 },
    { month: '11月', count: 67 },
    { month: '12月', count: 59 },
    { month: '1月', count: 73 }
  ]
};
