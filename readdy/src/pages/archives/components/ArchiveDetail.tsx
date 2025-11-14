
import { useState } from 'react';

interface ArchiveDetailProps {
  archive: any;
  onBack: () => void;
}

export default function ArchiveDetail({ archive, onBack }: ArchiveDetailProps) {
  const [activeTab, setActiveTab] = useState('metadata');
  const [isEditing, setIsEditing] = useState(false);
  const [showVersionUpload, setShowVersionUpload] = useState(false);
  const [editData, setEditData] = useState({
    title: archive.title,
    retentionPeriod: archive.retentionPeriod || '30年',
    description: archive.description || ''
  });

  const versionHistory = [
    {
      version: 'V3.0',
      uploadDate: '2024-01-15 14:30',
      uploader: '张三',
      remark: '更新施工图纸，修正尺寸标注',
      isCurrent: true
    },
    {
      version: 'V2.0',
      uploadDate: '2024-01-10 09:15',
      uploader: '李四',
      remark: '增加材料规格说明',
      isCurrent: false
    },
    {
      version: 'V1.0',
      uploadDate: '2024-01-05 16:45',
      uploader: '王五',
      remark: '初始版本',
      isCurrent: false
    }
  ];

  const operationLogs = [
    {
      time: '2024-01-15 14:35',
      user: '张三',
      action: '上传新版本',
      detail: '上传了 V3.0 版本'
    },
    {
      time: '2024-01-15 10:20',
      user: '赵六',
      action: '下载文件',
      detail: '下载了 V2.0 版本'
    },
    {
      time: '2024-01-14 16:30',
      user: '李四',
      action: '修改元数据',
      detail: '修改了档案题名：从"施工图纸"改为"公交站台施工图纸"'
    },
    {
      time: '2024-01-14 14:15',
      user: '王五',
      action: '查看详情',
      detail: '查看了档案详情'
    },
    {
      time: '2024-01-10 09:20',
      user: '李四',
      action: '上传新版本',
      detail: '上传了 V2.0 版本'
    }
  ];

  const handleSaveEdit = () => {
    console.log('保存修改:', editData);
    setIsEditing(false);
    
    const newLog = {
      time: new Date().toLocaleString('zh-CN'),
      user: '当前用户',
      action: '修改元数据',
      detail: `修改了档案信息`
    };
    
    alert('档案信息修改成功！');
  };

  const handleVersionUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setShowVersionUpload(false);
    alert('新版本上传成功！');
  };

  return (
    <div className="space-y-6">
      {/* 返回按钮和标题 */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          返回列表
        </button>
        <h2 className="text-xl font-semibold text-gray-900">{archive.title}</h2>
        <span className="text-sm text-gray-500">档号：{archive.archiveNumber}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：文件预览区 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 预览操作栏 */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="font-medium text-gray-900">文件预览</h3>
                <span className="text-sm text-gray-500">当前版本：{archive.version}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                  <i className="ri-download-line mr-1"></i>
                  下载
                </button>
                <button
                  onClick={() => setShowVersionUpload(true)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  <i className="ri-upload-line mr-1"></i>
                  上传新版本
                </button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                  <i className="ri-fullscreen-line mr-1"></i>
                  全屏预览
                </button>
              </div>
            </div>
          </div>

          {/* 文件预览窗口 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <i className="ri-file-pdf-line text-6xl text-red-500 mb-4"></i>
                <p className="text-gray-600 mb-2">PDF 文档预览</p>
                <p className="text-sm text-gray-500">{archive.title}</p>
                <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  点击预览文档
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：详情信息区 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border">
            {/* 标签页导航 */}
            <div className="border-b">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('metadata')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'metadata'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  元数据
                </button>
                <button
                  onClick={() => setActiveTab('versions')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'versions'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  版本历史
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'logs'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  操作日志
                </button>
              </nav>
            </div>

            <div className="p-4">
              {/* 元数据详情 */}
              {activeTab === 'metadata' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 text-base">档案元数据</h4>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-3 py-1.5 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all duration-200"
                      >
                        <i className="ri-edit-line mr-1.5"></i>
                        编辑
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center px-3 py-1.5 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                        >
                          <i className="ri-check-line mr-1"></i>
                          保存
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200"
                        >
                          <i className="ri-close-line mr-1"></i>
                          取消
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* 档号 */}
                    <div className="flex items-start py-3 border-b border-gray-100">
                      <div className="w-20 flex-shrink-0">
                        <label className="text-sm font-medium text-gray-600">档号</label>
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded border">
                          {archive.archiveNumber}
                        </div>
                      </div>
                    </div>
                    
                    {/* 档案题名 */}
                    <div className="flex items-start py-3 border-b border-gray-100">
                      <div className="w-20 flex-shrink-0">
                        <label className="text-sm font-medium text-gray-600">题名</label>
                      </div>
                      <div className="flex-1 ml-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.title}
                            onChange={(e) => setEditData({...editData, title: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          />
                        ) : (
                          <div className="text-sm text-gray-900 leading-relaxed">{archive.title}</div>
                        )}
                      </div>
                    </div>
                    
                    {/* 所属项目 */}
                    <div className="flex items-start py-3 border-b border-gray-100">
                      <div className="w-20 flex-shrink-0">
                        <label className="text-sm font-medium text-gray-600">项目</label>
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="text-sm text-gray-900">{archive.projectName}</div>
                      </div>
                    </div>
                    
                    {/* 建设阶段 */}
                    <div className="flex items-start py-3 border-b border-gray-100">
                      <div className="w-20 flex-shrink-0">
                        <label className="text-sm font-medium text-gray-600">阶段</label>
                      </div>
                      <div className="flex-1 ml-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {archive.stage}
                        </span>
                      </div>
                    </div>
                    
                    {/* 保管期限 */}
                    <div className="flex items-start py-3 border-b border-gray-100">
                      <div className="w-20 flex-shrink-0">
                        <label className="text-sm font-medium text-gray-600">期限</label>
                      </div>
                      <div className="flex-1 ml-4">
                        {isEditing ? (
                          <select
                            value={editData.retentionPeriod}
                            onChange={(e) => setEditData({...editData, retentionPeriod: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pr-8"
                          >
                            <option value="10年">10年</option>
                            <option value="30年">30年</option>
                            <option value="永久">永久</option>
                          </select>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {editData.retentionPeriod}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* 上传日期 */}
                    <div className="flex items-start py-3 border-b border-gray-100">
                      <div className="w-20 flex-shrink-0">
                        <label className="text-sm font-medium text-gray-600">日期</label>
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <i className="ri-calendar-line mr-2 text-gray-400"></i>
                          {archive.uploadDate}
                        </div>
                      </div>
                    </div>
                    
                    {/* 档案描述 */}
                    <div className="flex items-start py-3">
                      <div className="w-20 flex-shrink-0">
                        <label className="text-sm font-medium text-gray-600">描述</label>
                      </div>
                      <div className="flex-1 ml-4">
                        {isEditing ? (
                          <textarea
                            value={editData.description}
                            onChange={(e) => setEditData({...editData, description: e.target.value})}
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="请输入档案描述"
                          />
                        ) : (
                          <div className="text-sm text-gray-900 leading-relaxed">
                            {editData.description ? (
                              <div className="bg-gray-50 p-3 rounded-lg border">
                                {editData.description}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">暂无描述</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 版本历史 */}
              {activeTab === 'versions' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">版本历史</h4>
                  <div className="space-y-3">
                    {versionHistory.map((version, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${version.isCurrent ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${version.isCurrent ? 'text-purple-600' : 'text-gray-900'}`}>
                              {version.version}
                            </span>
                            {version.isCurrent && (
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                当前版本
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-xs text-blue-600 hover:text-blue-800">
                              预览
                            </button>
                            <button className="text-xs text-green-600 hover:text-green-800">
                              下载
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div>{version.uploadDate} · {version.uploader}</div>
                          <div className="mt-1">{version.remark}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 操作日志 */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">操作日志</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {operationLogs.map((log, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">{log.user}</span> {log.action}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {log.detail}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {log.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 新版本上传弹窗 */}
      {showVersionUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">上传新版本</h3>
            <form onSubmit={handleVersionUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择文件</label>
                <input
                  type="file"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">版本备注</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                  placeholder="请输入版本更新说明"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowVersionUpload(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  上传
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
