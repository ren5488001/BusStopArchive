import React, { useState, useEffect } from 'react';
import { Spin, message, Empty, Button, Space } from 'antd';
import { request } from '@umijs/max';
import {
    FilePdfOutlined,
    FileWordOutlined,
    FileImageOutlined,
    FileExcelOutlined,
    FileTextOutlined,
    DownloadOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    FullscreenOutlined,
} from '@ant-design/icons';
import './index.less';

interface FilePreviewProps {
    /** 文件 URL */
    fileUrl?: string;
    /** 文件类型 */
    fileType?: string;
    /** 文件名 */
    fileName?: string;
    /** 高度 */
    height?: number | string;
    /** 是否显示工具栏 */
    showToolbar?: boolean;
    /** 下载回调 */
    onDownload?: () => void;
    /** 自定义样式 */
    style?: React.CSSProperties;
}

const FilePreview: React.FC<FilePreviewProps> = ({
    fileUrl,
    fileType,
    fileName,
    height = 600,
    showToolbar = true,
    onDownload,
    style,
}) => {
    const [loading, setLoading] = useState(false);
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
    const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

    // 根据文件名或 URL 判断文件类型
    const getFileType = (): string => {
        if (fileType) return fileType.toLowerCase();
        if (!fileUrl && !fileName) return 'unknown';

        const name = fileName || fileUrl || '';
        const ext = name.split('.').pop()?.toLowerCase() || '';

        return ext;
    };

    const currentFileType = getFileType();

    // 判断是否为图片
    const isImage = () => {
        return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(currentFileType);
    };

    // 判断是否为 PDF
    const isPDF = () => {
        return currentFileType === 'pdf';
    };

    // 判断是否为 Office 文档
    const isOfficeDoc = () => {
        return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(currentFileType);
    };

    // 当文件 URL 变化时，如果是图片或 PDF，使用 request 获取
    useEffect(() => {
        if (!fileUrl) {
            setImageBlobUrl(null);
            setPdfBlobUrl(null);
            return;
        }

        if (isImage()) {
            setLoading(true);
            setImageBlobUrl(null);

            // 使用 request 获取图片，这样会自动带上认证 token
            request(fileUrl, {
                method: 'GET',
                responseType: 'blob',
            })
                .then((blob: Blob) => {
                    const url = URL.createObjectURL(blob);
                    setImageBlobUrl(url);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('获取图片失败:', error);
                    message.error('图片加载失败');
                    setLoading(false);
                });
        } else if (isPDF()) {
            setLoading(true);
            setPdfBlobUrl(null);

            // 使用 request 获取 PDF，这样会自动带上认证 token
            request(fileUrl, {
                method: 'GET',
                responseType: 'blob',
            })
                .then((blob: Blob) => {
                    const url = URL.createObjectURL(blob);
                    setPdfBlobUrl(url);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('获取 PDF 失败:', error);
                    message.error('PDF 加载失败');
                    setLoading(false);
                });
        }

        // 清理函数：释放 Blob URL
        return () => {
            if (imageBlobUrl) {
                URL.revokeObjectURL(imageBlobUrl);
            }
            if (pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl);
            }
        };
    }, [fileUrl]);

    // 缩放控制
    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
    const handleRotateLeft = () => setRotation(prev => prev - 90);
    const handleRotateRight = () => setRotation(prev => prev + 90);
    const handleReset = () => {
        setScale(1.0);
        setRotation(0);
    };

    // 全屏预览
    const handleFullscreen = async () => {
        if (!fileUrl) return;

        // 对于图片，使用已有的 Blob URL
        if (isImage() && imageBlobUrl) {
            window.open(imageBlobUrl, '_blank');
            return;
        }

        // 对于 PDF，使用已有的 Blob URL
        if (isPDF() && pdfBlobUrl) {
            window.open(pdfBlobUrl, '_blank');
            return;
        }

        // 对于其他文件，先获取文件再打开
        try {
            setLoading(true);
            const blob = await request(fileUrl, {
                method: 'GET',
                responseType: 'blob',
            });

            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');

            // 延迟释放 URL
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);
        } catch (error) {
            console.error('全屏预览失败:', error);
            message.error('全屏预览失败');
        } finally {
            setLoading(false);
        }
    };

    // 渲染工具栏
    const renderToolbar = () => {
        if (!showToolbar) return null;

        return (
            <div className="file-preview-toolbar">
                <Space>
                    <span className="file-info">
                        {fileName || '文件预览'}
                    </span>
                </Space>
                <Space>
                    {isImage() && (
                        <>
                            <Button size="small" icon={<ZoomInOutlined />} onClick={handleZoomIn} title="放大">
                                放大
                            </Button>
                            <Button size="small" icon={<ZoomOutOutlined />} onClick={handleZoomOut} title="缩小">
                                缩小
                            </Button>
                            <Button size="small" icon={<RotateLeftOutlined />} onClick={handleRotateLeft} title="左旋转">
                                左旋转
                            </Button>
                            <Button size="small" icon={<RotateRightOutlined />} onClick={handleRotateRight} title="右旋转">
                                右旋转
                            </Button>
                            <Button size="small" onClick={handleReset} title="重置">
                                重置
                            </Button>
                        </>
                    )}


                </Space>
            </div>
        );
    };

    // 渲染 PDF 预览（使用浏览器内置预览）
    const renderPDF = () => {
        if (!fileUrl) {
            return <Empty description="暂无文件" />;
        }

        if (!pdfBlobUrl) {
            return <Empty description="PDF 加载中..." />;
        }

        // PDF 在 iframe 中已有内置的缩放和旋转工具，不需要外部 transform
        return (
            <div className="pdf-preview-container" style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5'
            }}>
                <FilePdfOutlined style={{ fontSize: 64, color: '#ff4d4f', marginBottom: 16 }} />
                <p style={{ fontSize: 16, marginBottom: 24 }}>{fileName || 'PDF 文件'}</p>
                <Button type="primary" icon={<FullscreenOutlined />} onClick={handleFullscreen}>
                    全屏预览 PDF
                </Button>
            </div>
        );
    };

    // 渲染图片预览
    const renderImage = () => {
        if (!fileUrl) {
            return <Empty description="暂无图片" />;
        }

        if (!imageBlobUrl) {
            return <Empty description="图片加载中..." />;
        }

        return (
            <div className="image-preview-container" style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}>
                <img
                    src={imageBlobUrl}
                    alt={fileName || '图片预览'}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    onLoad={() => {
                        console.log('图片加载成功:', fileName);
                    }}
                    onError={(e) => {
                        console.error('图片显示失败:', e);
                        message.error('图片显示失败');
                    }}
                />
            </div>
        );
    };

    // 渲染 Office 文档预览

    const renderOfficeDoc = () => {
        if (!fileUrl) {
            return <Empty description="暂无文件" />;
        }

        const isWord = ['doc', 'docx'].includes(currentFileType);
        const Icon = isWord ? FileWordOutlined : FileExcelOutlined;
        const color = isWord ? '#1890ff' : '#52c41a';
        const typeName = isWord ? 'Word 文档' : 'Excel 表格';

        return (
            <div className="office-preview-container" style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5'
            }}>
                <Icon style={{ fontSize: 64, color: color, marginBottom: 16 }} />
                <p style={{ fontSize: 16, marginBottom: 24 }}>{fileName || typeName}</p>
                <div style={{ textAlign: 'center', color: '#999', marginBottom: 24 }}>
                    <p>Office 文档暂不支持在线预览</p>
                    <p>请下载后查看</p>
                </div>
                {onDownload && (
                    <Button type="primary" icon={<DownloadOutlined />} onClick={onDownload}>
                        下载文件
                    </Button>
                )}
            </div>
        );
    };

    // 渲染文本文件预览
    const renderText = () => {
        if (!fileUrl) {
            return <Empty description="暂无文件" />;
        }

        return (
            <div className="text-preview-container">
                <iframe
                    src={fileUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    title="文本预览"
                />
            </div>
        );
    };

    // 渲染不支持的文件类型
    const renderUnsupported = () => {
        const iconMap: Record<string, React.ReactNode> = {
            pdf: <FilePdfOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />,
            doc: <FileWordOutlined style={{ fontSize: 64, color: '#1890ff' }} />,
            docx: <FileWordOutlined style={{ fontSize: 64, color: '#1890ff' }} />,
            xls: <FileExcelOutlined style={{ fontSize: 64, color: '#52c41a' }} />,
            xlsx: <FileExcelOutlined style={{ fontSize: 64, color: '#52c41a' }} />,
            txt: <FileTextOutlined style={{ fontSize: 64, color: '#666' }} />,
        };

        return (
            <div className="unsupported-preview">
                <div style={{ textAlign: 'center' }}>
                    {iconMap[currentFileType] || <FileTextOutlined style={{ fontSize: 64, color: '#999' }} />}
                    <p style={{ fontSize: 16, marginTop: 16, marginBottom: 8 }}>
                        {fileName || '未知文件'}
                    </p>
                    <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
                        暂不支持在线预览此类型文件
                    </p>
                    {onDownload && (
                        <Button type="primary" size="large" icon={<DownloadOutlined />} onClick={onDownload}>
                            下载文件
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    // 根据文件类型渲染对应的预览组件
    const renderPreview = () => {
        if (!fileUrl) {
            return (
                <div className="empty-preview">
                    <Empty
                        image={<FileImageOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
                        description={
                            <div>
                                <p style={{ fontSize: 16, marginBottom: 8 }}>暂无文件预览</p>
                                <p style={{ fontSize: 14, color: '#999' }}>请选择要预览的文件版本</p>
                            </div>
                        }
                    />
                </div>
            );
        }

        if (isImage()) {
            return renderImage();
        } else if (isPDF()) {
            return renderPDF();
        } else if (isOfficeDoc()) {
            return renderOfficeDoc();
        } else if (['txt', 'md', 'json', 'xml', 'html', 'css', 'js'].includes(currentFileType)) {
            return renderText();
        } else {
            return renderUnsupported();
        }
    };

    return (
        <div className="file-preview-wrapper" style={{ height, ...style }}>
            {renderToolbar()}
            <div className={`file-preview-content ${isPDF() ? 'pdf-content' : 'has-padding'}`}>
                <Spin spinning={loading} tip="加载中..." wrapperClassName="preview-spin-wrapper">
                    {renderPreview()}
                </Spin>
            </div>
        </div>
    );
};

export default FilePreview;
