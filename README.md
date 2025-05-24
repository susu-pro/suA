## 📋 项目概述

⭐ 如果这个项目对你有帮助，请给个Star支持一下！ ⭐ 

欢迎参与中国文旅数据可视化平台的开发！这个平台用于展示全国各地区文化旅游产业的综合数据，包括酒店、景区、客流量、收入等多维度指标。我们采用了模块化架构，您可以轻松地将自己开发的数据可视化组件集成到平台中。



> 基于 React + D3.js 的交互式数据可视化平台，展示全国各地区文化旅游产业数据

## 📊 项目演示

### 🎥 功能演示视频


![项目演示](demo/export.gif)
![项目演示](demo/export3.gif)
![项目演示](demo/export4.gif)
![项目演示](demo/export5.gif)

## 🎯 当前需要集成的组件

### 1. 趋势折线图组件

- **功能**：展示文旅数据的时间序列变化
- **数据类型**：全国各地区旅游收入、全国各地区旅游人数、各国各地文旅企业数量等时间变化趋势
- **组件名称**：`TrendLineChart`

### 2. 节假日人口流动Sankey图

- **功能**：展示节假日期间人口在各地区间的流动情况
- **数据类型**：人口流入流出数据、地区间迁徙数据
- **组件名称**：`HolidayPopulationFlow`

## 🚀 快速开始

### 1. 项目结构

```
src/
├── components/
│   ├── team/                    # 👈 组员的组件放在这里
│   │   ├── TrendLineChart.jsx   # 趋势折线图
│   │   ├── HolidayPopulationFlow.jsx # 节假日人口流动Sankey图
│   │   └── index.js             # 导出文件
│   ├── RoseChart.jsx            # 现有基础组件
│   ├── ScatterPlot.jsx
│   └── ...
├── data/
│   ├── hotel_data.js            # 酒店数据源
│   ├── tourism_data.js          # 旅游数据源
│   └── population_flow_data.js  # 人口流动数据源
└── HotelVisualization.jsx       # 主应用文件
```

### 2. 数据格式说明

#### 文旅综合数据格式

```javascript
// 酒店数据结构示例
const hotelData = [
  ["地区名称", "一星级价格", "二星级价格", "三星级价格", "四星级价格", "五星级价格", 
   "一星级数量", "二星级数量", "三星级数量", "四星级数量", "五星级数量",
   "一星级入住率", "二星级入住率", "三星级入住率", "四星级入住率", "五星级入住率"],
  ["北京", 200, 350, 500, 800, 1500, 10, 25, 45, 80, 35, 75, 82, 78, 85, 90],
  // ... 更多城市数据
];

// 趋势数据结构示例
const trendData = [
  {
    date: "2024-01",
    region: "北京",
    hotelOccupancy: 75,
    touristCount: 1200000,
    revenue: 89000000,
    scenicSpotVisits: 850000
  },
  {
    date: "2024-02", 
    region: "北京",
    hotelOccupancy: 82,
    touristCount: 1450000,
    revenue: 105000000,
    scenicSpotVisits: 920000
  },
  // ... 更多时间点数据
];

// 人口流动数据结构示例
const populationFlowData = [
  {
    source: "北京",      // 流出地
    target: "上海",      // 流入地
    value: 125000,       // 流动人数
    holiday: "春节",     // 节假日类型
    date: "2024-02-10"   // 具体日期
  },
  {
    source: "广州",
    target: "三亚", 
    value: 89000,
    holiday: "春节",
    date: "2024-02-10"
  },
  // ... 更多流动数据
];
```

## 🔧 组件开发规范

### 标准组件接口

您的组件必须遵循以下接口规范：

```javascript
import React from 'react';

const YourChartComponent = ({ 
  data,           // 文旅数据数组
  selectedCity,   // 当前选中的城市
  selectedYear,   // 当前选中的年份
  onDataChange,   // 数据变化回调函数（可选）
  config = {}     // 自定义配置参数（可选）
}) => {
  
  // 🔍 数据处理示例
  const processData = () => {
    // 根据组件类型处理不同的数据
    if (config.dataType === 'trend') {
      // 处理趋势数据
      return data.filter(item => item.region === selectedCity);
    } else if (config.dataType === 'flow') {
      // 处理流动数据
      return data.filter(item => 
        item.source === selectedCity || item.target === selectedCity
      );
    }
    
    // 处理基础酒店数据
    const cityData = data.find(row => row[0] === selectedCity);
    if (!cityData) return null;
    
    return {
      prices: cityData.slice(1, 6),      // 价格数据
      counts: cityData.slice(6, 11),     // 数量数据  
      occupancy: cityData.slice(11, 16)  // 入住率数据
    };
  };

  const chartData = processData();
  
  if (!chartData) {
    return <div>暂无数据</div>;
  }

  return (
    <div className="your-chart-container">
      <h4>您的图表标题 - {selectedCity} ({selectedYear}年)</h4>
      {/* 您的图表实现 */}
      <div>图表内容</div>
    </div>
  );
};

export default YourChartComponent;
```

