import { PageContainer } from '@ant-design/pro-components';
import { Space, Tag } from 'antd';
import StageTemplateManager from './components/StageTemplateManager';
import { mockStageTemplates } from '../../mocks/projectData';

export default function StageTemplate() {
  return (
    <PageContainer
      title="项目阶段配置"
      extra={
        <Space>
          <Tag color="default">
            最后更新: {new Date().toLocaleString('zh-CN')}
          </Tag>
        </Space>
      }
    >
      <StageTemplateManager templates={mockStageTemplates} />
    </PageContainer>
  );
}
