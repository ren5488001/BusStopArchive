import { useState } from 'react';
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

const { TextArea } = Input;
const { Option } = Select;

interface ArchiveDetailProps {
  archive: any;
  onBack: () => void;
}

const ArchiveDetail: React.FC<ArchiveDetailProps> = ({ archive, onBack }) => {
  const [activeTab, setActiveTab] = useState('metadata');
  const [isEditing, setIsEditing] = useState(false);
  const [showVersionUpload, setShowVersionUpload] = useState(false);
  const [form] = Form.useForm();

  const versionHistory = [
    {
      version: 'V3.0',
      uploadDate: '2024-01-15 14:30',
      uploader: '张三',
      remark: '更新施工图纸，修正尺寸标注',
      isCurrent: true,
    },
    {
      version: 'V2.0',
      uploadDate: '2024-01-10 09:15',
      uploader: '李四',
      remark: '增加材料规格说明',
      isCurrent: false,
    },
    {
      version: 'V1.0',
      uploadDate: '2024-01-05 16:45',
      uploader: '王五',
      remark: '初始版本',
      isCurrent: false,
    },
  ];

  const operationLogs = [
    {
      time: '2024-01-15 14:35',
      user: '张三',
      action: '上传新版本',
      detail: '上传了 V3.0 版本',
    },
    {
      time: '2024-01-15 10:20',
      user: '赵六',
      action: '下载文件',
      detail: '下载了 V2.0 版本',
    },
    {
      time: '2024-01-14 16:30',
      user: '李四',
      action: '修改元数据',
      detail: '修改了档案题名：从"施工图纸"改为"公交站台施工图纸"',
    },
    {
      time: '2024-01-14 14:15',
      user: '王五',
      action: '查看详情',
      detail: '查看了档案详情',
    },
    {
      time: '2024-01-10 09:20',
      user: '李四',
      action: '上传新版本',
      detail: '上传了 V2.0 版本',
    },
  ];

  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存修改:', values);
      setIsEditing(false);
      message.success('档案信息修改成功！');
    } catch (error) {
      console.log('验证失败:', error);
    }
  };

  const handleVersionUpload = () => {
    setShowVersionUpload(false);
    message.success('新版本上传成功！');
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
                retentionPeriod: archive.retentionPeriod || '30年',
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
        <Descriptions column={1} bordered>
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
          <Descriptions.Item label="保管期限">
            <Tag color="orange">{archive.retentionPeriod || '30年'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="上传日期">{archive.uploadDate}</Descriptions.Item>
          <Descriptions.Item label="描述">
            {archive.description || <span style={{ color: '#999', fontStyle: 'italic' }}>暂无描述</span>}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="档案题名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="retentionPeriod" label="保管期限">
            <Select>
              <Option value="10年">10年</Option>
              <Option value="30年">30年</Option>
              <Option value="永久">永久</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="档案描述">
            <TextArea rows={4} placeholder="请输入档案描述" />
          </Form.Item>
        </Form>
      )}
    </div>
  );

  const versionsContent = (
    <div style={{ padding: '0 16px' }}>
      <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>版本历史</h4>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {versionHistory.map((version, index) => (
          <Card
            key={index}
            size="small"
            style={{
              backgroundColor: version.isCurrent ? '#f0f5ff' : '#fafafa',
              borderColor: version.isCurrent ? '#1890ff' : '#d9d9d9',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Space>
                <span style={{ fontWeight: 600, color: version.isCurrent ? '#1890ff' : '#000' }}>
                  {version.version}
                </span>
                {version.isCurrent && <Tag color="blue">当前版本</Tag>}
              </Space>
              <Space>
                <Button type="link" size="small" icon={<EyeOutlined />}>
                  预览
                </Button>
                <Button type="link" size="small" icon={<DownloadOutlined />}>
                  下载
                </Button>
              </Space>
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              <div>
                {version.uploadDate} · {version.uploader}
              </div>
              <div style={{ marginTop: 4 }}>{version.remark}</div>
            </div>
          </Card>
        ))}
      </Space>
    </div>
  );

  const logsContent = (
    <div style={{ padding: '0 16px' }}>
      <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>操作日志</h4>
      <div style={{ maxHeight: 500, overflowY: 'auto' }}>
        <Timeline
          items={operationLogs.map((log) => ({
            children: (
              <div>
                <div style={{ fontSize: 14, color: '#000' }}>
                  <strong>{log.user}</strong> {log.action}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{log.detail}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{log.time}</div>
              </div>
            ),
          }))}
        />
      </div>
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
                  <span style={{ color: '#999' }}>当前版本：{archive.version}</span>
                </Space>
                <Space>
                  <Button type="primary" icon={<DownloadOutlined />}>
                    下载
                  </Button>
                  <Button
                    icon={<UploadOutlined />}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: '#fff' }}
                    onClick={() => setShowVersionUpload(true)}
                  >
                    上传新版本
                  </Button>
                  <Button icon={<FullscreenOutlined />}>全屏预览</Button>
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
        onCancel={() => setShowVersionUpload(false)}
        okText="上传"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item label="选择文件" required>
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="版本备注" required>
            <TextArea rows={3} placeholder="请输入版本更新说明" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ArchiveDetail;
