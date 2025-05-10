/**
 * 五一、国庆等节假日期间的人口迁徙模式数据
 */

// 时间
const timeLabels = {
    1: "假期前一周",
    2: "假期前三天",
    3: "假期前一天",
    4: "假期当天",
    5: "假期后一天",
    6: "假期后三天",
    7: "假期后一周"
  };
  
  // 不同年份的基础数据倍率
  const yearMultipliers = {
    "2022": 0.85,
    "2023": 0.9,
    "2024": 1.0,
    "2025": 1.1
  };
  
  // 不同时间流量倍率
  const timeMultipliers = {
    // 五一
    "五一": {
      1: { "返乡流": 1.2, "返工流": 0.3, "日常流动": 0.8 }, // 假期前一周
      2: { "返乡流": 1.6, "返工流": 0.2, "日常流动": 0.7 }, // 假期前三天
      3: { "返乡流": 1.8, "返工流": 0.1, "日常流动": 0.6 }, // 假期前一天
      4: { "返乡流": 0.6, "返工流": 0.2, "日常流动": 1.2 }, // 假期当天：景点游览高峰
      5: { "返乡流": 0.3, "返工流": 0.6, "日常流动": 1.0 }, // 假期后一天：开始返程
      6: { "返乡流": 0.2, "返工流": 1.7, "日常流动": 0.7 }, // 假期后三天：返程高峰
      7: { "返乡流": 0.1, "返工流": 1.0, "日常流动": 0.9 }  // 假期后一周：基本恢复正常
    },
    // 国庆
    "国庆": {
      1: { "返乡流": 1.3, "返工流": 0.2, "日常流动": 0.9 }, // 假期前一周
      2: { "返乡流": 1.8, "返工流": 0.1, "日常流动": 0.8 }, // 假期前三天
      3: { "返乡流": 2.0, "返工流": 0.1, "日常流动": 0.7 }, // 假期前一天
      4: { "返乡流": 0.7, "返工流": 0.1, "日常流动": 1.3 }, // 假期当天：景点游览高峰
      5: { "返乡流": 0.5, "返工流": 0.3, "日常流动": 1.2 }, // 假期后一天：持续游览
      6: { "返乡流": 0.3, "返工流": 1.9, "日常流动": 0.8 }, // 假期后三天：返程高峰
      7: { "返乡流": 0.2, "返工流": 1.4, "日常流动": 0.9 }  // 假期后一周：逐渐恢复
    },
  };
  
  // 源城市/地区
  const sources = ['广东', '北京', '上海', '浙江', '江苏', '四川', '陕西', '湖北'];
  // 流动类型
  const flows = ['返乡流', '返工流', '日常流动'];
  // 目标城市/地区
  const targets = ['东部地区', '中部地区', '西部地区', '东北地区', 
                 '珠三角', '长三角', '川渝地区', '京津冀'];
  
  const colors = {
    // src(left)
    '广东': '#1A237E',
    '北京': '#283593',
    '上海': '#303F9F',
    '浙江': '#3949AB',
    '江苏': '#3F51B5',
    '四川': '#5C6BC0',
    '陕西': '#7986CB',
    '湖北': '#9FA8DA',
  
    // flow
    '返乡流': '#5E35B1',
    '返工流': '#673AB7',
    '日常流动': '#7B1FA2',
  
    // target(right)
    '东部地区': '#8E24AA',
    '中部地区': '#AD1457',
    '西部地区': '#C2185B',
    '东北地区': '#D81B60',
    '珠三角': '#E91E63',
    '长三角': '#EC407A',
    '川渝地区': '#F06292',
    '京津冀': '#F48FB1'
  };
  
  // 基础流数据
  const baseLinks = [
    // src到返乡流
    {source: '广东', target: '返乡流', value: 450},
    {source: '北京', target: '返乡流', value: 380},
    {source: '上海', target: '返乡流', value: 400},
    {source: '浙江', target: '返乡流', value: 290},
    {source: '江苏', target: '返乡流', value: 310},
    {source: '四川', target: '返乡流', value: 340},
    {source: '陕西', target: '返乡流', value: 260},
    {source: '湖北', target: '返乡流', value: 280},
    
    // src到返工流
    {source: '广东', target: '返工流', value: 420},
    {source: '北京', target: '返工流', value: 350},
    {source: '上海', target: '返工流', value: 380},
    {source: '浙江', target: '返工流', value: 270},
    {source: '江苏', target: '返工流', value: 290},
    {source: '四川', target: '返工流', value: 320},
    {source: '陕西', target: '返工流', value: 240},
    {source: '湖北', target: '返工流', value: 260},
    
    // src到日常流动
    {source: '广东', target: '日常流动', value: 150},
    {source: '北京', target: '日常流动', value: 130},
    {source: '上海', target: '日常流动', value: 140},
    {source: '浙江', target: '日常流动', value: 110},
    {source: '江苏', target: '日常流动', value: 120},
    {source: '四川', target: '日常流动', value: 130},
    {source: '陕西', target: '日常流动', value: 100},
    {source: '湖北', target: '日常流动', value: 110},
    
    //flow到target
    // 返乡流到target
    {source: '返乡流', target: '东部地区', value: 450},
    {source: '返乡流', target: '中部地区', value: 380},
    {source: '返乡流', target: '西部地区', value: 320},
    {source: '返乡流', target: '东北地区', value: 180},
    {source: '返乡流', target: '珠三角', value: 280},
    {source: '返乡流', target: '长三角', value: 360},
    {source: '返乡流', target: '川渝地区', value: 290},
    {source: '返乡流', target: '京津冀', value: 250},
    
    // 返工流到target
    {source: '返工流', target: '东部地区', value: 440},
    {source: '返工流', target: '中部地区', value: 350},
    {source: '返工流', target: '西部地区', value: 300},
    {source: '返工流', target: '东北地区', value: 170},
    {source: '返工流', target: '珠三角', value: 270},
    {source: '返工流', target: '长三角', value: 350},
    {source: '返工流', target: '川渝地区', value: 280},
    {source: '返工流', target: '京津冀', value: 240},
    
    // 日常流动到target
    {source: '日常流动', target: '东部地区', value: 140},
    {source: '日常流动', target: '中部地区', value: 110},
    {source: '日常流动', target: '西部地区', value: 90},
    {source: '日常流动', target: '东北地区', value: 60},
    {source: '日常流动', target: '珠三角', value: 100},
    {source: '日常流动', target: '长三角', value: 120},
    {source: '日常流动', target: '川渝地区', value: 90},
    {source: '日常流动', target: '京津冀', value: 80}
  ];
  
  // 导出数据
  window.migrationData = {
    timeLabels,
    yearMultipliers,
    timeMultipliers,
    sources,
    flows,
    targets,
    colors,
    baseLinks
  };