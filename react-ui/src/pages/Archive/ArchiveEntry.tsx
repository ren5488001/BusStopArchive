import { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import {
  Card,
  Steps,
  Button,
  Select,
  Upload,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Tag,
  Divider,
  message,
  Space,
  Alert,
  Spin,
} from 'antd';
import {
  InboxOutlined,
  PlusOutlined,
  CloseOutlined,
  CheckOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const ArchiveEntry: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState({
    summary: '',
    tags: [] as string[],
    isProcessing: false,
  });
  const [manualTags, setManualTags] = useState<string[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const projects = [
    { code: 'PRJ001', name: '中山路公交站台建设项目' },
    { code: 'PRJ002', name: '解放路公交站台建设项目' },
    { code: 'PRJ003', name: '人民路公交站台建设项目' },
  ];

  const stages = ['立项', '设计', '施工', '验收'];

  const systemTags = [
    '施工图纸',
    '设计方案',
    '技术文档',
    '验收报告',
    '质量检测',
    '安全资料',
    '材料清单',
    '工程变更',
    '竣工资料',
    '监理记录',
    '钢结构',
    '混凝土',
    '建筑工程',
    '市政工程',
    '公交设施',
    '环保资料',
    '财务文档',
    '合同协议',
    '招投标',
    '审批文件',
  ];

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    beforeUpload: (file) => {
      const newFile = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        status: 'uploading',
      };

      setUploadedFiles((prev) => [...prev, newFile]);

      // 模拟AI处理
      setAiSuggestions((prev) => ({ ...prev, isProcessing: true }));

      setTimeout(() => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id ? { ...f, status: 'completed' } : f,
          ),
        );

        // 模拟AI生成的建议
        setAiSuggestions({
          isProcessing: false,
          summary:
            '本文件为公交站台建设项目的施工图纸，包含站台结构设计、材料规格说明和施工工艺要求。图纸详细描述了站台的尺寸规格、钢结构连接方式以及防腐处理工艺。',
          tags: ['施工图纸', '钢结构', '公交站台', '建设工程', '技术文档'],
        });
      }, 2000);

      return false; // 阻止自动上传
    },
    onRemove: (file: any) => {
      setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id));
    },
    fileList: uploadedFiles.map((f) => ({
      uid: f.id,
      name: f.name,
      status: f.status === 'completed' ? 'done' : 'uploading',
      size: f.size,
    })),
  };

  const handleAddManualTag = (tag: string) => {
    if (tag && !manualTags.includes(tag) && !aiSuggestions.tags.includes(tag)) {
      setManualTags([...manualTags, tag]);
    }
  };

  const handleRemoveManualTag = (tagToRemove: string) => {
    setManualTags(manualTags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddCustomTag = () => {
    if (
      newTagInput.trim() &&
      !manualTags.includes(newTagInput.trim()) &&
      !aiSuggestions.tags.includes(newTagInput.trim())
    ) {
      setManualTags([...manualTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const removeAiTag = (tagToRemove: string) => {
    setAiSuggestions((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        // 验证第一步
        const values = await form.validateFields(['projectCode', 'stage']);
        if (uploadedFiles.length === 0) {
          message.error('请至少上传一个文件');
          return;
        }
      } else if (currentStep === 1) {
        // 验证第二步
        await form.validateFields(['title', 'fileDate']);
      }
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.log('验证失败:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const allTags = [...manualTags, ...aiSuggestions.tags];
      const finalKeywords = allTags.join(', ');

      const archiveNumber = `${values.projectCode}-${values.stage}-${Date.now().toString().slice(-6)}`;

      message.success(`档案入库成功！档号：${archiveNumber}`);

      // 重置表单
      form.resetFields();
      setCurrentStep(0);
      setUploadedFiles([]);
      setAiSuggestions({
        summary: '',
        tags: [],
        isProcessing: false,
      });
      setManualTags([]);
      setShowTagSelector(false);
      setNewTagInput('');
    } catch (error) {
      console.log('提交失败:', error);
    }
  };

  const steps = [
    {
      title: '项目关联与文件上传',
      icon: null,
    },
    {
      title: '元数据录入',
      icon: null,
    },
    {
      title: '确认入库',
      icon: null,
    },
  ];

  return (
    <PageContainer
      header={{
        title: '著录与入库',
        breadcrumb: {},
      }}
    >
      <Card>
        {/* 步骤指示器 */}
        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            retentionPeriod: '30年',
          }}
        >
          {/* Step 1: 项目关联与文件上传 */}
          {currentStep === 0 && (
            <Row gutter={24}>
              {/* 左侧：项目关联 */}
              <Col span={12}>
                <Card title="项目关联（必填）" bordered={false}>
                  <Form.Item
                    name="projectCode"
                    label="选择项目"
                    rules={[{ required: true, message: '请选择项目' }]}
                  >
                    <Select placeholder="请选择项目" size="large">
                      {projects.map((project) => (
                        <Option key={project.code} value={project.code}>
                          {project.code} - {project.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="stage"
                    label="建设阶段"
                    rules={[{ required: true, message: '请选择建设阶段' }]}
                  >
                    <Select placeholder="请选择建设阶段" size="large">
                      {stages.map((stage) => (
                        <Option key={stage} value={stage}>
                          {stage}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Card>
              </Col>

              {/* 右侧：文件上传 */}
              <Col span={12}>
                <Card title="文件上传" bordered={false}>
                  <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">拖拽文件到此处或点击上传</p>
                    <p className="ant-upload-hint">
                      支持 PDF、Word、Excel、图片等格式
                    </p>
                  </Dragger>
                </Card>
              </Col>
            </Row>
          )}

          {/* Step 2: 元数据录入 */}
          {currentStep === 1 && (
            <Row gutter={24}>
              {/* 左侧：表单录入 */}
              <Col span={12}>
                <Card title="档案元数据录入" bordered={false}>
                  <Form.Item
                    name="title"
                    label="档案题名"
                    rules={[{ required: true, message: '请输入档案题名' }]}
                  >
                    <Input placeholder="请输入档案题名" size="large" />
                  </Form.Item>

                  <Form.Item
                    name="fileDate"
                    label="文件日期"
                    rules={[{ required: true, message: '请选择文件日期' }]}
                  >
                    <DatePicker style={{ width: '100%' }} size="large" />
                  </Form.Item>

                  <Form.Item name="retentionPeriod" label="保管期限">
                    <Select size="large">
                      <Option value="10年">10年</Option>
                      <Option value="30年">30年</Option>
                      <Option value="永久">永久</Option>
                    </Select>
                  </Form.Item>

                  {/* 手动标签选择 */}
                  <Form.Item label="选择标签">
                    <div style={{ marginBottom: 12 }}>
                      <Space wrap>
                        {manualTags.map((tag, index) => (
                          <Tag
                            key={index}
                            color="blue"
                            closable
                            onClose={() => handleRemoveManualTag(tag)}
                          >
                            {tag}
                          </Tag>
                        ))}
                        {manualTags.length === 0 && (
                          <span style={{ color: '#999', fontStyle: 'italic' }}>
                            暂未选择标签
                          </span>
                        )}
                      </Space>
                    </div>

                    <Button
                      icon={<PlusOutlined />}
                      onClick={() => setShowTagSelector(!showTagSelector)}
                      style={{ borderStyle: 'dashed' }}
                    >
                      添加标签
                    </Button>

                    {showTagSelector && (
                      <Card
                        size="small"
                        style={{ marginTop: 12, backgroundColor: '#fafafa' }}
                      >
                        {/* 自定义标签输入 */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ marginBottom: 8, fontWeight: 500 }}>
                            自定义标签
                          </div>
                          <Space.Compact style={{ width: '100%' }}>
                            <Input
                              value={newTagInput}
                              onChange={(e) => setNewTagInput(e.target.value)}
                              placeholder="输入新标签名称"
                              onPressEnter={handleAddCustomTag}
                            />
                            <Button
                              type="primary"
                              onClick={handleAddCustomTag}
                              disabled={!newTagInput.trim()}
                            >
                              添加
                            </Button>
                          </Space.Compact>
                        </div>

                        {/* 系统标签列表 */}
                        <div>
                          <div style={{ marginBottom: 8, fontWeight: 500 }}>
                            系统标签
                          </div>
                          <div
                            style={{
                              maxHeight: 160,
                              overflowY: 'auto',
                              marginBottom: 12,
                            }}
                          >
                            <Space wrap>
                              {systemTags
                                .filter(
                                  (tag) =>
                                    !manualTags.includes(tag) &&
                                    !aiSuggestions.tags.includes(tag),
                                )
                                .map((tag, index) => (
                                  <Tag
                                    key={index}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleAddManualTag(tag)}
                                  >
                                    {tag}
                                  </Tag>
                                ))}
                            </Space>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <Button
                              size="small"
                              onClick={() => setShowTagSelector(false)}
                            >
                              完成
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}
                  </Form.Item>

                  <Form.Item name="keywords" label="关键词">
                    <Input placeholder="多个关键词用逗号分隔" />
                  </Form.Item>

                  <Form.Item name="description" label="档案描述">
                    <TextArea rows={4} placeholder="请输入档案描述" />
                  </Form.Item>
                </Card>
              </Col>

              {/* 右侧：AI辅助 */}
              <Col span={12}>
                <Card
                  title={
                    <span>
                      <RobotOutlined /> AI 智能辅助
                    </span>
                  }
                  bordered={false}
                >
                  {aiSuggestions.isProcessing ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                      <Spin size="large" />
                      <p style={{ marginTop: 16, color: '#666' }}>
                        AI 正在分析文件内容...
                      </p>
                    </div>
                  ) : (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      {/* AI生成的摘要 */}
                      <div>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>
                          AI 生成摘要
                        </div>
                        <TextArea
                          value={aiSuggestions.summary}
                          onChange={(e) =>
                            setAiSuggestions({
                              ...aiSuggestions,
                              summary: e.target.value,
                            })
                          }
                          rows={4}
                          placeholder="AI 将自动生成文件摘要"
                        />
                        <div style={{ marginTop: 4, color: '#999', fontSize: 12 }}>
                          您可以编辑AI生成的摘要
                        </div>
                      </div>

                      {/* AI推荐标签 */}
                      <div>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>
                          AI 推荐标签
                        </div>
                        <Space wrap>
                          {aiSuggestions.tags.map((tag, index) => (
                            <Tag
                              key={index}
                              color="purple"
                              closable
                              onClose={() => removeAiTag(tag)}
                            >
                              {tag}
                            </Tag>
                          ))}
                        </Space>
                        <div style={{ marginTop: 4, color: '#999', fontSize: 12 }}>
                          点击标签可以删除，您也可以手动添加关键词
                        </div>
                      </div>
                    </Space>
                  )}
                </Card>
              </Col>
            </Row>
          )}

          {/* Step 3: 确认入库 */}
          {currentStep === 2 && (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    margin: '0 auto 24px',
                    borderRadius: '50%',
                    backgroundColor: '#52c41a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckOutlined style={{ fontSize: 32, color: '#fff' }} />
                </div>

                <h3 style={{ fontSize: 20, marginBottom: 24 }}>确认档案信息</h3>

                <Card
                  style={{
                    maxWidth: 800,
                    margin: '0 auto 24px',
                    textAlign: 'left',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <span style={{ fontWeight: 500 }}>项目：</span>
                      <span>{form.getFieldValue('projectCode')}</span>
                    </Col>
                    <Col span={12}>
                      <span style={{ fontWeight: 500 }}>阶段：</span>
                      <span>{form.getFieldValue('stage')}</span>
                    </Col>
                    <Col span={12}>
                      <span style={{ fontWeight: 500 }}>题名：</span>
                      <span>{form.getFieldValue('title')}</span>
                    </Col>
                    <Col span={12}>
                      <span style={{ fontWeight: 500 }}>文件日期：</span>
                      <span>
                        {form.getFieldValue('fileDate')?.format('YYYY-MM-DD')}
                      </span>
                    </Col>
                    <Col span={12}>
                      <span style={{ fontWeight: 500 }}>保管期限：</span>
                      <span>{form.getFieldValue('retentionPeriod')}</span>
                    </Col>
                  </Row>

                  {/* 显示所有标签 */}
                  {(manualTags.length > 0 || aiSuggestions.tags.length > 0) && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontWeight: 500, marginBottom: 8 }}>标签：</div>
                      <Space wrap>
                        {manualTags.map((tag, index) => (
                          <Tag key={`manual-${index}`} color="blue">
                            {tag}
                          </Tag>
                        ))}
                        {aiSuggestions.tags.map((tag, index) => (
                          <Tag key={`ai-${index}`} color="purple">
                            {tag}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  )}

                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 500, marginBottom: 8 }}>上传文件：</div>
                    <ul style={{ marginBottom: 0 }}>
                      {uploadedFiles.map((file) => (
                        <li key={file.id}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                </Card>

                <Alert
                  message="档案将被分配唯一档号并正式入库，请确认信息无误后点击确认入库。"
                  type="info"
                  showIcon
                />
              </div>
            </Card>
          )}
        </Form>

        <Divider />

        {/* 底部操作按钮 */}
        <Row justify="space-between">
          <Col>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handlePrev}
              disabled={currentStep === 0}
              size="large"
            >
              上一步
            </Button>
          </Col>
          <Col>
            <Space>
              <Button icon={<SaveOutlined />} size="large">
                保存草稿
              </Button>

              {currentStep < 2 ? (
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  onClick={handleNext}
                  size="large"
                >
                  下一步
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleSubmit}
                  size="large"
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  确认入库
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>
    </PageContainer>
  );
};

export default ArchiveEntry;
