import { PageContainer } from '@ant-design/pro-components';
import StageTemplateManager from './components/StageTemplateManager';

export default function StageTemplate() {
  return (
    <PageContainer
      title="项目阶段配置"
    >
      <StageTemplateManager />
    </PageContainer>
  );
}