## 📝 具体组件集成指南

### 组件1：趋势折线图 (TrendLineChart)

#### 组件要求

- 展示选定城市的多指标时间趋势
- 支持多条折线对比（入住率、客流量、收入等）
- 支持时间范围选择
- 响应式设计


### 组件2：节假日人口流动Sankey图 (HolidayPopulationFlow)

#### 组件要求

- 展示节假日期间人口在各地区间的流动
- 支持不同节假日数据切换
- 流量粗细表示人口数量
- 颜色区分不同地区


## 📝 集成步骤

### 步骤 1：创建组件文件

在 `src/components/team/` 目录下创建您的组件文件：

```
src/components/team/
├── TrendLineChart.jsx           # 趋势折线图
├── HolidayPopulationFlow.jsx    # 节假日人口流动Sankey图
└── index.js                     # 导出文件
```

### 步骤 2：创建导出文件

创建 `src/components/team/index.js`：

```javascript
// src/components/team/index.js
export { default as TrendLineChart } from './TrendLineChart';
export { default as HolidayPopulationFlow } from './HolidayPopulationFlow';
```

### 步骤 3：在主应用中注册组件

在 `HotelVisualization.jsx` 中添加您的组件：

```javascript
// 1. 导入组员的组件
import { TrendLineChart, HolidayPopulationFlow } from './components/team';

// 2. 在 colleagueComponents 配置中添加
const teamComponents = [
  {
    id: 'trend-line-chart',
    title: '文旅数据趋势分析',
    component: (
      <TrendLineChart 
        data={trendData}  // 注意：需要传入趋势数据
        selectedCity={selectedCity}
        selectedYear={selectedYear}
        config={{
          dataType: 'trend',
          showMultipleMetrics: true
        }}
      />
    )
  },
  {
    id: 'holiday-population-flow',
    title: '节假日人口流动分析',
    component: (
      <HolidayPopulationFlow 
        data={populationFlowData}  // 注意：需要传入人口流动数据
        selectedCity={selectedCity}
        selectedYear={selectedYear}
        config={{
          dataType: 'flow',
          defaultHoliday: '春节'
        }}
      />
    )
  }
];
```

## 🎨 样式指南

### 趋势折线图样式

```css
.trend-line-chart {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.trend-line-chart .recharts-tooltip-wrapper {
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
```

### Sankey图样式

```css
.holiday-population-flow {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.holiday-population-flow .controls {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.holiday-population-flow .controls select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.sankey-container {
  display: flex;
  justify-content: center;
  overflow-x: auto;
}
```

## 📊 可用工具库
### D3.js (推荐用于Sankey图)

```javascript
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
```

## ⚠️ 重要注意事项

### 数据类型区分

请确保正确处理不同类型的数据：

- **基础酒店数据**：二维数组格式
- **趋势数据**：对象数组，包含时间维度
- **流动数据**：包含source、target、value的对象数组

### 性能优化

```javascript
// 使用 useMemo 缓存复杂计算
const processedData = useMemo(() => {
  return expensiveDataProcessing(data, selectedCity);
}, [data, selectedCity, selectedYear]);

// 使用 useCallback 缓存事件处理函数
const handleDataChange = useCallback((newData) => {
  onDataChange?.(newData);
}, [onDataChange]);
```

### 错误处理

```javascript
const YourChart = ({ data, selectedCity }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="error-message">暂无数据</div>;
  }
  
  if (!selectedCity) {
    return <div className="error-message">请选择城市</div>;
  }
  
  // 组件逻辑...
};
```

## 📚 完整示例

### 数据获取和处理

```javascript
// 示例：如何从不同数据源获取数据
const useChartData = (selectedCity, selectedYear) => {
  const [trendData, setTrendData] = useState([]);
  const [flowData, setFlowData] = useState([]);
  
  useEffect(() => {
    // 获取趋势数据
    const trends = getTrendDataByYear(selectedYear);
    setTrendData(trends);
    
    // 获取流动数据
    const flows = getPopulationFlowData(selectedYear);
    setFlowData(flows);
  }, [selectedCity, selectedYear]);
  
  return { trendData, flowData };
};
```

## 🔗 资源链接

- **D3.js 文档**: https://d3js.org/
- **D3-Sankey**: https://github.com/d3/d3-sankey

## 📞 联系方式

如果您在集成过程中遇到任何问题，请通过以下方式联系：
苏颜 suyan249@outlook.com

## 🔄 更新日志_sy

### v1.3.0 (2024-05-24)

- 中国文旅数据可视化平台
- 添加趋势折线图和Sankey图集成指南
- 优化数据格式说明
- 添加完整的组件示例

### v1.2.0 (2024-05-20)

- 创建中国文旅数据可视化平台主应用
- 添加酒店组件配置化架构
- 支持多标签页展示

---

**感谢您的贡献！** 🎉

让我们一起打造更好的文旅数据可视化平台！
