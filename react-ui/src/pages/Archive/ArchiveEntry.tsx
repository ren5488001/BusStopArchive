import { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import {
  Card,
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
  Spin,
  Radio,
} from 'antd';
import {
  InboxOutlined,
  PlusOutlined,
  CloseOutlined,
  CheckOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import {
  addArchive,
  uploadVersion,
  uploadTempFile,
  getEnabledTags,
  type ArchiveType,
  type TagDictionaryType,
} from '@/services/bams/archive';
import {
  getProjectList,
  getProjectStages,
  type ProjectType,
  type ProjectStageType,
} from '@/services/bams/project';
import { getDictDataList } from '@/services/system/dictdata';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const ArchiveEntry: React.FC = () => {
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
  const [systemTags, setSystemTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdArchiveId, setCreatedArchiveId] = useState<number | null>(null);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [stages, setStages] = useState<ProjectStageType[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>();
  const [archiveCategories, setArchiveCategories] = useState<any[]>([]);
  const [standardFiles, setStandardFiles] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedStage, setSelectedStage] = useState<ProjectStageType | undefined>();

  // 初始化加载
  useEffect(() => {
    loadEnabledTags();
    loadProjects();
    loadArchiveCategories();
  }, []);

  // 加载项目列表
  const loadProjects = async () => {
    try {
      const response = await getProjectList({ pageNum: 1, pageSize: 100 });
      if (response.code === 200 && response.rows) {
        setProjects(response.rows);
      }
    } catch (error) {
      console.error('加载项目列表失败:', error);
      message.error('加载项目列表失败');
    }
  };

  // 加载项目阶段
  const loadProjectStages = async (projectId: number) => {
    try {
      const response = await getProjectStages(projectId);
      if (response.code === 200 && response.data) {
        setStages(response.data);
      } else {
        setStages([]);
      }
    } catch (error) {
      console.error('加载项目阶段失败:', error);
      setStages([]);
    }
  };

  // 加载启用的标签
  const loadEnabledTags = async () => {
    try {
      const response = await getEnabledTags();
      if (response.code === 200 && response.data) {
        setSystemTags(response.data.map((tag: TagDictionaryType) => tag.tagName));
      }
    } catch (error) {
      console.error('加载标签失败:', error);
      // 失败时使用默认标签
      setSystemTags([
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
      ]);
    }
  };

  // 加载档案分类
  const loadArchiveCategories = async () => {
    try {
      const response = await getDictDataList({
        dictType: 'bams_archives_classification',
        pageNum: 1,
        pageSize: 100,
      });
      if (response.code === 200 && response.rows) {
        setArchiveCategories(response.rows);
      }
    } catch (error) {
      console.error('加载档案分类失败:', error);
      message.error('加载档案分类失败');
    }
  };

  // 处理项目选择变化
  const handleProjectChange = (projectCode: string) => {
    const selectedProject = projects.find(p => p.projectCode === projectCode);
    if (selectedProject?.projectId) {
      setSelectedProjectId(selectedProject.projectId);
      loadProjectStages(selectedProject.projectId);
    } else {
      setSelectedProjectId(undefined);
      setStages([]);
    }
    // 清空阶段选择和标准文件
    form.setFieldValue('stage', undefined);
    form.setFieldValue('fileStandard', undefined);
    setSelectedStage(undefined);
    setStandardFiles([]);
  };

  // 处理阶段选择变化
  const handleStageChange = (stageDisplayName: string) => {
    const selected = stages.find(s => s.stageDisplayName === stageDisplayName);
    setSelectedStage(selected);

    if (selected?.requiredFileList && selected.requiredFileList.length > 0) {
      // 使用后端返回的对象数组
      setStandardFiles(selected.requiredFileList);
    } else {
      setStandardFiles([]);
    }

    // 清空文件标准选择
    form.setFieldValue('fileStandard', undefined);
  };

  // 支持的文件类型配置
  const ACCEPTED_FILE_TYPES = {
    // Word 文档
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    // PDF 文档
    'application/pdf': ['.pdf'],
    // 图片
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    // Excel 表格
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    // CAD 文件
    'application/acad': ['.dwg'],
    'application/x-acad': ['.dwg'],
    'application/autocad_dwg': ['.dwg'],
    'image/vnd.dwg': ['.dwg'],
    'application/dxf': ['.dxf'],
    'image/vnd.dxf': ['.dxf'],
  };

  // 获取所有支持的文件扩展名
  const getAllowedExtensions = () => {
    const extensions = new Set<string>();
    Object.values(ACCEPTED_FILE_TYPES).forEach(exts => {
      exts.forEach(ext => extensions.add(ext));
    });
    return Array.from(extensions);
  };

  // 验证文件类型
  const isFileTypeAccepted = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    // 检查 MIME 类型
    if (ACCEPTED_FILE_TYPES[fileType]) {
      return true;
    }

    // 检查文件扩展名
    const allowedExtensions = getAllowedExtensions();
    return allowedExtensions.some(ext => fileName.endsWith(ext));
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    accept: '.doc,.docx,.pdf,.jpg,.jpeg,.png,.xls,.xlsx,.dwg,.dxf',
    beforeUpload: async (file) => {
      // 验证文件类型
      if (!isFileTypeAccepted(file)) {
        message.error(`文件 ${file.name} 格式不支持。仅支持 Word、PDF、JPG、PNG、Excel、CAD 格式`);
        return Upload.LIST_IGNORE;
      }

      // 验证文件大小（限制为 50MB）
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        message.error(`文件 ${file.name} 超过 50MB 限制`);
        return Upload.LIST_IGNORE;
      }

      const fileId = Date.now() + Math.random();
      const newFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        tempFilePath: '',
        status: 'uploading',
      };

      setUploadedFiles((prev) => [...prev, newFile]);

      // 开始AI处理
      setAiSuggestions((prev) => ({ ...prev, isProcessing: true }));

      try {
        // 上传文件到临时目录
        const uploadResponse = await uploadTempFile(file);

        if (uploadResponse.code === 200 && uploadResponse.data) {
          // 更新文件状态和临时路径
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                  ...f,
                  status: 'completed',
                  tempFilePath: uploadResponse.data!.tempFilePath,
                }
                : f,
            ),
          );

          // 更新AI识别结果
          const ocrResult = uploadResponse.data.ocrResult;
          setAiSuggestions({
            isProcessing: false,
            summary: ocrResult.summary || '本文件为公交站台建设项目的施工图纸，包含站台结构设计、材料规格说明和施工工艺要求。',
            tags: ocrResult.tags && ocrResult.tags.length > 0 ? ocrResult.tags : ['施工图纸', '钢结构', '公交站台', '建设工程', '技术文档'],
          });

          message.success(`文件 ${file.name} 上传成功`);
        } else {
          throw new Error(uploadResponse.msg || '文件上传失败');
        }
      } catch (error) {
        console.error('文件上传失败:', error);
        message.error(`文件 ${file.name} 上传失败`);

        // 移除失败的文件
        setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
        setAiSuggestions((prev) => ({ ...prev, isProcessing: false }));
      }

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

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // 验证表单
      const values = await form.validateFields();

      // 验证文件上传
      if (uploadedFiles.length === 0) {
        message.error('请至少上传一个文件');
        setLoading(false);
        return;
      }

      // 获取选中的项目
      const selectedProject = projects.find(p => p.projectCode === values.projectCode);

      // 合并标签
      const allTags = [...manualTags, ...aiSuggestions.tags];

      // 创建档案记录
      const archiveData: ArchiveType = {
        archiveNumber: values.archiveNumber || undefined, // 档案编号（非必填，由前端输入）
        title: values.title,
        projectId: selectedProject?.projectId, // 项目ID
        projectCode: values.projectCode,
        projectName: selectedProject?.projectName,
        stage: values.stage,
        fileDate: values.fileDate ? values.fileDate.format('YYYY-MM-DD') : undefined,
        fileStandard: values.fileStandard || undefined,
        archiveCategory: values.archiveCategory || undefined,
        hasPaperMaterial: values.hasPaperMaterial || undefined,
        tags: allTags.join(','),
        tagList: allTags,
        summary: aiSuggestions.summary || values.description,
        description: values.description,
        status: '0', // 正常状态
      };

      const addResponse = await addArchive(archiveData);
      if (addResponse.code !== 200) {
        message.error(addResponse.msg || '创建档案失败');
        setLoading(false);
        return;
      }

      // 获取创建的档案ID
      const archiveId = addResponse.data;
      setCreatedArchiveId(archiveId);

      // 上传文件版本
      if (uploadedFiles.length > 0) {
        for (const fileItem of uploadedFiles) {
          try {
            await uploadVersion(
              archiveId,
              fileItem.file,
              `初始版本 - ${fileItem.name}`
            );
          } catch (error) {
            console.error(`上传文件 ${fileItem.name} 失败:`, error);
            message.warning(`文件 ${fileItem.name} 上传失败，但档案已创建`);
          }
        }
      }

      message.success(`档案入库成功！${archiveData.archiveNumber ? '档号：' + archiveData.archiveNumber : ''}`);

      // 重置表单
      form.resetFields();
      setUploadedFiles([]);
      setAiSuggestions({
        summary: '',
        tags: [],
        isProcessing: false,
      });
      setManualTags([]);
      setShowTagSelector(false);
      setNewTagInput('');
      setCreatedArchiveId(null);
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      header={{
        title: '著录与入库',
        breadcrumb: {},
      }}
    >
      <Card title="档案著录与入库">
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={24}>
            {/* 左侧列 */}
            <Col span={12}>
              <Form.Item
                name="projectCode"
                label="选择项目"
                rules={[{ required: true, message: '请选择项目' }]}
              >
                <Select
                  placeholder="请选择项目"
                  size="large"
                  onChange={handleProjectChange}
                  loading={loading}
                >
                  {projects.map((project) => (
                    <Option key={project.projectCode} value={project.projectCode}>
                      {project.projectCode} - {project.projectName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="stage"
                label="建设阶段"
                rules={[{ required: true, message: '请选择建设阶段' }]}
              >
                <Select
                  placeholder={selectedProjectId ? "请选择建设阶段" : "请先选择项目"}
                  size="large"
                  disabled={!selectedProjectId}
                  onChange={handleStageChange}
                >
                  {stages.map((stage) => (
                    <Option key={stage.id} value={stage.stageDisplayName}>
                      {stage.stageDisplayName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="archiveNumber"
                label="档案编号"
              >
                <Input placeholder="请输入档案编号（选填）" size="large" autoComplete="off" />
              </Form.Item>

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

              <Form.Item
                name="fileStandard"
                label="文件标准"
              >
                <Select
                  placeholder={selectedStage ? "请选择文件标准" : "请先选择建设阶段"}
                  size="large"
                  disabled={!selectedStage || standardFiles.length === 0}
                >
                  {standardFiles.map((file) => (
                    <Option key={file.id} value={file.id}>
                      {file.name}
                    </Option>
                  ))}
                  {standardFiles.length === 0 && selectedStage && (
                    <Option value="" disabled>
                      该阶段暂无标准文件
                    </Option>
                  )}
                </Select>
              </Form.Item>

              <Form.Item
                name="archiveCategory"
                label="档案分类"
              >
                <Select placeholder="请选择档案分类" size="large">
                  {archiveCategories.map((category) => (
                    <Option key={category.dictCode} value={category.dictValue}>
                      {category.dictLabel}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="hasPaperMaterial"
                label="是否有纸质材料"
              >
                <Radio.Group size="large">
                  <Radio value="1">是</Radio>
                  <Radio value="0">否</Radio>
                </Radio.Group>
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

              <Form.Item name="description" label="档案描述">
                <TextArea rows={4} placeholder="请输入档案描述" />
              </Form.Item>
            </Col>

            {/* 右侧列 */}
            <Col span={12}>
              {/* 文件上传 */}
              <Form.Item label="文件上传" required>
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">拖拽文件到此处或点击上传</p>
                  <p className="ant-upload-hint">
                    支持 Word (.doc/.docx)、PDF (.pdf)、图片 (.jpg/.png)、Excel (.xls/.xlsx)、CAD (.dwg/.dxf) 格式，单个文件不超过 50MB
                  </p>
                </Dragger>
              </Form.Item>

              {/* AI 智能辅助 */}
              <div style={{ marginTop: 24 }}>
                <div style={{ marginBottom: 16, fontSize: 14, fontWeight: 500 }}>
                  <RobotOutlined /> AI 智能辅助
                </div>
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
              </div>
            </Col>
          </Row>
        </Form>

        <Divider />

        {/* 确认入库按钮 */}
        <Row justify="end">
          <Col>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleSubmit}
              size="large"
              loading={loading}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              确认入库
            </Button>
          </Col>
        </Row>
      </Card>
    </PageContainer>
  );
};

export default ArchiveEntry;
