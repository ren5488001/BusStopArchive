import { useState } from 'react';

interface Project {
  id?: string;
  code: string;
  name: string;
  template: string;
  status: string;
  manager: string;
  startDate: string;
  endDate: string;
  latitude: number;
  longitude: number;
  description: string;
}

interface StageTemplate {
  id: string;
  name: string;
  stageCount: number;
  stages: Array<{
    id: string;
    name: string;
    order: number;
    requiredFiles: string[];
    responsible: string;
  }>;
}

interface ProjectFormProps {
  project: Project | null;
  templates: StageTemplate[];
  onClose: () => void;
}

export default function ProjectForm({ project, templates, onClose }: ProjectFormProps) {
  const [formData, setFormData] = useState<Project>({
    code: project?.code || '',
    name: project?.name || '',
    template: project?.template || '',
    status: project?.status || '计划中',
    manager: project?.manager || '',
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    latitude: project?.latitude || 0,
    longitude: project?.longitude || 0,
    description: project?.description || ''
  });

  const [selectedTemplate, setSelectedTemplate] = useState<StageTemplate | null>(
    project ? templates.find(t => t.name === project.template) || null : null
  );

  const handleInputChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
    handleInputChange('template', template?.name || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 这里处理表单提交逻辑
    if (!project) {
      // 新增项目时，系统自动生成项目编号
      const newProjectCode = `PRJ${Date.now().toString().slice(-8)}`;
      const newProjectData = { ...formData, code: newProjectCode };
      console.log('新增项目数据:', newProjectData);
    } else {
      console.log('更新项目数据:', formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 表单头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {project ? '编辑项目' : '新增项目'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 基础信息 */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <i className="ri-information-line mr-2 text-blue-600"></i>
              基础信息
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 项目编号 - 仅在编辑模式下显示 */}
              {project && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    项目编号
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    placeholder="系统自动生成"
                  />
                </div>
              )}
              
              <div className={project ? '' : 'md:col-span-2'}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  项目名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="请输入项目名称"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  项目负责人 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.manager}
                  onChange={(e) => handleInputChange('manager', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">请选择负责人</option>
                  <option value="张三">张三</option>
                  <option value="李四">李四</option>
                  <option value="王五">王五</option>
                  <option value="赵六">赵六</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  项目状态
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="计划中">计划中</option>
                  <option value="在建中">在建中</option>
                  <option value="已竣工">已竣工</option>
                  <option value="暂停">暂停</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  计划开始日期
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  计划结束日期
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* 新增模式下的提示信息 */}
            {!project && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <i className="ri-information-line text-blue-600 mr-2"></i>
                  <span className="text-sm text-blue-700">项目编号将在创建成功后由系统自动生成</span>
                </div>
              </div>
            )}
          </div>

          {/* GIS坐标信息 */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <i className="ri-map-pin-line mr-2 text-green-600"></i>
              GIS坐标信息
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  纬度
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="请输入纬度"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  经度
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="请输入经度"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
              >
                <i className="ri-map-line mr-2"></i>
                在地图上选择位置
              </button>
            </div>
          </div>

          {/* 阶段模板选择 */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <i className="ri-file-list-3-line mr-2 text-purple-600"></i>
              选择阶段模板
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                建设阶段模板 <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">请选择阶段模板</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.stageCount}个阶段)
                  </option>
                ))}
              </select>
            </div>

            {/* 模板预览 */}
            {selectedTemplate && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 mb-3">模板预览</h5>
                <div className="space-y-3">
                  {selectedTemplate.stages.map((stage, index) => (
                    <div key={stage.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{stage.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          应归档文件: {stage.requiredFiles.length} 个
                        </div>
                        {stage.requiredFiles.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {stage.requiredFiles.slice(0, 3).map(file => (
                                <span key={file} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                  {file}
                                </span>
                              ))}
                              {stage.requiredFiles.length > 3 && (
                                <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                  +{stage.requiredFiles.length - 3}个
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 项目描述 */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <i className="ri-file-text-line mr-2 text-orange-600"></i>
              项目描述
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="请输入项目描述..."
              />
            </div>
          </div>
        </form>

        {/* 表单底部 */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
          >
            取消
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap"
          >
            {project ? '更新项目' : '创建项目'}
          </button>
        </div>
      </div>
    </div>
  );
}