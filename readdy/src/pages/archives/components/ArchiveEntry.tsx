
import { useState } from 'react';

export default function ArchiveEntry() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    fileDate: '',
    retentionPeriod: '30年',
    keywords: '',
    description: ''
  });
  const [aiSuggestions, setAiSuggestions] = useState({
    summary: '',
    tags: [],
    isProcessing: false
  });
  
  // 新增：手动选择的标签状态
  const [manualTags, setManualTags] = useState<string[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const projects = [
    { code: 'PRJ001', name: '中山路公交站台建设项目' },
    { code: 'PRJ002', name: '解放路公交站台建设项目' },
    { code: 'PRJ003', name: '人民路公交站台建设项目' }
  ];

  const stages = ['立项', '设计', '施工', '验收'];

  // 系统预设标签列表
  const systemTags = [
    '施工图纸', '设计方案', '技术文档', '验收报告', '质量检测',
    '安全资料', '材料清单', '工程变更', '竣工资料', '监理记录',
    '钢结构', '混凝土', '建筑工程', '市政工程', '公交设施',
    '环保资料', '财务文档', '合同协议', '招投标', '审批文件'
  ];

  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      status: 'uploading'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // 模拟AI处理
    setAiSuggestions(prev => ({ ...prev, isProcessing: true }));
    
    setTimeout(() => {
      setUploadedFiles(prev => 
        prev.map(f => 
          newFiles.find(nf => nf.id === f.id) 
            ? { ...f, status: 'completed' }
            : f
        )
      );
      
      // 模拟AI生成的建议
      setAiSuggestions({
        isProcessing: false,
        summary: '本文件为公交站台建设项目的施工图纸，包含站台结构设计、材料规格说明和施工工艺要求。图纸详细描述了站台的尺寸规格、钢结构连接方式以及防腐处理工艺。',
        tags: ['施工图纸', '钢结构', '公交站台', '建设工程', '技术文档']
      });
    }, 2000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const removeFile = (fileId: number) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const removeAiTag = (tagIndex: number) => {
    setAiSuggestions(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== tagIndex)
    }));
  };

  // 新增：手动标签管理函数
  const handleAddManualTag = (tag: string) => {
    if (tag && !manualTags.includes(tag) && !aiSuggestions.tags.includes(tag)) {
      setManualTags([...manualTags, tag]);
    }
    setNewTagInput('');
  };

  const handleRemoveManualTag = (tagToRemove: string) => {
    setManualTags(manualTags.filter(tag => tag !== tagToRemove));
  };

  const handleAddCustomTag = () => {
    if (newTagInput.trim() && !manualTags.includes(newTagInput.trim()) && !aiSuggestions.tags.includes(newTagInput.trim())) {
      setManualTags([...manualTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const canProceedToStep2 = selectedProject && selectedStage && uploadedFiles.length > 0;
  const canProceedToStep3 = formData.title && formData.fileDate;

  const handleSubmit = () => {
    // 合并所有标签
    const allTags = [...manualTags, ...aiSuggestions.tags];
    const finalKeywords = allTags.join(', ');
    
    // 生成档号
    const archiveNumber = `${selectedProject}-${selectedStage}-${Date.now().toString().slice(-6)}`;
    alert(`档案入库成功！\n档号：${archiveNumber}\n标签：${finalKeywords}`);
    
    // 重置表单
    setCurrentStep(1);
    setSelectedProject('');
    setSelectedStage('');
    setUploadedFiles([]);
    setFormData({
      title: '',
      fileDate: '',
      retentionPeriod: '30年',
      keywords: '',
      description: ''
    });
    setAiSuggestions({
      summary: '',
      tags: [],
      isProcessing: false
    });
    setManualTags([]);
    setShowTagSelector(false);
    setNewTagInput('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 步骤指示器 */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= step 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              <div className="ml-3 text-sm">
                {step === 1 && '项目关联与文件上传'}
                {step === 2 && '元数据录入'}
                {step === 3 && '确认入库'}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 ml-8 ${
                  currentStep > step ? 'bg-purple-600' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: 项目关联与文件上传 */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：项目关联 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <i className="ri-link mr-2 text-purple-600"></i>
              项目关联（必填）
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择项目 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">请选择项目</option>
                  {projects.map((project) => (
                    <option key={project.code} value={project.code}>
                      {project.code} - {project.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  建设阶段 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={!selectedProject}
                >
                  <option value="">请选择建设阶段</option>
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 右侧：文件上传 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <i className="ri-upload-cloud-line mr-2 text-purple-600"></i>
              文件上传
            </h3>
            
            {/* 拖拽上传区域 */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <i className="ri-cloud-line text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600 mb-2">拖拽文件到此处或点击上传</p>
              <p className="text-sm text-gray-500">支持 PDF、Word、Excel、图片等格式</p>
              <input
                id="fileInput"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
            </div>

            {/* 已上传文件列表 */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">已上传文件：</h4>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i className="ri-file-line text-gray-500"></i>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.status === 'uploading' && (
                        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {file.status === 'completed' && (
                        <i className="ri-check-line text-green-600"></i>
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: 元数据录入 */}
      {currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：表单录入 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <i className="ri-edit-line mr-2 text-purple-600"></i>
              档案元数据录入
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  档案题名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="请输入档案题名"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文件日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.fileDate}
                  onChange={(e) => setFormData({...formData, fileDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">保管期限</label>
                <select
                  value={formData.retentionPeriod}
                  onChange={(e) => setFormData({...formData, retentionPeriod: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="10年">10年</option>
                  <option value="30年">30年</option>
                  <option value="永久">永久</option>
                </select>
              </div>
              
              {/* 新增：手动标签选择区域 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择标签
                </label>
                
                {/* 已选择的手动标签显示 */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {manualTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveManualTag(tag)}
                          className="ml-1.5 text-blue-600 hover:text-blue-800"
                        >
                          <i className="ri-close-line text-xs"></i>
                        </button>
                      </span>
                    ))}
                    {manualTags.length === 0 && (
                      <span className="text-gray-400 italic text-sm">暂未选择标签</span>
                    )}
                  </div>
                </div>

                {/* 添加标签按钮 */}
                <button
                  onClick={() => setShowTagSelector(!showTagSelector)}
                  className="flex items-center px-3 py-2 text-sm border border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <i className="ri-add-line mr-1.5"></i>
                  添加标签
                </button>

                {/* 标签选择器 */}
                {showTagSelector && (
                  <div className="mt-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {/* 自定义标签输入 */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        自定义标签
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          placeholder="输入新标签名称"
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddCustomTag();
                            }
                          }}
                        />
                        <button
                          onClick={handleAddCustomTag}
                          disabled={!newTagInput.trim()}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          添加
                        </button>
                      </div>
                    </div>

                    {/* 系统标签列表 */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        系统标签
                      </label>
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                        {systemTags
                          .filter(tag => !manualTags.includes(tag) && !aiSuggestions.tags.includes(tag))
                          .map((tag, index) => (
                          <button
                            key={index}
                            onClick={() => handleAddManualTag(tag)}
                            className="px-2 py-1 text-xs bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 hover:border-blue-300 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 关闭按钮 */}
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => setShowTagSelector(false)}
                        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        完成
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">关键词</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="多个关键词用逗号分隔"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">档案描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  placeholder="请输入档案描述"
                />
              </div>
            </div>
          </div>

          {/* 右侧：AI辅助 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <i className="ri-robot-line mr-2 text-purple-600"></i>
              AI 智能辅助
            </h3>
            
            {aiSuggestions.isProcessing ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">AI 正在分析文件内容...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* AI生成的摘要 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI 生成摘要
                  </label>
                  <textarea
                    value={aiSuggestions.summary}
                    onChange={(e) => setAiSuggestions({...aiSuggestions, summary: e.target.value})}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    placeholder="AI 将自动生成文件摘要"
                  />
                  <p className="text-xs text-gray-500 mt-1">您可以编辑AI生成的摘要</p>
                </div>
                
                {/* AI推荐标签 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI 推荐标签
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                      >
                        {tag}
                        <button
                          onClick={() => removeAiTag(index)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <i className="ri-close-line text-xs"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">点击标签可以删除，您也可以手动添加关键词</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: 确认入库 */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-check-line text-3xl text-green-600"></i>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-4">确认档案信息</h3>
          
          <div className="max-w-2xl mx-auto text-left bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">项目：</span>
                <span className="text-gray-900">{selectedProject}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">阶段：</span>
                <span className="text-gray-900">{selectedStage}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">题名：</span>
                <span className="text-gray-900">{formData.title}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">文件日期：</span>
                <span className="text-gray-900">{formData.fileDate}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">保管期限：</span>
                <span className="text-gray-900">{formData.retentionPeriod}</span>
              </div>
            </div>
            
            {/* 显示所有标签 */}
            {(manualTags.length > 0 || aiSuggestions.tags.length > 0) && (
              <div className="mt-4">
                <span className="font-medium text-gray-700">标签：</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {manualTags.map((tag, index) => (
                    <span
                      key={`manual-${index}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                  {aiSuggestions.tags.map((tag, index) => (
                    <span
                      key={`ai-${index}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <span className="font-medium text-gray-700">上传文件：</span>
              <div className="mt-2 space-y-1">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="text-sm text-gray-600">
                    • {file.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">
            档案将被分配唯一档号并正式入库，请确认信息无误后点击确认入库。
          </p>
        </div>
      )}

      {/* 底部操作按钮 */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          上一步
        </button>
        
        <div className="flex space-x-4">
          <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
            保存草稿
          </button>
          
          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 1 && !canProceedToStep2) ||
                (currentStep === 2 && !canProceedToStep3)
              }
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              下一步
              <i className="ri-arrow-right-line ml-2"></i>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              <i className="ri-check-line mr-2"></i>
              确认入库
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
