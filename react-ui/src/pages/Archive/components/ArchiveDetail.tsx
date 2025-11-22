import { useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import {
  Card,
  Button,
  Space,
  Tabs,
  Descriptions,
  Tag,
  Input,
  Select,
  Form,
  Modal,
  Upload,
  Timeline,
  Row,
  Col,
  Divider,
  message,
  Spin,
  DatePicker,
} from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  UploadOutlined,
  FullscreenOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  FilePdfOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  getArchiveDetail,
  updateArchive,
  uploadVersion,
  downloadVersion,
  previewVersion,
  setCurrentVersion,
  getAuditLogsByArchiveId,
  type ArchiveType,
  type ArchiveVersionType,
  type AuditLogType,
} from '@/services/bams/archive';
import { getDictSelectOption } from '@/services/system/dict';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface ArchiveDetailProps {
  archive: any;
  onBack: () => void;
}

const ArchiveDetail: React.FC<ArchiveDetailProps> = ({ archive: initialArchive, onBack }) => {
  const [activeTab, setActiveTab] = useState('metadata');
  const [isEditing, setIsEditing] = useState(false);
  const [showVersionUpload, setShowVersionUpload] = useState(false);
  const [form] = Form.useForm();
  const [versionForm] = Form.useForm();
  const [archive, setArchive] = useState<ArchiveType>(initialArchive);
  const [versionHistory, setVersionHistory] = useState<ArchiveVersionType[]>([]);
  const [operationLogs, setOperationLogs] = useState<AuditLogType[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // 字典数据
  const [fileStandardOptions, setFileStandardOptions] = useState<any[]>([]);
  const [archiveCategoryOptions, setArchiveCategoryOptions] = useState<any[]>([]);

  // 加载详细数据和字典数据
  useEffect(() => {
    if (initialArchive?.archiveId) {
      loadArchiveDetail();
      loadAuditLogs();
    }
    loadDictionaries();
  }, [initialArchive?.archiveId]);

  const loadDictionaries = async () => {
    try {
      // 加载文件标准字典
      const fileStandardResp = await getDictSelectOption('bams_file_conf');
      setFileStandardOptions(fileStandardResp || []);

      // 加载档案分类字典
      const archiveCategoryResp = await getDictSelectOption('bams_archives_classification');
      setArchiveCategoryOptions(archiveCategoryResp || []);
    } catch (error) {
      console.error('加载字典数据失败:', error);
    }
  };

  const loadArchiveDetail = async () => {
    try {
      setLoading(true);
      const response = await getArchiveDetail(initialArchive.archiveId!);
      if (response.code === 200 && response.data) {
        setArchive(response.data);
        setVersionHistory(response.data.versions || []);
      }
    } catch (error) {
      console.error('加载档案详情失败:', error);
      message.error('加载档案详情失败');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const response = await getAuditLogsByArchiveId(initialArchive.archiveId!);
      if (response.code === 200 && response.data) {
        setOperationLogs(response.data);
      }
    } catch (error) {
      console.error('加载操作日志失败:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const updateData: ArchiveType = {
        ...archive,
        title: values.title,
        fileDate: values.fileDate ? values.fileDate.format('YYYY-MM-DD') : undefined,
        fileStandard: values.fileStandard,
        archiveCategory: values.archiveCategory,
        hasPaperMaterial: values.hasPaperMaterial,
        tags: values.tags ? JSON.stringify(values.tags) : undefined,
        summary: values.summary,
        description: values.description,
      };

      const response = await updateArchive(updateData);
      if (response.code === 200) {
        message.success('档案信息修改成功！');
        setIsEditing(false);
        loadArchiveDetail(); // 重新加载数据
      } else {
        message.error(response.msg || '修改失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleVersionUpload = async () => {
    try {
      const values = await versionForm.validateFields();
      if (!uploadFile) {
        message.error('请选择要上传的文件');
        return;
      }

      setLoading(true);

      const response = await uploadVersion(
        archive.archiveId!,
        uploadFile,
        values.versionRemark
      );

      if (response.code === 200) {
        message.success('新版本上传成功！');
        setShowVersionUpload(false);
        versionForm.resetFields();
        setUploadFile(null);
        loadArchiveDetail(); // 重新加载数据
      } else {
        message.error(response.msg || '上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      message.error('上传失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadVersion = async (versionId: number, fileName?: string) => {
    try {
      await downloadVersion(versionId, fileName);
      message.success('正在下载文件');
    } catch (error) {
      message.error('下载失败');
      console.error(error);
    }
  };

  const handlePreviewVersion = async (versionId: number) => {
    try {
      await previewVersion(versionId);
    } catch (error) {
      message.error('预览失败');
      console.error(error);
    }
  };

  const handleSetCurrentVersion = async (versionId: number) => {
    try {
      setLoading(true);
      const response = await setCurrentVersion(archive.archiveId!, versionId);
      if (response.code === 200) {
        message.success('已切换到当前版本');
        loadArchiveDetail();
      } else {
        message.error(response.msg || '切换失败');
      }
    } catch (error) {
      console.error('切换版本失败:', error);
      message.error('切换版本失败');
    } finally {
      setLoading(false);
    }
  };

  const metadataContent = (
    <div style={{ padding: '0 16px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <h4 style={{ fontSize: 16, fontWeight: 600 }}>档案元数据</h4>
        {!isEditing ? (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setIsEditing(true);
              form.setFieldsValue({
                title: archive.title,
                fileDate: archive.fileDate ? dayjs(archive.fileDate) : null,
                fileStandard: archive.fileStandard,
                archiveCategory: archive.archiveCategory,
                hasPaperMaterial: archive.hasPaperMaterial,
                tags: archive.tagList || [],
                summary: archive.summary || '',
                description: archive.description || '',
              });
            }}
          >
            编辑
          </Button>
        ) : (
          <Space>
            <Button icon={<CheckOutlined />} type="primary" onClick={handleSaveEdit}>
              保存
            </Button>
            <Button icon={<CloseOutlined />} onClick={() => setIsEditing(false)}>
              取消
            </Button>
          </Space>
        )}
      </div>

      {!isEditing ? (
        <Descriptions column={1} bordered labelStyle={{ width: '120px', fontWeight: 500 }}>
          <Descriptions.Item label="档号">
            <code style={{ backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: 4 }}>
              {archive.archiveNumber}
            </code>
          </Descriptions.Item>
          <Descriptions.Item label="题名">{archive.title}</Descriptions.Item>
          <Descriptions.Item label="项目">{archive.projectName}</Descriptions.Item>
          <Descriptions.Item label="阶段">
            <Tag color="blue">{archive.stage}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="文件标准">
            {(() => {
              const option = fileStandardOptions.find(opt => opt.value === archive.fileStandard);
              return option ? option.label : archive.fileStandard || '-';
            })()}
          </Descriptions.Item>
          <Descriptions.Item label="档案分类">
            {(() => {
              const option = archiveCategoryOptions.find(opt => opt.value === archive.archiveCategory);
              return option ? option.label : archive.archiveCategory || '-';
            })()}
          </Descriptions.Item>
          <Descriptions.Item label="纸质材料">
            {archive.hasPaperMaterial === '1' ? (
              <Tag color="green">有</Tag>
            ) : archive.hasPaperMaterial === '0' ? (
              <Tag color="default">无</Tag>
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="文件日期">
            {archive.fileDate ? dayjs(archive.fileDate).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="归档日期">
            {archive.archivalDate ? dayjs(archive.archivalDate).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="当前版本">
            <Tag color="green">{archive.currentVersion || 'V1.0'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {archive.createTime ? dayjs(archive.createTime).format('YYYY-MM-DD HH:mm') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="标签">
            {archive.tagList && archive.tagList.length > 0 ? (
              <Space wrap>
                {archive.tagList.map((tag, index) => (
                  <Tag key={index} color="blue">{tag}</Tag>
                ))}
              </Space>
            ) : (
              <span style={{ color: '#999', fontStyle: 'italic' }}>暂无标签</span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="摘要">
            {archive.summary || <span style={{ color: '#999', fontStyle: 'italic' }}>暂无摘要</span>}
          </Descriptions.Item>
          <Descriptions.Item label="描述">
            {archive.description || <span style={{ color: '#999', fontStyle: 'italic' }}>暂无描述</span>}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="档案题名" rules={[{ required: true }]}>
            <Input placeholder="请输入档案题名" />
          </Form.Item>
          <Form.Item name="fileDate" label="文件日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择文件日期" />
          </Form.Item>
          <Form.Item name="fileStandard" label="文件标准">
            <Select placeholder="请选择文件标准" allowClear>
              {fileStandardOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="archiveCategory" label="档案分类">
            <Select placeholder="请选择档案分类" allowClear>
              {archiveCategoryOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="hasPaperMaterial" label="是否有纸质材料">
            <Select placeholder="请选择">
              <Option value="0">无</Option>
              <Option value="1">有</Option>
            </Select>
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select
              mode="tags"
              placeholder="请输入标签，按回车添加"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            />
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <TextArea rows={3} placeholder="请输入档案摘要" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={4} placeholder="请输入档案描述" />
          </Form.Item>
        </Form>
      )}
    </div>
  );

  const versionsContent = (
    <div style={{ padding: '0 16px' }}>
      <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>版本历史</h4>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      ) : versionHistory.length > 0 ? (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {versionHistory.map((version) => (
            <Card
              key={version.versionId}
              size="small"
              style={{
                backgroundColor: version.isCurrent === '1' ? '#f0f5ff' : '#fafafa',
                borderColor: version.isCurrent === '1' ? '#1890ff' : '#d9d9d9',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Space>
                  <span style={{ fontWeight: 600, color: version.isCurrent === '1' ? '#1890ff' : '#000' }}>
                    {version.versionNumber}
                  </span>
                  {version.isCurrent === '1' && <Tag color="blue">当前版本</Tag>}
                </Space>
                <Space>
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handlePreviewVersion(version.versionId!)}
                  >
                    预览
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownloadVersion(version.versionId!, version.fileName)}
                  >
                    下载
                  </Button>
                  {version.isCurrent !== '1' && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleSetCurrentVersion(version.versionId!)}
                    >
                      设为当前
                    </Button>
                  )}
                </Space>
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                <div>
                  {version.uploadTime ? dayjs(version.uploadTime).format('YYYY-MM-DD HH:mm') : '-'} · {version.uploadBy || '未知'}
                </div>
                {version.versionRemark && <div style={{ marginTop: 4 }}>{version.versionRemark}</div>}
              </div>
            </Card>
          ))}
        </Space>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          暂无版本历史
        </div>
      )}
    </div>
  );

  const logsContent = (
    <div style={{ padding: '0 16px' }}>
      <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>操作日志</h4>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      ) : operationLogs.length > 0 ? (
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          <Timeline
            items={operationLogs.map((log) => ({
              children: (
                <div>
                  <div style={{ fontSize: 14, color: '#000' }}>
                    <strong>{log.operator || '系统'}</strong> {log.operationType}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    {log.operationDesc || log.changeDetail}
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                    {log.operationTime ? dayjs(log.operationTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                  </div>
                </div>
              ),
            }))}
          />
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          暂无操作日志
        </div>
      )}
    </div>
  );

  const tabItems = [
    {
      key: 'metadata',
      label: '元数据',
      children: metadataContent,
    },
    {
      key: 'versions',
      label: '版本历史',
      children: versionsContent,
    },
    {
      key: 'logs',
      label: '操作日志',
      children: logsContent,
    },
  ];

  return (
    <PageContainer
      header={{
        title: archive.title,
        subTitle: `档号：${archive.archiveNumber}`,
        onBack: onBack,
        breadcrumb: {},
      }}
    >
      <Row gutter={24}>
        {/* 左侧：文件预览区 */}
        <Col span={16}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* 预览操作栏 */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <span style={{ fontWeight: 600 }}>文件预览</span>
                  <span style={{ color: '#999' }}>当前版本：{archive.currentVersion || 'V1.0'}</span>
                </Space>
                <Space>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      const currentVersion = versionHistory.find(v => v.isCurrent === '1');
                      if (currentVersion) {
                        handleDownloadVersion(currentVersion.versionId!, currentVersion.fileName);
                      } else {
                        message.warning('未找到当前版本');
                      }
                    }}
                  >
                    下载
                  </Button>
                  <Button
                    icon={<UploadOutlined />}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: '#fff' }}
                    onClick={() => setShowVersionUpload(true)}
                  >
                    上传新版本
                  </Button>
                  <Button
                    icon={<FullscreenOutlined />}
                    onClick={() => {
                      const currentVersion = versionHistory.find(v => v.isCurrent === '1');
                      if (currentVersion) {
                        handlePreviewVersion(currentVersion.versionId!);
                      } else {
                        message.warning('未找到当前版本');
                      }
                    }}
                  >
                    全屏预览
                  </Button>
                </Space>
              </div>
            </Card>

            {/* 文件预览窗口 */}
            <Card>
              <div
                style={{
                  height: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fafafa',
                  borderRadius: 4,
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <FilePdfOutlined style={{ fontSize: 64, color: '#ff4d4f', marginBottom: 16 }} />
                  <p style={{ fontSize: 16, marginBottom: 8 }}>PDF 文档预览</p>
                  <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>{archive.title}</p>
                  <Button type="primary" size="large">
                    点击预览文档
                  </Button>
                </div>
              </div>
            </Card>
          </Space>
        </Col>

        {/* 右侧：详情信息区 */}
        <Col span={8}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
          </Card>
        </Col>
      </Row>

      {/* 新版本上传弹窗 */}
      <Modal
        title="上传新版本"
        open={showVersionUpload}
        onOk={handleVersionUpload}
        onCancel={() => {
          setShowVersionUpload(false);
          versionForm.resetFields();
          setUploadFile(null);
        }}
        okText="上传"
        cancelText="取消"
        confirmLoading={loading}
      >
        <Form form={versionForm} layout="vertical">
          <Form.Item label="选择文件" required>
            <Upload
              beforeUpload={(file) => {
                setUploadFile(file);
                return false;
              }}
              onRemove={() => setUploadFile(null)}
              maxCount={1}
              fileList={uploadFile ? [uploadFile as any] : []}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="versionRemark"
            label="版本备注"
            rules={[{ required: true, message: '请输入版本更新说明' }]}
          >
            <TextArea rows={3} placeholder="请输入版本更新说明" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ArchiveDetail;
