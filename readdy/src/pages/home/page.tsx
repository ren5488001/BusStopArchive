
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            智能档案管理系统
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            专业的公交站台项目档案管理平台，提供可视化驾驶舱、实时数据监控和智能分析功能
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* 可视化驾驶舱 */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer"
               onClick={() => navigate('/dashboard')}>
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <i className="ri-dashboard-3-line text-3xl text-blue-600"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">可视化驾驶舱</h3>
            <p className="text-gray-600 mb-4">
              实时监控项目进度、档案完整度，通过GIS地图和数据图表提供全方位的项目管理视图
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              <span>进入驾驶舱</span>
              <i className="ri-arrow-right-line ml-2"></i>
            </div>
          </div>

          {/* 项目管理 */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer"
               onClick={() => navigate('/projects')}>
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <i className="ri-building-line text-3xl text-green-600"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">项目管理</h3>
            <p className="text-gray-600 mb-4">
              管理公交站台建设项目的全生命周期，包括立项、设计、施工、验收等各个阶段
            </p>
            <div className="flex items-center text-green-600 font-medium">
              <span>进入管理</span>
              <i className="ri-arrow-right-line ml-2"></i>
            </div>
          </div>

          {/* 档案管理 */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer"
               onClick={() => navigate('/archives')}>
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <i className="ri-file-list-3-line text-3xl text-purple-600"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">档案管理</h3>
            <p className="text-gray-600 mb-4">
              统一管理项目相关的合同、图纸、报告等档案文件，确保档案的完整性和规范性
            </p>
            <div className="flex items-center text-purple-600 font-medium">
              <span>进入管理</span>
              <i className="ri-arrow-right-line ml-2"></i>
            </div>
          </div>

          {/* 数据分析 */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
              <i className="ri-bar-chart-line text-3xl text-yellow-600"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">数据分析</h3>
            <p className="text-gray-600 mb-4">
              深度分析项目数据和档案趋势，为管理决策提供数据支持和预警提醒
            </p>
            <div className="flex items-center text-gray-400 font-medium">
              <span>即将开放</span>
              <i className="ri-time-line ml-2"></i>
            </div>
          </div>

          {/* 系统设置 */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-6">
              <i className="ri-settings-3-line text-3xl text-red-600"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">系统设置</h3>
            <p className="text-gray-600 mb-4">
              配置系统参数、用户权限、数据备份等系统管理功能
            </p>
            <div className="flex items-center text-gray-400 font-medium">
              <span>即将开放</span>
              <i className="ri-time-line ml-2"></i>
            </div>
          </div>

          {/* 帮助中心 */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
              <i className="ri-question-line text-3xl text-indigo-600"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">帮助中心</h3>
            <p className="text-gray-600 mb-4">
              查看系统使用手册、常见问题解答和技术支持信息
            </p>
            <div className="flex items-center text-gray-400 font-medium">
              <span>即将开放</span>
              <i className="ri-time-line ml-2"></i>
            </div>
          </div>
        </div>

        {/* 系统特色 */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">系统特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-eye-line text-white text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">可视化监控</h3>
              <p className="text-gray-600">直观的地图展示和图表分析，让数据一目了然</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-shield-check-line text-white text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">规范管理</h3>
              <p className="text-gray-600">标准化的档案管理流程，确保合规性</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-brain-line text-white text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">智能分析</h3>
              <p className="text-gray-600">AI驱动的数据分析和预警提醒功能</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
