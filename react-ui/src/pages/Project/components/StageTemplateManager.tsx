import { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Modal, Form, Input, Checkbox, Tooltip, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, CopyOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, FileTextOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getDictSelectOption } from '@/services/system/dict';
import {
  getTemplateList,
  getTemplateDetail,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  copyTemplate,
} from '@/services/bams/stageTemplate';

const { TextArea } = Input;
const { confirm } = Modal;

interface StageDetail {
  id?: number;
  stageId: string;
  stageDisplayName: string;
  stageOrder: number;
  requiredFileList: string[];
}

interface StageTemplate {
  templateId?: number;
  templateName: string;
  templateDesc?: string;
  stageCount: number;
  status?: string;
  createBy?: string;
  createTime?: string;
  remark?: string;
  stages?: StageDetail[];
}

export default function StageTemplateManager() {
  const [templates, setTemplates] = useState<StageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<StageTemplate | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyingTemplate, setCopyingTemplate] = useState<StageTemplate | null>(null);
  const [copyTemplateName, setCopyTemplateName] = useState('');

  // 加载模板列表
  const loadTemplates = async (pageNum: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const response = await getTemplateList({
        pageNum,
        pageSize,
      });
      if (response.code === 200) {
        setTemplates(response.rows || []);
        setPagination({
          current: pageNum,
          pageSize,
          total: response.total || 0,
        });
      } else {
        message.error(response.msg || '加载模板列表失败');
      }
    } catch (error) {
      console.error('加载模板列表失败:', error);
      message.error('加载模板列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates(1, 10);
  }, []);

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setShowTemplateForm(true);
  };

  const handleEditTemplate = async (template: StageTemplate) => {
    if (!template.templateId) return;

    try {
      const response = await getTemplateDetail(template.templateId);
      if (response.code === 200) {
        setEditingTemplate(response.data);
        setShowTemplateForm(true);
      } else {
        message.error(response.msg || '加载模板详情失败');
      }
    } catch (error) {
      console.error('加载模板详情失败:', error);
      message.error('加载模板详情失败');
    }
  };

  const handleDeleteTemplate = (templateId: number) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除该模板吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await deleteTemplate(templateId.toString());
          if (response.code === 200) {
            message.success('删除成功');
            // 如果当前页只有一条数据且不是第一页，则返回上一页
            const targetPage = templates.length === 1 && pagination.current > 1
              ? pagination.current - 1
              : pagination.current;
            loadTemplates(targetPage, pagination.pageSize);
          } else {
            message.error(response.msg || '删除失败');
          }
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败');
        }
      },
    });
  };

  const handleCopyTemplate = (template: StageTemplate) => {
    if (!template.templateId) return;
    setCopyingTemplate(template);
    setCopyTemplateName(template.templateName + '（副本）');
    setShowCopyModal(true);
  };

  const handleConfirmCopy = async () => {
    if (!copyingTemplate?.templateId) return;

    const newName = copyTemplateName.trim() || copyingTemplate.templateName + '（副本）';

    try {
      const response = await copyTemplate(copyingTemplate.templateId, newName);
      if (response.code === 200) {
        message.success('复制成功');
        setShowCopyModal(false);
        setCopyingTemplate(null);
        setCopyTemplateName('');
        loadTemplates(1, pagination.pageSize);
      } else {
        message.error(response.msg || '复制失败');
      }
    } catch (error) {
      console.error('复制失败:', error);
      message.error('复制失败');
    }
  };

  const handleCancelCopy = () => {
    setShowCopyModal(false);
    setCopyingTemplate(null);
    setCopyTemplateName('');
  };

  const handleCloseForm = () => {
    setShowTemplateForm(false);
    setEditingTemplate(null);
  };

  const handleSaveSuccess = () => {
    loadTemplates(1, pagination.pageSize);
    handleCloseForm();
  };

  const columns: ColumnsType<StageTemplate> = [
    {
      title: '模板名称',
      dataIndex: 'templateName',
      key: 'templateName',
      render: (name: string) => (
        <Space>
          <div style={{
            width: 32,
            height: 32,
            backgroundColor: '#e6f7ff',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}>
            <FileTextOutlined style={{ color: '#1890ff' }} />
          </div>
          <span style={{ fontWeight: 500 }}>{name}</span>
        </Space>
      ),
    },
    {
      title: '阶段总数',
      dataIndex: 'stageCount',
      key: 'stageCount',
      width: 120,
      render: (count: number) => (
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          backgroundColor: '#e6f7ff',
          color: '#1890ff',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 500
        }}>
          {count} 个阶段
        </span>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'createBy',
      key: 'createBy',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditTemplate(record)}
            >
              编辑
            </Button>
          </Tooltip>
          <Tooltip title="复制">
            <Button
              type="link"
              icon={<CopyOutlined />}
              onClick={() => handleCopyTemplate(record)}
            >
              复制
            </Button>
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => record.templateId && handleDeleteTemplate(record.templateId)}
            >
              删除
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
      {/* 操作栏 */}
      <Card>
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleNewTemplate}
          >
            新增模板
          </Button>
          <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
            共 {templates.length} 个模板
          </span>
        </Space>
      </Card>

      {/* 模板列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={templates}
          rowKey="templateId"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              loadTemplates(page, pageSize);
            },
          }}
        />
      </Card>

      {/* 模板配置表单 */}
      {showTemplateForm && (
        <TemplateConfigForm
          template={editingTemplate}
          onClose={handleCloseForm}
          onSuccess={handleSaveSuccess}
        />
      )}

      {/* 复制模板对话框 */}
      <Modal
        title="复制模板"
        open={showCopyModal}
        onOk={handleConfirmCopy}
        onCancel={handleCancelCopy}
        okText="确认"
        cancelText="取消"
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="新模板名称" required>
            <Input
              value={copyTemplateName}
              onChange={(e) => setCopyTemplateName(e.target.value)}
              placeholder="请输入新模板名称"
              autoFocus
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

