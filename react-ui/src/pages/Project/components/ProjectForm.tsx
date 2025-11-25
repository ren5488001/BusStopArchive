import { useState, useEffect, memo } from 'react';
import { Modal, Form, Input, Select, InputNumber, message, Spin, Space, Button } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { addProject, updateProject, type ProjectType } from '@/services/bams/project';
import { getTemplateList, type StageTemplateType } from '@/services/bams/stageTemplate';
import MapPicker from '@/components/MapPicker';

const { TextArea } = Input;

interface ProjectFormProps {
  project: ProjectType | null;
  onClose: () => void;
}

/**
 * 项目表单组件
 * 使用 React.memo 优化性能，避免不必要的重渲染
 */
const ProjectForm = memo(({ project, onClose }: ProjectFormProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<StageTemplateType[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [originalTemplateId, setOriginalTemplateId] = useState<number | undefined>();
  const [mapPickerVisible, setMapPickerVisible] = useState(false);

  // 加载阶段模板列表
  useEffect(() => {
    const loadTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const response = await getTemplateList({ status: '0' });
        setTemplates(response.rows || []);
      } catch (error) {
        message.error('加载模板列表失败');
      } finally {
        setTemplatesLoading(false);
      }
    };
    loadTemplates();
  }, []);

  // 初始化表单数据
  useEffect(() => {
    if (project) {
      setOriginalTemplateId(project.templateId);
      form.setFieldsValue({
        projectName: project.projectName,
        projectManager: project.projectManager,
        templateId: project.templateId,
        latitude: project.latitude,
        longitude: project.longitude,
        projectDesc: project.projectDesc,
      });
    } else {
      setOriginalTemplateId(undefined);
      form.resetFields();
    }
  }, [project, form]);

  // 处理模板切换
  const handleTemplateChange = (value: number) => {
    // 如果是编辑模式，且模板发生了变化，显示警告
    if (project && originalTemplateId && value !== originalTemplateId) {
      Modal.confirm({
        title: '警告',
        content: '切换模板将删除原有的阶段配置，确定要继续吗？',
        okText: '确定',
        cancelText: '取消',
        okType: 'danger',
        onOk: () => {
          // 用户确认，保持新选择的模板
          form.setFieldsValue({ templateId: value });
        },
        onCancel: () => {
          // 用户取消，恢复原模板
          form.setFieldsValue({ templateId: originalTemplateId });
        },
      });
    }
  };

  // 处理地图选点确认
  const handleMapPickerConfirm = (lng: number, lat: number) => {
    form.setFieldsValue({
      longitude: lng,
      latitude: lat,
    });
    message.success('坐标已填充');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (project) {
        // 更新项目
        await updateProject({
          ...values,
          projectId: project.projectId,
        });
        message.success('更新成功');
      } else {
        // 新增项目
        await addProject(values);
        message.success('新增成功');
      }

      onClose();
    } catch (error: any) {
      message.error(error.msg || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={project ? '编辑项目' : '新增项目'}
      open
      onOk={handleSubmit}
      onCancel={onClose}
      width={720}
      confirmLoading={loading}
      maskClosable={false}
    >
      <Spin spinning={templatesLoading}>
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="projectName"
            label="项目名称"
            rules={[
              { required: true, message: '请输入项目名称' },
              { max: 200, message: '项目名称不能超过200个字符' },
            ]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item
            name="projectManager"
            label="项目负责人"
            rules={[
              { max: 100, message: '项目负责人不能超过100个字符' },
            ]}
          >
            <Input placeholder="请输入项目负责人" />
          </Form.Item>

          <Form.Item
            name="templateId"
            label="阶段模板"
            tooltip="选择模板后，系统会自动为项目配置相应的建设阶段"
          >
            <Select
              placeholder="请选择阶段模板"
              allowClear
              loading={templatesLoading}
              onChange={handleTemplateChange}
            >
              {templates.map((template) => (
                <Select.Option key={template.templateId} value={template.templateId}>
                  {template.templateName} ({template.stageCount}个阶段)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="GIS坐标">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item
                  name="latitude"
                  noStyle
                  rules={[
                    { type: 'number', min: -90, max: 90, message: '纬度范围：-90~90' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '50%' }}
                    placeholder="纬度"
                    precision={6}
                  />
                </Form.Item>
                <Form.Item
                  name="longitude"
                  noStyle
                  rules={[
                    { type: 'number', min: -180, max: 180, message: '经度范围：-180~180' },
                  ]}
                >
                  <InputNumber
                    style={{ width: '50%' }}
                    placeholder="经度"
                    precision={6}
                  />
                </Form.Item>
              </Space.Compact>
              <Button
                icon={<EnvironmentOutlined />}
                onClick={() => setMapPickerVisible(true)}
                style={{ width: '100%' }}
              >
                在地图上选择位置
              </Button>
            </Space>
          </Form.Item>

          <Form.Item
            name="projectDesc"
            label="项目描述"
            rules={[
              { max: 1000, message: '项目描述不能超过1000个字符' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="请输入项目描述"
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </Form>
      </Spin>

      <MapPicker
        visible={mapPickerVisible}
        onClose={() => setMapPickerVisible(false)}
        onConfirm={handleMapPickerConfirm}
        defaultPosition={
          form.getFieldValue('longitude') && form.getFieldValue('latitude')
            ? [form.getFieldValue('longitude'), form.getFieldValue('latitude')]
            : undefined
        }
      />
    </Modal>
  );
});

ProjectForm.displayName = 'ProjectForm';

export default ProjectForm;
