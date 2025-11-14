import { useState } from 'react';

interface StageTemplate {
  id: string;
  name: string;
  stageCount: number;
  creator: string;
  createDate: string;
  stages: Array<{
    id: string;
    name: string;
    order: number;
    requiredFiles: string[];
  }>;
}

interface StageTemplateManagerProps {
  templates: StageTemplate[];
}

export default function StageTemplateManager({ templates }: StageTemplateManagerProps) {
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<StageTemplate | null>(null);

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setShowTemplateForm(true);
  };

  const handleEditTemplate = (template: StageTemplate) => {
    setEditingTemplate(template);
    setShowTemplateForm(true);
  };

  const handleCloseForm = () => {
    setShowTemplateForm(false);
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleNewTemplate}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              <i className="ri-add-line mr-2"></i>
              新增模板
            </button>
          </div>
          <div className="text-sm text-gray-500">
            共 {templates.length} 个模板
          </div>
        </div>
      </div>

      {/* 模板列表 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  模板名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  阶段总数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <i className="ri-file-list-3-line text-blue-600"></i>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {template.stageCount} 个阶段
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.creator}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.createDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="text-green-600 hover:text-green-900 whitespace-nowrap"
                      >
                        <i className="ri-edit-line mr-1"></i>
                        编辑
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 whitespace-nowrap">
                        <i className="ri-file-copy-line mr-1"></i>
                        复制
                      </button>
                      <button className="text-red-600 hover:text-red-900 whitespace-nowrap">
                        <i className="ri-delete-bin-line mr-1"></i>
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 模板配置表单 */}
      {showTemplateForm && (
        <TemplateConfigForm
          template={editingTemplate}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

// 模板配置表单组件
function TemplateConfigForm({ template, onClose }: { template: StageTemplate | null; onClose: () => void }) {
  const [templateName, setTemplateName] = useState(template?.name || '');
  const [templateDesc, setTemplateDesc] = useState('');
  const [stages, setStages] = useState(template?.stages || [
    { id: '1', name: '立项阶段', order: 1, requiredFiles: [] }
  ]);

  const standardFiles = [
    '项目建议书', '可行性研究报告', '初步设计文件', '施工图设计文件',
    '招标文件', '投标文件', '合同文件', '施工组织设计',
    '监理规划', '质量检测报告', '竣工验收报告', '财务决算报告'
  ];

  const addStage = () => {
    const newStage = {
      id: Date.now().toString(),
      name: `新阶段${stages.length + 1}`,
      order: stages.length + 1,
      requiredFiles: []
    };
    setStages([...stages, newStage]);
  };

  const removeStage = (stageId: string) => {
    setStages(stages.filter(stage => stage.id !== stageId));
  };

  const updateStage = (stageId: string, field: string, value: any) => {
    setStages(stages.map(stage => 
      stage.id === stageId ? { ...stage, [field]: value } : stage
    ));
  };

  const moveStage = (stageId: string, direction: 'up' | 'down') => {
    const currentIndex = stages.findIndex(stage => stage.id === stageId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === stages.length - 1)
    ) return;

    const newStages = [...stages];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newStages[currentIndex], newStages[targetIndex]] = [newStages[targetIndex], newStages[currentIndex]];
    
    // 更新order
    newStages.forEach((stage, index) => {
      stage.order = index + 1;
    });
    
    setStages(newStages);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 表单头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {template ? '编辑模板' : '新增模板'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* 表单内容 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 基础信息 */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-gray-900 mb-4">基础信息</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">模板名称</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="请输入模板名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">模板描述</label>
                <textarea
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="请输入模板描述"
                />
              </div>
            </div>
          </div>

          {/* 阶段配置 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">阶段配置</h4>
              <button
                onClick={addStage}
                className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
              >
                <i className="ri-add-line mr-1"></i>
                添加阶段
              </button>
            </div>

            <div className="space-y-4">
              {stages.map((stage, index) => (
                <div key={stage.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        阶段 {stage.order}
                      </span>
                      <input
                        type="text"
                        value={stage.name}
                        onChange={(e) => updateStage(stage.id, 'name', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="阶段名称"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveStage(stage.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        <i className="ri-arrow-up-line"></i>
                      </button>
                      <button
                        onClick={() => moveStage(stage.id, 'down')}
                        disabled={index === stages.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        <i className="ri-arrow-down-line"></i>
                      </button>
                      <button
                        onClick={() => removeStage(stage.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">标准文件配置</label>
                      <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                        <div className="grid grid-cols-1 gap-2">
                          {standardFiles.map(file => (
                            <label key={file} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={stage.requiredFiles.includes(file)}
                                onChange={(e) => {
                                  const newFiles = e.target.checked
                                    ? [...stage.requiredFiles, file]
                                    : stage.requiredFiles.filter(f => f !== file);
                                  updateStage(stage.id, 'requiredFiles', newFiles);
                                }}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">{file}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        已选择文件: {stage.requiredFiles.length} 个
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 表单底部 */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
          >
            取消
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap">
            保存模板
          </button>
        </div>
      </div>
    </div>
  );
}