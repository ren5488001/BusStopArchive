import { useState } from 'react';

interface Project {
  id: string;
  code: string;
  name: string;
  template: string;
  status: string;
  completeness: number;
  manager: string;
  createDate: string;
  isDeleted?: boolean;
}

interface ProjectListProps {
  projects: Project[];
  onNewProject: () => void;
  onEditProject: (project: Project) => void;
}

export default function ProjectList({ projects, onNewProject, onEditProject }: ProjectListProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '在建中': return 'bg-blue-100 text-blue-800';
      case '已竣工': return 'bg-green-100 text-green-800';
      case '暂停': return 'bg-gray-100 text-gray-800';
      case '计划中': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletenessColor = (completeness: number) => {
    if (completeness >= 90) return 'bg-green-500';
    if (completeness >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredProjects = projects.filter(project => {
    if (!showDeleted && project.isDeleted) return false;
    if (showDeleted && !project.isDeleted) return false;
    
    if (searchKeyword && !project.code.includes(searchKeyword) && !project.name.includes(searchKeyword)) return false;
    if (statusFilter && project.status !== statusFilter) return false;
    if (managerFilter && project.manager !== managerFilter) return false;
    
    return true;
  });

  const uniqueManagers = [...new Set(projects.map(p => p.manager))];

  return (
    <div className="space-y-6">
      {/* 筛选查询区 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">关键词搜索</label>
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="项目编号或名称"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">项目状态</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">全部状态</option>
              <option value="在建中">在建中</option>
              <option value="已竣工">已竣工</option>
              <option value="暂停">暂停</option>
              <option value="计划中">计划中</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">项目负责人</label>
            <select
              value={managerFilter}
              onChange={(e) => setManagerFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">全部负责人</option>
              {uniqueManagers.map(manager => (
                <option key={manager} value={manager}>{manager}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">删除状态</label>
            <div className="flex items-center space-x-4 pt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">显示已删除</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onNewProject}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              <i className="ri-add-line mr-2"></i>
              新增项目
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
              <i className="ri-download-line mr-2"></i>
              批量导出
            </button>
          </div>
          <div className="text-sm text-gray-500">
            共 {filteredProjects.length} 个项目
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  项目编号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  项目名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  建设阶段模板
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  项目状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  档案完整度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  负责人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {project.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.template}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getCompletenessColor(project.completeness)}`}
                          style={{ width: `${project.completeness}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 cursor-pointer hover:text-green-600">
                        {project.completeness}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.manager}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.createDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {project.isDeleted ? (
                      <div className="flex items-center space-x-2">
                        <button className="text-green-600 hover:text-green-900 whitespace-nowrap">
                          <i className="ri-refresh-line mr-1"></i>
                          恢复
                        </button>
                        <button className="text-red-600 hover:text-red-900 whitespace-nowrap">
                          <i className="ri-delete-bin-line mr-1"></i>
                          彻底删除
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 whitespace-nowrap">
                          <i className="ri-eye-line mr-1"></i>
                          详情
                        </button>
                        <button
                          onClick={() => onEditProject(project)}
                          className="text-green-600 hover:text-green-900 whitespace-nowrap"
                        >
                          <i className="ri-edit-line mr-1"></i>
                          编辑
                        </button>
                        <button className="text-red-600 hover:text-red-900 whitespace-nowrap">
                          <i className="ri-delete-bin-line mr-1"></i>
                          删除
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}