import { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import {
  Card,
  Input,
  Button,
  Table,
  Space,
  Tag,
  Row,
  Col,
  Select,
  DatePicker,
  Checkbox,
  Divider,
  message,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import ArchiveDetail from './components/ArchiveDetail';

const { RangePicker } = DatePicker;
const { Option } = Select;

// Mock数据
const mockArchives = [
  {
    id: 1,
    archiveNumber: 'PRJ001-立项-001',
    title: '中山路公交站台建设项目立项申请书',
    projectName: '中山路公交站台建设项目',
    projectCode: 'PRJ001',
    stage: '立项',
    version: 'V2.0',
    retentionPeriod: '30年',
    uploadDate: '2024-01-15',
    uploader: '张三',
    description: '中山路公交站台建设项目的立项申请文件，包含项目背景、建设必要性分析、投资估算等内容。',
    content: '项目立项申请书内容，包含项目背景分析、建设必要性、技术方案、投资估算等详细信息...',
    isDeleted: false,
    status: '已归档',
  },
  {
    id: 2,
    archiveNumber: 'PRJ001-设计-001',
    title: '中山路公交站台施工图纸',
    projectName: '中山路公交站台建设项目',
    projectCode: 'PRJ001',
    stage: '设计',
    version: 'V3.0',
    retentionPeriod: '永久',
    uploadDate: '2024-01-20',
    uploader: '李四',
    description: '中山路公交站台的详细施工图纸，包含结构设计、材料规格、施工工艺等技术文档。',
    content: '施工图纸详细内容，包含站台结构设计、钢结构连接方式、防腐处理工艺等技术规范...',
    isDeleted: false,
    status: '已归档',
  },
  {
    id: 3,
    archiveNumber: 'PRJ002-立项-001',
    title: '解放路公交站台项目可行性研究报告',
    projectName: '解放路公交站台建设项目',
    projectCode: 'PRJ002',
    stage: '立项',
    version: 'V1.0',
    retentionPeriod: '30年',
    uploadDate: '2024-01-18',
    uploader: '王五',
    description: '解放路公交站台建设项目的可行性研究报告，分析项目的技术可行性、经济合理性等。',
    content: '可行性研究报告内容，包含市场分析、技术方案比较、经济效益分析、风险评估等...',
    isDeleted: false,
    status: '已归档',
  },
  {
    id: 10,
    archiveNumber: 'PRJ001-施工-002',
    title: '中山路公交站台材料采购清单',
    projectName: '中山路公交站台建设项目',
    projectCode: 'PRJ001',
    stage: '施工',
    version: 'V2.0',
    retentionPeriod: '10年',
    uploadDate: '2024-02-05',
    uploader: '孙十二',
    description: '中山路公交站台建设项目的材料采购清单，详细记录各类建材的规格、数量、价格等信息。',
    content: '材料采购清单详细内容，包含钢材、混凝土、装饰材料等各类物资的规格型号、采购数量、单价等...',
    isDeleted: true,
    status: '已归档',
  },
];

const ArchiveSearch: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState<any>(null);
  const [filters, setFilters] = useState({
    projectCode: undefined,
    stage: undefined,
    dateRange: null,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已归档':
        return 'success';
      case '处理中':
        return 'processing';
      case '待审核':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStageColor = (stage: string) => {
    const colorMap: Record<string, string> = {
      立项: 'blue',
      设计: 'cyan',
      施工: 'orange',
      验收: 'green',
    };
    return colorMap[stage] || 'default';
  };

  const filteredArchives = mockArchives.filter((archive) => {
    if (showDeleted && !archive.isDeleted) return false;
    if (!showDeleted && archive.isDeleted) return false;

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      return (
        archive.title.toLowerCase().includes(keyword) ||
        archive.archiveNumber.toLowerCase().includes(keyword) ||
        archive.content?.toLowerCase().includes(keyword)
      );
    }
    return true;
  });

  const handleViewDetail = (record: any) => {
    setSelectedArchive(record);
  };

  const handleBackToList = () => {
    setSelectedArchive(null);
  };

  const handleDelete = (record: any) => {
    message.success('档案已删除');
  };

  const handleRestore = (record: any) => {
    message.success('档案已恢复');
  };

  const handleDownload = (record: any) => {
    message.success(`正在下载：${record.title}`);
  };

  const columns: ColumnsType<any> = [
    {
      title: '档号',
      dataIndex: 'archiveNumber',
      key: 'archiveNumber',
      width: 180,
      fixed: 'left',
    },
    {
      title: '档案题名',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)} style={{ color: '#1890ff' }}>
          {text}
        </a>
      ),
    },
    {
      title: '所属项目',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '建设阶段',
      dataIndex: 'stage',
      key: 'stage',
      width: 100,
      render: (stage) => <Tag color={getStageColor(stage)}>{stage}</Tag>,
    },
    {
      title: '文件版本',
      dataIndex: 'version',
      key: 'version',
      width: 100,
    },
    {
      title: '上传日期',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {!record.isDeleted ? (
            <>
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
              >
                详情
              </Button>
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(record)}
              >
                下载
              </Button>
              <Button type="link" size="small" icon={<EditOutlined />}>
                编辑
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              >
                删除
              </Button>
            </>
          ) : (
            <>
              <Button
                type="link"
                size="small"
                icon={<UndoOutlined />}
                onClick={() => handleRestore(record)}
              >
                恢复
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              >
                彻底删除
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  // 如果选中了档案，显示详情页面
  if (selectedArchive) {
    return <ArchiveDetail archive={selectedArchive} onBack={handleBackToList} />;
  }

  return (
    <PageContainer
      header={{
        title: '档案检索查询',
        breadcrumb: {},
      }}
    >
      <Card>
        {/* 搜索和筛选区域 */}
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          {/* 全文搜索框 */}
          <Input
            placeholder="输入关键词搜索档案内容、题名或档号..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            size="large"
            allowClear
          />

          {/* 高级筛选和回收站切换 */}
          <Row justify="space-between">
            <Col>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              >
                高级筛选 {showAdvancedFilter ? '▲' : '▼'}
              </Button>
            </Col>
            <Col>
              <Checkbox
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
              >
                显示已删除档案
              </Checkbox>
            </Col>
          </Row>

          {/* 高级筛选面板 */}
          {showAdvancedFilter && (
            <Card size="small" style={{ backgroundColor: '#fafafa' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <div>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>项目编号</div>
                    <Select
                      placeholder="全部项目"
                      style={{ width: '100%' }}
                      value={filters.projectCode}
                      onChange={(value) => setFilters({ ...filters, projectCode: value })}
                      allowClear
                    >
                      <Option value="PRJ001">PRJ001 - 中山路公交站台</Option>
                      <Option value="PRJ002">PRJ002 - 解放路公交站台</Option>
                      <Option value="PRJ003">PRJ003 - 人民路公交站台</Option>
                    </Select>
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>建设阶段</div>
                    <Select
                      placeholder="全部阶段"
                      style={{ width: '100%' }}
                      value={filters.stage}
                      onChange={(value) => setFilters({ ...filters, stage: value })}
                      allowClear
                    >
                      <Option value="立项">立项</Option>
                      <Option value="设计">设计</Option>
                      <Option value="施工">施工</Option>
                      <Option value="验收">验收</Option>
                    </Select>
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>文件日期范围</div>
                    <RangePicker
                      style={{ width: '100%' }}
                      value={filters.dateRange}
                      onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          )}

          <Divider style={{ margin: '12px 0' }} />

          {/* 搜索结果统计和操作 */}
          <Row justify="space-between">
            <Col>
              <span>
                共找到 <span style={{ color: '#1890ff', fontWeight: 500 }}>{filteredArchives.length}</span> 条档案记录
              </span>
            </Col>
            <Col>
              <Button icon={<DownloadOutlined />}>批量导出</Button>
            </Col>
          </Row>

          {/* 档案列表 */}
          <Table
            columns={columns}
            dataSource={filteredArchives}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              defaultPageSize: 10,
            }}
            rowClassName={(record) => (record.isDeleted ? 'row-deleted' : '')}
          />
        </Space>
      </Card>

      <style>{`
        .row-deleted {
          background-color: #fff1f0;
        }
      `}</style>
    </PageContainer>
  );
};

export default ArchiveSearch;