// 模板配置表单组件
function TemplateConfigForm({
  template,
  onClose,
  onSuccess,
}: {
  template: StageTemplate | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form] = Form.useForm();
  const [stages, setStages] = useState<Array<{
    id: string;
    name: string;
    order: number;
    requiredFiles: string[];
  }>>([]);

  const [standardFiles, setStandardFiles] = useState<Array<{ label: string; value: string }>>([]);
  const [projectPhases, setProjectPhases] = useState<Array<{ label: string; value: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 当 template 的 ID 变化时，重新初始化 stages
  useEffect(() => {
    if (template?.stages) {
      setStages(template.stages.map((s, index) => ({
        id: s.id?.toString() || `new-${Date.now()}-${index}`,
        name: s.stageId,
        order: s.stageOrder,
        requiredFiles: s.requiredFileList || [],
      })));
    } else {
      setStages([{ id: '1', name: '', order: 1, requiredFiles: [] }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.templateId]);

  // 从数据字典加载配置数据
  useEffect(() => {
    const fetchDictData = async () => {
      setLoading(true);
      try {
        // 并行加载标准文件配置和项目阶段数据
        const [fileOptions, phaseOptions] = await Promise.all([
          getDictSelectOption('bams_file_conf'),
          getDictSelectOption('bams_project_phase')
        ]);
        setStandardFiles(fileOptions);
        setProjectPhases(phaseOptions);
      } catch (error) {
        console.error('加载字典数据失败:', error);
        message.error('加载字典数据失败');
      } finally {
        setLoading(false);
      }
    };
    fetchDictData();
  }, []);

  const addStage = () => {
    const newStage = {
      id: Date.now().toString(),
      name: '', // 默认为空，需要用户从下拉框选择
      order: stages.length + 1,
      requiredFiles: []
    };
    setStages([...stages, newStage]);
  };

  const removeStage = (stageId: string) => {
    setStages(stages.filter(stage => stage.id !== stageId).map((stage, index) => ({
      ...stage,
      order: index + 1
    })));
  };

  const updateStage = (stageId: string, field: string, value: any) => {
    setStages(prevStages => prevStages.map(stage =>
      stage.id === stageId ? { ...stage, [field]: value } : stage
    ));
  };

  const moveStage = (stageId: string, direction: 'up' | 'down') => {
    const currentIndex = stages.findIndex(stage => stage.id === stageId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === stages.length - 1)
    ) return;

    const newStages = [...stages];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newStages[currentIndex], newStages[targetIndex]] = [newStages[targetIndex], newStages[currentIndex]];

    // 更新order
    newStages.forEach((stage, index) => {
      stage.order = index + 1;
    });

    setStages(newStages);
  };

  // 检查阶段名称是否重复
  const isDuplicateStageName = (stageId: string, stageName: string) => {
    if (!stageName) return false;
    return stages.some(stage => stage.id !== stageId && stage.name === stageName);
  };

  const handleSubmit = async () => {
    try {
      // 先验证基础表单
      const values = await form.validateFields();

      // 验证阶段配置
      if (stages.length === 0) {
        message.error('请至少添加一个阶段');
        return;
      }

      // 验证每个阶段的名称和文件
      const stageNames = new Set<string>();
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];

        // 验证阶段名称
        if (!stage.name || stage.name.trim() === '') {
          message.error(`阶段 ${stage.order} 必须选择阶段名称`);
          return;
        }

        // 验证阶段名称不重复
        if (stageNames.has(stage.name)) {
          message.error('阶段名称重复');
          return;
        }
        stageNames.add(stage.name);

        // 验证标准文件
        if (!stage.requiredFiles || stage.requiredFiles.length === 0) {
          const stageLabel = projectPhases.find(p => p.value === stage.name)?.label || stage.name;
          message.error(`${stageLabel} 至少选择一个标准文件`);
          return;
        }
      }

      // 构建提交数据
      const submitData = {
        templateId: template?.templateId,
        templateName: values.name,
        templateDesc: values.desc,
        remark: values.desc,
        stages: stages.map(stage => ({
          stageId: stage.name,
          stageDisplayName: projectPhases.find(p => p.value === stage.name)?.label || stage.name,
          stageOrder: stage.order,
          requiredFileList: stage.requiredFiles
        }))
      };

      setSubmitting(true);

      try {
        let response;
        if (template?.templateId) {
          // 修改
          response = await updateTemplate(submitData);
        } else {
          // 新增
          response = await addTemplate(submitData);
        }

        if (response.code === 200) {
          message.success(template ? '模板修改成功' : '模板创建成功');
          onSuccess();
        } else {
          message.error(response.msg || '操作失败');
        }
      } catch (error) {
        console.error('保存失败:', error);
        message.error('保存失败');
      } finally {
        setSubmitting(false);
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title={template ? '编辑模板' : '新增模板'}
      open={true}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={submitting}>
          保存模板
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: template?.templateName || '',
          desc: template?.templateDesc || '',
        }}
      >
        {/* 基础信息 */}
        <Card title="基础信息" style={{ marginBottom: 16 }}>
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" autoComplete="off" />
          </Form.Item>

          <Form.Item
            name="desc"
            label="模板描述"
          >
            <TextArea
              rows={2}
              placeholder="请输入模板描述"
            />
          </Form.Item>
        </Card>

        {/* 阶段配置 */}
        <Card
          title="阶段配置"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addStage}
            >
              添加阶段
            </Button>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {stages.map((stage, index) => (
              <Card
                key={stage.id}
                size="small"
                style={{ backgroundColor: '#fafafa' }}
                title={
                  <Space>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      backgroundColor: '#e6f7ff',
                      color: '#1890ff',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500
                    }}>
                      阶段 {stage.order}
                    </span>
                    <div>
                      <Select
                        value={stage.name}
                        onChange={(value) => updateStage(stage.id, 'name', value)}
                        placeholder="请选择阶段名称"
                        style={{ width: 200 }}
                        options={projectPhases}
                        loading={loading}
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        status={isDuplicateStageName(stage.id, stage.name) ? 'error' : undefined}
                      />
                      {isDuplicateStageName(stage.id, stage.name) && (
                        <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>
                          阶段名称重复
                        </div>
                      )}
                    </div>
                    <Space>
                      <Tooltip title="上移">
                        <Button
                          type="text"
                          icon={<ArrowUpOutlined />}
                          onClick={() => moveStage(stage.id, 'up')}
                          disabled={index === 0}
                        />
                      </Tooltip>
                      <Tooltip title="下移">
                        <Button
                          type="text"
                          icon={<ArrowDownOutlined />}
                          onClick={() => moveStage(stage.id, 'down')}
                          disabled={index === stages.length - 1}
                        />
                      </Tooltip>
                      <Tooltip title="删除">
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeStage(stage.id)}
                        />
                      </Tooltip>
                    </Space>
                  </Space>
                }
              >
                <div>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>
                    标准文件配置
                    {loading && <span style={{ marginLeft: 8, fontSize: 12, color: '#999' }}>加载中...</span>}
                  </div>
                  <div style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: 6,
                    padding: 12,
                    maxHeight: 160,
                    overflowY: 'auto',
                    backgroundColor: '#fff'
                  }}>
                    {standardFiles.length > 0 ? (
                      <Checkbox.Group
                        value={stage.requiredFiles}
                        onChange={(checkedValues) => updateStage(stage.id, 'requiredFiles', checkedValues)}
                        style={{ width: '100%' }}
                      >
                        <Space direction="vertical" style={{ width: '100%' }} size={[8, 8]}>
                          {standardFiles.map(file => (
                            <Checkbox key={file.value} value={file.value}>
                              {file.label}
                            </Checkbox>
                          ))}
                        </Space>
                      </Checkbox.Group>
                    ) : (
                      <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                        {loading ? '正在加载标准文件配置...' : '暂无标准文件配置'}
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>
                    已选择文件: {stage.requiredFiles.length} 个
                  </div>
                </div>
              </Card>
            ))}
          </Space>
        </Card>
      </Form>
    </Modal>
  );
}
