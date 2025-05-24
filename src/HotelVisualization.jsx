import React, { useState, useEffect } from 'react';
import RoseChart from './components/RoseChart';
import ScatterPlot from './components/ScatterPlot';
import BarChart from './components/BarChart';
import OccupancyChart from './components/OccupancyChart';
import YearTimeline from './components/YearTimeline';
import HeatMap from './components/HeatMap';
import { hotelData2024, hotelData2023, hotelData2022, getHotelDataByYear } from './data/hotel_data';


const HotelDataVisualization = () => {
  // 年份和城市
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedCity, setSelectedCity] = useState('全国');
  const [activeTab, setActiveTab] = useState('charts'); // 新增：tab状态
  
  // 选中年份变化的图表数据
  const [chartData, setChartData] = useState(hotelData2024);
  
  // 可选的年份
  const availableYears = ['2019', '2020', '2021', '2022', '2023', '2024'];
  
  // 当年份改变时更新数据
  useEffect(() => {
    const yearData = getHotelDataByYear(parseInt(selectedYear));
    setChartData(yearData);
  }, [selectedYear]);
  
  // 地区列表
  const regions = ["全国", ...new Set(hotelData2024.filter(d => d[0] !== "全国").map(d => d[0]))];
  
  // 热力地图的城市选择
  const handleCityChangeFromMap = (cityName) => {
    if (regions.includes(cityName)) {
      setSelectedCity(cityName);
    }
  };
  
  // Tab配置
  const tabs = [
    { id: 'charts', label: '数据图表', icon: 'fas fa-chart-bar' },
    { id: 'heatmap', label: '地图热力', icon: 'fas fa-map' }
  ];
  
  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <i className="fas fa-hotel"></i>
          <h1>中国城市酒店数据分析平台</h1>
        </div>
        <div className="nav-controls">
          <div className="city-selector">
            <label htmlFor="city-selector">城市选择：</label>
            <select 
              id="city-selector" 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>
      </header>
      
      <main className="content-area">
        <div className="dashboard">
          <div className="dashboard-header">
            <h2>{selectedYear}年{selectedCity}星级酒店统计数据</h2>
            <p className="dashboard-desc">该网页提供了{selectedCity}地区各星级酒店的价格、数量和入住率数据分析</p>
          </div>
          
          {/* 年份时间轴组件 */}
          <YearTimeline 
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            availableYears={availableYears}
            autoPlay={false}
          />
          
          {/* Tab导航 */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #f0f0f0',
            marginBottom: '20px',
            backgroundColor: 'white',
            borderRadius: '8px 8px 0 0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '15px 25px',
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? '#2196f3' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#666',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  borderRadius: activeTab === tab.id ? '8px 8px 0 0' : '0',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: activeTab === tab.id ? '0 -2px 8px rgba(33,150,243,0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.backgroundColor = '#f5f5f5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <i className={tab.icon} style={{ fontSize: '14px' }}></i>
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab内容 */}
          {activeTab === 'charts' && (
            <div className="charts-tab">
              {/* 四个图表 */}
              <div className="chart-container-row">
                <div className="chart-wrapper half-width">
                  <h3>星级酒店价格分布 (元/晚)</h3>
                  <RoseChart 
                    data={chartData} 
                    selectedCity={selectedCity} 
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                  />
                </div>
                
                <div className="chart-wrapper half-width">
                  <h3>价格与入住率关系</h3>
                  <ScatterPlot 
                    data={chartData} 
                    selectedCity={selectedCity}
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                  />
                </div>
              </div>
              
              <div className="chart-container-row">
                <div className="chart-wrapper half-width">
                  <h3>各星级酒店数量</h3>
                  <BarChart 
                    data={chartData} 
                    selectedCity={selectedCity}
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                  />
                </div>
                
                <div className="chart-wrapper half-width">
                  <h3>各星级酒店入住率 (%)</h3>
                  <OccupancyChart 
                    selectedCity={selectedCity}
                    selectedYear={selectedYear}
                    data={chartData}
                  />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'heatmap' && (
            <div className="heatmap-tab">
              {/* 热力地图 */}
              <HeatMap 
                selectedYear={selectedYear}
                selectedCity={selectedCity}
                onCityChange={handleCityChangeFromMap}
              />
            </div>
          )}
          
          <div className="info-alert">
            <i className="fas fa-info-circle"></i>
            <p>数据来源：文化和旅游部财务司，{selectedYear}年度全国各地区星级饭店经济指标汇总表。<br />
            入住率数据表示平均出租率。</p>
          </div>
        </div>
      </main>
      
      <footer className="footer">
        <div className="footer-info">
          <p>数据来源：国家统计局、文化和旅游部</p>
          <p>更新时间：{selectedYear}年4月30日</p>
        </div>
      </footer>
    </div>
  );
};

export default HotelDataVisualization;