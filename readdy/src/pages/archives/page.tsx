
import { useState } from 'react';
import ArchiveEntry from './components/ArchiveEntry';
import ArchiveSearch from './components/ArchiveSearch';
import ArchiveDetail from './components/ArchiveDetail';
import { mockArchives } from '../../mocks/archiveData';

export default function Archives() {
  const [activeTab, setActiveTab] = useState('search');
  const [selectedArchive, setSelectedArchive] = useState(null);

  const handleViewDetail = (archive: any) => {
    setSelectedArchive(archive);
    setActiveTab('detail');
  };

  const handleBackToSearch = () => {
    setSelectedArchive(null);
    setActiveTab('search');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <i className="ri-file-list-3-line text-white text-lg"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">档案管理</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                最后更新: {new Date().toLocaleString('zh-CN')}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 标签页导航 */}
      {activeTab !== 'detail' && (
        <div className="bg-white border-b">
          <div className="px-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('search')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'search'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="ri-search-line mr-2"></i>
                档案检索查询
              </button>
              <button
                onClick={() => setActiveTab('entry')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'entry'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="ri-upload-cloud-line mr-2"></i>
                著录与入库
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* 主要内容区域 */}
      <main className="p-6">
        {activeTab === 'search' && (
          <ArchiveSearch
            archives={mockArchives}
            onViewDetail={handleViewDetail}
          />
        )}
        {activeTab === 'entry' && (
          <ArchiveEntry />
        )}
        {activeTab === 'detail' && selectedArchive && (
          <ArchiveDetail
            archive={selectedArchive}
            onBack={handleBackToSearch}
          />
        )}
      </main>
    </div>
  );
}
