
import { useState, useEffect } from 'react';
import KPICards from './components/KPICards';
import GISMap from './components/GISMap';
import ArchiveOverview from './components/ArchiveOverview';
import DetailCharts from './components/DetailCharts';
import { mockProjects, mockArchiveData } from '../../mocks/dashboardData';

export default function Dashboard() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [kpiData, setKpiData] = useState({
    totalProjects: 0,
    totalArchives: 0,
    ongoingProjects: 0,
    avgCompleteness: 0
  });

  useEffect(() => {
    // 计算KPI数据
    const totalProjects = mockProjects.length;
    const totalArchives = mockProjects.reduce((sum, project) => sum + project.totalArchives, 0);
    const ongoingProjects = mockProjects.filter(p => p.status === '在建中').length;
    const avgCompleteness = Math.round(
      mockProjects.reduce((sum, project) => sum + project.completeness, 0) / totalProjects
    );

    setKpiData({
      totalProjects,
      totalArchives,
      ongoingProjects,
      avgCompleteness
    });
  }, []);

  const handleProjectSelect = (project: typeof mockProjects[0]) => {
    setSelectedProject(project);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="ri-dashboard-3-line text-white text-lg"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">智能档案管理驾驶舱</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                最后更新: {new Date().toLocaleString('zh-CN')}
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <i className="ri-refresh-line mr-2"></i>
                刷新数据
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="flex-1 p-6 flex flex-col space-y-6 min-h-0">
        {/* 第一层：KPI卡片区域 */}
        <div className="flex-shrink-0">
          <KPICards data={kpiData} />
        </div>

        {/* 第二层：中央核心区域 */}
        <div className="flex-1 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* GIS地图 */}
            <div className="lg:col-span-2 min-h-0">
              <GISMap 
                projects={mockProjects}
                selectedProject={selectedProject}
                onProjectSelect={handleProjectSelect}
              />
            </div>

            {/* 档案完整度概览 */}
            <div className="lg:col-span-1 min-h-0">
              <ArchiveOverview project={selectedProject} />
            </div>
          </div>
        </div>

        {/* 第三层：底部详细统计图表 */}
        <div className="flex-shrink-0">
          <DetailCharts data={mockArchiveData} projects={mockProjects} />
        </div>
      </main>
    </div>
  );
}
