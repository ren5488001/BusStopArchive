import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Card, Divider, Tag, Space, Alert } from 'antd';
import { InfoCircleOutlined, EnvironmentOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

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
  const [form] = Form.useForm();
  const [selectedTemplate, setSelectedTemplate] = useState<StageTemplate | null>(null);

  useEffect(() => {
    if (project) {
      form.setFieldsValue({
        ...project,
        startDate: project.startDate ? dayjs(project.startDate) : undefined,
        endDate: project.endDate ? dayjs(project.endDate) : undefined,
      });
      const template = templates.find(t => t.name === project.template);
      setSelectedTemplate(template || null);
    } else {
      form.resetFields();
      setSelectedTemplate(null);
    }
  }, [project, templates, form]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
    form.setFieldValue('template', template?.name || '');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : '',
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : '',
      };
      
      if (!project) {
        // 新增项目时，系统自动生成项目编号
        const newProjectCode = `PRJ${Date.now().toString().slice(-8)}`;
        console.log('新增项目数据:', { ...formData, code: newProjectCode });
      } else {
        console.log('更新项目数据:', formData);
      }
      
      onClose();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title={project ? '编辑项目' : '新增项目'}
      open={true}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {project ? '更新项目' : '创建项目'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: '计划中',
        }}
      >
        {/* 基础信息 */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
              基础信息
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            name="code"
            label="项目编号"
            hidden={!project}
            style={{ display: project ? 'block' : 'none' }}
          >
            <Input disabled placeholder="系统自动生成" />
          </Form.Item>

          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Space.Compact style={{ width: '100%', gap: 16 }}>
            <Form.Item
              name="manager"
              label="项目负责人"
              rules={[{ required: true, message: '请选择负责人' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="请选择负责人">
                <Option value="张三">张三</Option>
                <Option value="李四">李四</Option>
                <Option value="王五">王五</Option>
                <Option value="赵六">赵六</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="项目状态"
              style={{ flex: 1 }}
            >
              <Select>
                <Option value="计划中">计划中</Option>
                <Option value="在建中">在建中</Option>
                <Option value="已竣工">已竣工</Option>
                <Option value="暂停">暂停</Option>
              </Select>
            </Form.Item>
          </Space.Compact>

          <Space.Compact style={{ width: '100%', gap: 16 }}>
            <Form.Item
              name="startDate"
              label="计划开始日期"
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="计划结束日期"
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Space.Compact>

          {!project && (
            <Alert
              message="项目编号将在创建成功后由系统自动生成"
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Card>

        {/* GIS坐标信息 */}
        <Card
          title={
            <Space>
              <EnvironmentOutlined style={{ color: '#52c41a' }} />
              GIS坐标信息
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Space.Compact style={{ width: '100%', gap: 16 }}>
            <Form.Item
              name="latitude"
              label="纬度"
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                step={0.000001}
                placeholder="请输入纬度"
              />
            </Form.Item>

            <Form.Item
              name="longitude"
              label="经度"
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                step={0.000001}
                placeholder="请输入经度"
              />
            </Form.Item>
          </Space.Compact>

          <Button
            type="default"
            icon={<EnvironmentOutlined />}
            onClick={() => {
              // TODO: 实现地图选择功能
              console.log('在地图上选择位置');
            }}
            style={{ marginTop: 16 }}
          >
            在地图上选择位置
          </Button>
        </Card>

        {/* 阶段模板选择 */}
        <Card
          title={
            <Space>
              <FileTextOutlined style={{ color: '#722ed1' }} />
              选择阶段模板
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            name="template"
            label="建设阶段模板"
            rules={[{ required: true, message: '请选择阶段模板' }]}
          >
            <Select
              placeholder="请选择阶段模板"
              onChange={handleTemplateChange}
            >
              {templates.map(template => (
                <Option key={template.id} value={template.id}>
                  {template.name} ({template.stageCount}个阶段)
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* 模板预览 */}
          {selectedTemplate && (
            <Card
              title="模板预览"
              size="small"
              style={{ marginTop: 16, backgroundColor: '#fafafa' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {selectedTemplate.stages.map((stage, index) => (
                  <div key={stage.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <Tag color="blue" style={{ marginTop: 4 }}>
                      {index + 1}
                    </Tag>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>{stage.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.45)', marginBottom: 8 }}>
                        应归档文件: {stage.requiredFiles.length} 个
                      </div>
                      {stage.requiredFiles.length > 0 && (
                        <Space wrap size={[8, 8]}>
                          {stage.requiredFiles.slice(0, 3).map(file => (
                            <Tag key={file} color="blue">{file}</Tag>
                          ))}
                          {stage.requiredFiles.length > 3 && (
                            <Tag>+{stage.requiredFiles.length - 3}个</Tag>
                          )}
                        </Space>
                      )}
                    </div>
                  </div>
                ))}
              </Space>
            </Card>
          )}
        </Card>

        {/* 项目描述 */}
        <Card
          title={
            <Space>
              <FileTextOutlined style={{ color: '#fa8c16' }} />
              项目描述
            </Space>
          }
        >
          <Form.Item name="description" label="项目描述">
            <TextArea
              rows={4}
              placeholder="请输入项目描述..."
            />
          </Form.Item>
        </Card>
      </Form>
    </Modal>
  );
}

