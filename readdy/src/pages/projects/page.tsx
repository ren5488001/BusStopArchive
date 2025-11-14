import { useState } from 'react';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';
import StageTemplateManager from './components/StageTemplateManager';
import { mockProjects, mockStageTemplates } from '../../mocks/projectData';

export default function Projects() {
  const [activeTab, setActiveTab] = useState('list');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const handleNewProject = () => {
    setEditingProject(null);
    setShowProjectForm(true);
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleCloseForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <i className="ri-building-line text-white text-lg"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">项目管理</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                最后更新: {new Date().toLocaleString('zh-CN')}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 标签页导航 */}
      <div className="bg-white border-b">
        <div className="px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'list'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="ri-list-check-2 mr-2"></i>
              项目信息维护
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'templates'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className="ri-settings-3-line mr-2"></i>
              项目阶段配置
            </button>
          </nav>
        </div>
      </div>

      {/* 主要内容区域 */}
      <main className="p-6">
        {activeTab === 'list' && (
          <ProjectList
            projects={mockProjects}
            onNewProject={handleNewProject}
            onEditProject={handleEditProject}
          />
        )}
        {activeTab === 'templates' && (
          <StageTemplateManager templates={mockStageTemplates} />
        )}
      </main>

      {/* 项目表单弹窗 */}
      {showProjectForm && (
        <ProjectForm
          project={editingProject}
          templates={mockStageTemplates}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}