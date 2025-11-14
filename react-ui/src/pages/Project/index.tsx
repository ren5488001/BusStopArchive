import { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Tabs, Space, Tag } from 'antd';
import { BuildOutlined, FileListOutlined } from '@ant-design/icons';
import ProjectList from './components/ProjectList';
import ProjectForm from './components/ProjectForm';
import StageTemplateManager from './components/StageTemplateManager';
import { mockProjects, mockStageTemplates } from '../../mocks/projectData';

export default function Project() {
  const [activeTab, setActiveTab] = useState('list');
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

  const tabItems = [
    {
      key: 'list',
      label: (
        <Space>
          <BuildOutlined />
          项目信息维护
        </Space>
      ),
    },
    {
      key: 'templates',
      label: (
        <Space>
          <FileListOutlined />
          项目阶段配置
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="项目管理"
      extra={
        <Space>
          <Tag color="default">
            最后更新: {new Date().toLocaleString('zh-CN')}
          </Tag>
        </Space>
      }
    >
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
        
        <div style={{ marginTop: 16 }}>
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
        </div>
      </Card>

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

