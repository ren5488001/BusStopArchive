
import { useState } from 'react';

interface ArchiveSearchProps {
  archives: any[];
  onViewDetail: (archive: any) => void;
}

export default function ArchiveSearch({ archives, onViewDetail }: ArchiveSearchProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [filters, setFilters] = useState({
    projectCode: '',
    stage: '',
    dateRange: { start: '', end: '' }
  });

  const filteredArchives = archives.filter(archive => {
    if (showDeleted && !archive.isDeleted) return false;
    if (!showDeleted && archive.isDeleted) return false;
    
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      return archive.title.toLowerCase().includes(keyword) ||
             archive.archiveNumber.toLowerCase().includes(keyword) ||
             archive.content?.toLowerCase().includes(keyword);
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已归档': return 'bg-green-100 text-green-800';
      case '处理中': return 'bg-blue-100 text-blue-800';
      case '待审核': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 搜索和筛选区域 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {/* 全文搜索框 */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-gray-400 text-lg"></i>
            </div>
            <input
              type="text"
              placeholder="输入关键词搜索档案内容、题名或档号..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
          </div>
        </div>

        {/* 高级筛选和回收站切换 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className="flex items-center text-sm text-gray-600 hover:text-purple-600 transition-colors"
          >
            <i className={`ri-filter-line mr-2 ${showAdvancedFilter ? 'text-purple-600' : ''}`}></i>
            高级筛选
            <i className={`ri-arrow-${showAdvancedFilter ? 'up' : 'down'}-s-line ml-1`}></i>
          </button>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              显示已删除档案
            </label>
          </div>
        </div>

        {/* 高级筛选面板 */}
        {showAdvancedFilter && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目编号</label>
                <select
                  value={filters.projectCode}
                  onChange={(e) => setFilters({...filters, projectCode: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">全部项目</option>
                  <option value="PRJ001">PRJ001 - 中山路公交站台</option>
                  <option value="PRJ002">PRJ002 - 解放路公交站台</option>
                  <option value="PRJ003">PRJ003 - 人民路公交站台</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">建设阶段</label>
                <select
                  value={filters.stage}
                  onChange={(e) => setFilters({...filters, stage: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">全部阶段</option>
                  <option value="立项">立项</option>
                  <option value="设计">设计</option>
                  <option value="施工">施工</option>
                  <option value="验收">验收</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">文件日期范围</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters({...filters, dateRange: {...filters.dateRange, start: e.target.value}})}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                  />
                  <span className="text-gray-500 self-center">至</span>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters({...filters, dateRange: {...filters.dateRange, end: e.target.value}})}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 搜索结果统计 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          共找到 <span className="font-medium text-purple-600">{filteredArchives.length}</span> 条档案记录
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <i className="ri-download-line mr-1"></i>
            批量导出
          </button>
        </div>
      </div>

      {/* 档案列表 */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  档号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  档案题名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  所属项目
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  建设阶段
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  文件版本
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  上传日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredArchives.map((archive) => (
                <tr key={archive.id} className={`hover:bg-gray-50 ${archive.isDeleted ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {archive.archiveNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <button
                      onClick={() => onViewDetail(archive)}
                      className="text-purple-600 hover:text-purple-800 hover:underline max-w-xs truncate block"
                    >
                      {archive.title}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {archive.projectName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {archive.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {archive.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {archive.uploadDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {!archive.isDeleted ? (
                        <>
                          <button
                            onClick={() => onViewDetail(archive)}
                            className="text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            详情
                          </button>
                          <button className="text-blue-600 hover:text-blue-800 transition-colors">
                            下载
                          </button>
                          <button className="text-green-600 hover:text-green-800 transition-colors">
                            编辑
                          </button>
                          <button className="text-red-600 hover:text-red-800 transition-colors">
                            删除
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="text-green-600 hover:text-green-800 transition-colors">
                            恢复
                          </button>
                          <button className="text-red-600 hover:text-red-800 transition-colors">
                            彻底删除
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          显示第 1-10 条，共 {filteredArchives.length} 条记录
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            上一页
          </button>
          <button className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            1
          </button>
          <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            2
          </button>
          <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
