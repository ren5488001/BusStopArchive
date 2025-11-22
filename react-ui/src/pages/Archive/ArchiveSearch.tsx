import { useState, useRef, useEffect } from 'react';
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
  Modal,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import ArchiveDetail from './components/ArchiveDetail';
import {
  getArchiveList,
  deleteArchive,
  restoreArchive,
  permanentDeleteArchive,
  downloadVersion,
  getArchiveVersions,
  type ArchiveType,
  type ArchiveListParams,
} from '@/services/bams/archive';
import { getProjectList, type ProjectType } from '@/services/bams/project';
import { getDictSelectOption } from '@/services/system/dict';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { confirm } = Modal;

const ArchiveSearch: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [archiveList, setArchiveList] = useState<ArchiveType[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [filters, setFilters] = useState({
    projectId: undefined as number | undefined,
    stage: undefined,
    fileStandard: undefined,
    archiveCategory: undefined,
    dateRange: null as any,
  });

  // 下拉选项数据
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [stageOptions, setStageOptions] = useState<any[]>([]);
  const [fileStandardOptions, setFileStandardOptions] = useState<any[]>([]);
  const [archiveCategoryOptions, setArchiveCategoryOptions] = useState<any[]>([]);

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

  // 加载项目列表
  const loadProjects = async () => {
    try {
      const response = await getProjectList({ pageNum: 1, pageSize: 1000 });
      if (response.code === 200 && response.rows) {
        setProjects(response.rows);
      }
    } catch (error) {
      console.error('加载项目列表失败:', error);
    }
  };

  // 加载字典数据
  const loadDictionaries = async () => {
    try {
      // 加载建设阶段字典
      const stageResp = await getDictSelectOption('bams_project_phase');
      setStageOptions(stageResp || []);

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

  // 首次加载数据
  useEffect(() => {
    loadProjects();
    loadDictionaries();
  }, []);

  // 加载档案列表
  const loadArchiveList = async () => {
    setLoading(true);
    try {
      const params: ArchiveListParams = {
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        title: searchKeyword || undefined,
        projectId: filters.projectId,
        stage: filters.stage,
        fileStandard: filters.fileStandard,
        archiveCategory: filters.archiveCategory,
        delFlag: showDeleted ? '1' : '0',
      };

      if (filters.dateRange && filters.dateRange.length === 2) {
        params.params = {
          beginFileDate: filters.dateRange[0].format('YYYY-MM-DD'),
          endFileDate: filters.dateRange[1].format('YYYY-MM-DD'),
        };
      }

      const response = await getArchiveList(params);
      if (response.code === 200) {
        setArchiveList(response.rows || []);
        setTotal(response.total || 0);
      } else {
        message.error(response.msg || '加载档案列表失败');
      }
    } catch (error) {
      message.error('加载档案列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 首次加载和筛选条件变化时重新加载
  useEffect(() => {
    loadArchiveList();
  }, [pagination.current, pagination.pageSize, showDeleted]);

  const handleViewDetail = (record: ArchiveType) => {
    setSelectedArchive(record);
  };

  const handleBackToList = () => {
    setSelectedArchive(null);
    loadArchiveList(); // 返回时刷新列表
  };

  const handleDelete = (record: ArchiveType) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除档案"${record.title}"吗？删除后可在回收站中恢复。`,
      onOk: async () => {
        try {
          const response = await deleteArchive([record.archiveId!]);
          if (response.code === 200) {
            message.success('档案已移至回收站');
            loadArchiveList();
          } else {
            message.error(response.msg || '删除失败');
          }
        } catch (error) {
          message.error('删除失败');
          console.error(error);
        }
      },
    });
  };

  const handleRestore = (record: ArchiveType) => {
    confirm({
      title: '确认恢复',
      icon: <ExclamationCircleOutlined />,
      content: `确定要恢复档案"${record.title}"吗？`,
      onOk: async () => {
        try {
          const response = await restoreArchive([record.archiveId!]);
          if (response.code === 200) {
            message.success('档案已恢复');
            loadArchiveList();
          } else {
            message.error(response.msg || '恢复失败');
          }
        } catch (error) {
          message.error('恢复失败');
          console.error(error);
        }
      },
    });
  };

  const handlePermanentDelete = (record: ArchiveType) => {
    confirm({
      title: '确认永久删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要永久删除档案"${record.title}"吗？此操作无法恢复！`,
      okText: '确认删除',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await permanentDeleteArchive([record.archiveId!]);
          if (response.code === 200) {
            message.success('档案已永久删除');
            loadArchiveList();
          } else {
            message.error(response.msg || '删除失败');
          }
        } catch (error) {
          message.error('删除失败');
          console.error(error);
        }
      },
    });
  };

  const handleDownload = async (record: ArchiveType) => {
    try {
      // 先获取档案的版本列表
      const versionsResponse = await getArchiveVersions(record.archiveId!);
      if (versionsResponse.code === 200 && versionsResponse.data && versionsResponse.data.length > 0) {
        // 找到当前版本
        const currentVersion = versionsResponse.data.find((v: any) => v.isCurrent === '1');
        if (currentVersion) {
          await downloadVersion(currentVersion.versionId!, currentVersion.fileName);
          message.success(`正在下载：${record.title}`);
        } else {
          message.error('未找到当前版本文件');
        }
      } else {
        message.error('该档案暂无文件');
      }
    } catch (error) {
      message.error('下载失败');
      console.error(error);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    loadArchiveList();
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
      width: 250,
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
      width: 180,
      ellipsis: true,
    },
    {
      title: '建设阶段',
      dataIndex: 'stage',
      key: 'stage',
      width: 100,
      render: (stage) => {
        return stage ? <Tag color={getStageColor(stage)}>{stage}</Tag> : '-';
      },
    },
    {
      title: '文件标准',
      dataIndex: 'fileStandard',
      key: 'fileStandard',
      width: 120,
      render: (text) => {
        const option = fileStandardOptions.find(opt => opt.value === text);
        return option ? option.label : text || '-';
      },
    },
    {
      title: '档案分类',
      dataIndex: 'archiveCategory',
      key: 'archiveCategory',
      width: 120,
      render: (text) => {
        const option = archiveCategoryOptions.find(opt => opt.value === text);
        return option ? option.label : text || '-';
      },
    },
    {
      title: '纸质材料',
      dataIndex: 'hasPaperMaterial',
      key: 'hasPaperMaterial',
      width: 100,
      align: 'center',
      render: (text) => {
        if (text === '1') {
          return <Tag color="green">有</Tag>;
        } else if (text === '0') {
          return <Tag color="default">无</Tag>;
        }
        return '-';
      },
    },
    {
      title: '文件版本',
      dataIndex: 'currentVersion',
      key: 'currentVersion',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.delFlag !== '1' ? (
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
                onClick={() => handlePermanentDelete(record)}
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
            placeholder="输入关键词搜索档案题名或档号..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={handleSearch}
            size="large"
            allowClear
            addonAfter={
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
            }
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
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <div>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>项目名称</div>
                    <Select
                      placeholder="全部项目"
                      style={{ width: '100%' }}
                      value={filters.projectId}
                      onChange={(value) => setFilters({ ...filters, projectId: value })}
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children as string).toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {projects.map((project) => (
                        <Option key={project.projectId} value={project.projectId}>
                          {project.projectName}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
                <Col span={6}>
                  <div>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>建设阶段</div>
                    <Select
                      placeholder="全部阶段"
                      style={{ width: '100%' }}
                      value={filters.stage}
                      onChange={(value) => setFilters({ ...filters, stage: value })}
                      allowClear
                    >
                      {stageOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
                <Col span={6}>
                  <div>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>文件标准</div>
                    <Select
                      placeholder="全部标准"
                      style={{ width: '100%' }}
                      value={filters.fileStandard}
                      onChange={(value) => setFilters({ ...filters, fileStandard: value })}
                      allowClear
                    >
                      {fileStandardOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
                <Col span={6}>
                  <div>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>档案分类</div>
                    <Select
                      placeholder="全部分类"
                      style={{ width: '100%' }}
                      value={filters.archiveCategory}
                      onChange={(value) => setFilters({ ...filters, archiveCategory: value })}
                      allowClear
                    >
                      {archiveCategoryOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
                <Col span={12}>
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
                共找到 <span style={{ color: '#1890ff', fontWeight: 500 }}>{total}</span> 条档案记录
              </span>
            </Col>
            <Col>
              <Button icon={<DownloadOutlined />}>批量导出</Button>
            </Col>
          </Row>

          {/* 档案列表 */}
          <Table
            columns={columns}
            dataSource={archiveList}
            rowKey="archiveId"
            loading={loading}
            scroll={{ x: 1600 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page, pageSize) => {
                setPagination({ current: page, pageSize: pageSize || 10 });
              },
            }}
            rowClassName={(record) => (record.delFlag === '1' ? 'row-deleted' : '')}
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
