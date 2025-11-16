import { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Space, Tag } from 'antd';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';
import { mockProjects, mockStageTemplates } from '../../mocks/projectData';

export default function ProjectInfo() {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

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
    <PageContainer
      title="项目信息维护"
      extra={
        <Space>
          <Tag color="default">
            最后更新: {new Date().toLocaleString('zh-CN')}
          </Tag>
        </Space>
      }
    >
      <ProjectList
        projects={mockProjects}
        onNewProject={handleNewProject}
        onEditProject={handleEditProject}
      />

      {/* 项目表单弹窗 */}
      {showProjectForm && (
        <ProjectForm
          project={editingProject}
          templates={mockStageTemplates}
          onClose={handleCloseForm}
        />
      )}
    </PageContainer>
  );
}
