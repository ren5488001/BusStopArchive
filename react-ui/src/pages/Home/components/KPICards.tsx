
interface KPIData {
  totalProjects: number;
  totalArchives: number;
  ongoingProjects: number;
  avgCompleteness: number;
}

interface KPICardsProps {
  data: KPIData;
}

export default function KPICards({ data }: KPICardsProps) {
  const cards = [
    {
      title: '项目总数',
      value: data.totalProjects,
      unit: '个',
      icon: 'ri-building-line',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: '档案总量',
      value: data.totalArchives,
      unit: '份',
      icon: 'ri-file-list-3-line',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: '在建中项目',
      value: data.ongoingProjects,
      unit: '个',
      icon: 'ri-hammer-line',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      highlight: true
    },
    {
      title: '平均档案完整度',
      value: data.avgCompleteness,
      unit: '%',
      icon: 'ri-pie-chart-line',
      color: data.avgCompleteness >= 90 ? 'bg-green-500' : data.avgCompleteness >= 70 ? 'bg-yellow-500' : 'bg-red-500',
      bgColor: data.avgCompleteness >= 90 ? 'bg-green-50' : data.avgCompleteness >= 70 ? 'bg-yellow-50' : 'bg-red-50',
      textColor: data.avgCompleteness >= 90 ? 'text-green-600' : data.avgCompleteness >= 70 ? 'text-yellow-600' : 'text-red-600',
      warning: data.avgCompleteness < 90
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 ${
            card.highlight ? 'ring-2 ring-yellow-200' : ''
          } ${card.warning ? 'ring-2 ring-red-200' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <div className="flex items-baseline space-x-1">
                <span className={`text-3xl font-bold ${card.textColor}`}>
                  {card.value.toLocaleString()}
                </span>
                <span className={`text-sm font-medium ${card.textColor}`}>
                  {card.unit}
                </span>
              </div>
              {card.warning && (
                <div className="flex items-center mt-2 text-red-500 text-xs">
                  <i className="ri-alert-line mr-1"></i>
                  <span>低于预警值</span>
                </div>
              )}
            </div>
            <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
              <i className={`${card.icon} text-white text-xl`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

