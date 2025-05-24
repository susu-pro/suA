import React, { useEffect, useState, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { getProvinceDataByYear } from '../data/hotel_data';

const ChinaHeatMapD3 = ({ selectedYear = '2024', selectedCity, onCityChange }) => {
  const svgRef = useRef();
  const [geoJson, setGeoJson] = useState(null);
  const [currentMetric, setCurrentMetric] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);

  // 省份名称
  const provinceNameMap = useMemo(() => ({
    '北京': '北京市',
    '天津': '天津市', 
    '上海': '上海市',
    '重庆': '重庆市',
    '河北': '河北省',
    '山西': '山西省',
    '辽宁': '辽宁省',
    '吉林': '吉林省',
    '黑龙江': '黑龙江省',
    '江苏': '江苏省',
    '浙江': '浙江省',
    '安徽': '安徽省',
    '福建': '福建省',
    '江西': '江西省',
    '山东': '山东省',
    '河南': '河南省',
    '湖北': '湖北省',
    '湖南': '湖南省',
    '广东': '广东省',
    '海南': '海南省',
    '四川': '四川省',
    '贵州': '贵州省',
    '云南': '云南省',
    '陕西': '陕西省',
    '甘肃': '甘肃省',
    '青海': '青海省',
    '台湾': '台湾省',
    '内蒙古': '内蒙古自治区',
    '广西': '广西壮族自治区',
    '西藏': '西藏自治区',
    '宁夏': '宁夏回族自治区',
    '新疆': '新疆维吾尔自治区',
    '香港': '香港特别行政区',
    '澳门': '澳门特别行政区'
  }), []);

  // 反向映射
  const reverseProvinceNameMap = useMemo(() => {
    const reverseMap = {};
    Object.entries(provinceNameMap).forEach(([dataName, geoName]) => {
      reverseMap[geoName] = dataName;
    });
    return reverseMap;
  }, [provinceNameMap]);

  // 指标
  const metrics = useMemo(() => ({
    revenue: { 
      name: '营业收入', 
      unit: '亿元', 
      colorScheme: d3.schemeBlues[9]
    },
    occupancy: { 
      name: '客房收入占比', 
      unit: '%', 
      colorScheme: d3.schemePurples[9]
    },
    avgPrice: { 
      name: '平均房价', 
      unit: '元/间夜', 
      colorScheme: d3.schemeGreens[9]
    },
    growth: { 
      name: '利润总额', 
      unit: '亿元', 
      colorScheme: d3.schemeOranges[9]
    }
  }), []);

  // 地图数据
  useEffect(() => {
    setLoading(true);
    setLoadingError(null);
    
    fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }
        return response.json();
      })
      .then(chinaJson => {
        console.log("[Debug] GeoJSON加载成功，省份列表:", 
          chinaJson.features.map(f => f.properties.name));
        setGeoJson(chinaJson);
        setLoading(false);
      })
      .catch(error => {
        console.error('加载地图数据失败:', error);
        setLoadingError(`无法加载地图数据: ${error.message}`);
        setGeoJson(null);
        setLoading(false);
      });
  }, []);

  // 渲染地图
  useEffect(() => {
    if (!geoJson || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); 

    const width = 900;
    const height = 600;
    const margin = { top: 20, right: 120, bottom: 20, left: 20 };

    // SVG尺寸
    svg.attr("width", width).attr("height", height);

    // 地图投影
    const projection = d3.geoMercator()
      .center([107, 31])
      .scale(700)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // 获取数据
    const provinceDataForYear = getProvinceDataByYear(selectedYear);
    if (!provinceDataForYear) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("fill", "#ff0000")
        .text(`暂无 ${selectedYear} 年的数据`);
      return;
    }

    // 处理数据+颜色
    const dataMap = new Map();
    const values = [];

    Object.entries(provinceDataForYear).forEach(([provinceName, data]) => {
      const rawValue = data[currentMetric];
      const numericValue = parseFloat(rawValue);
      const value = isNaN(numericValue) ? 0 : numericValue;
      
      const mappedProvinceName = provinceNameMap[provinceName] || provinceName;
      dataMap.set(mappedProvinceName, {
        value,
        originalName: provinceName
      });
      
      if (value > 0) values.push(value);
    });

    // 颜色
    const colorScale = d3.scaleQuantize()
      .domain(d3.extent(values))
      .range(metrics[currentMetric].colorScheme);

    // 主地图组
    const mapGroup = svg.append("g")
      .attr("class", "map-group");

    // 提示框
    const tooltip = d3.select("body").append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000");

    // 绘制省份
    mapGroup.selectAll("path")
      .data(geoJson.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => {
        const provinceData = dataMap.get(d.properties.name);
        return provinceData ? colorScale(provinceData.value) : "#f0f0f0";
      })
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        const provinceData = dataMap.get(d.properties.name);
        const displayName = provinceData?.originalName || 
          reverseProvinceNameMap[d.properties.name] || d.properties.name;
        
        const tooltipText = provinceData ? 
          `${displayName}<br/>${metrics[currentMetric].name}: ${provinceData.value.toFixed(2)} ${metrics[currentMetric].unit}` :
          `${displayName}<br/>暂无数据`;
        
        tooltip.html(tooltipText).style("visibility", "visible");
        
        // 高亮效果
        d3.select(event.target)
          .attr("stroke", "#ffc107")
          .attr("stroke-width", 2);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", (event) => {
        tooltip.style("visibility", "hidden");
        
        // 移除高亮
        d3.select(event.target)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1);
      })
      .on("click", (event, d) => {
        if (onCityChange) {
          const provinceData = dataMap.get(d.properties.name);
          const originalName = provinceData?.originalName || 
            reverseProvinceNameMap[d.properties.name] || d.properties.name;
          onCityChange(originalName);
        }
      });

    // 图例
    const legendWidth = 100;
    const legendHeight = 200;
    const legendX = width - margin.right + 10;
    const legendY = margin.top + 50;

    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendX}, ${legendY})`);

    // 图例标题
    legend.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(metrics[currentMetric].unit);

    // 图例色块
    const legendScale = d3.scaleLinear()
      .domain(d3.extent(values))
      .range([legendHeight, 0]);

    const legendAxis = d3.axisRight(legendScale)
      .tickSize(6)
      .tickFormat(d => d.toFixed(0));

    // 渐变
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", `legend-gradient-${currentMetric}`)
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");

    const colorStops = metrics[currentMetric].colorScheme;
    colorStops.forEach((color, i) => {
      gradient.append("stop")
        .attr("offset", `${(i / (colorStops.length - 1)) * 100}%`)
        .attr("stop-color", color);
    });

    // 图例矩形
    legend.append("rect")
      .attr("width", 20)
      .attr("height", legendHeight)
      .style("fill", `url(#legend-gradient-${currentMetric})`);

    // 图例轴
    legend.append("g")
      .attr("transform", "translate(20, 0)")
      .call(legendAxis)
      .selectAll("text")
      .style("font-size", "10px");

    // 清理函数
    return () => {
      tooltip.remove();
    };

  }, [geoJson, selectedYear, currentMetric, metrics, provinceNameMap, reverseProvinceNameMap, loading, onCityChange]);

  // 缩放和拖拽
  useEffect(() => {
    if (!geoJson || loading) return;

    const svg = d3.select(svgRef.current);
    const mapGroup = svg.select(".map-group");

    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        mapGroup.attr("transform", event.transform);
      });

    svg.call(zoom);

    // 重置按钮
    const resetButton = d3.select("#reset-zoom");
    if (!resetButton.empty()) {
      resetButton.on("click", () => {
        svg.transition().duration(750).call(
          zoom.transform,
          d3.zoomIdentity
        );
      });
    }

  }, [geoJson, loading]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '600px', 
        color: '#666',
        backgroundColor: '#f8fafb',
        borderRadius: '12px' 
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #2196f3', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <p style={{ marginTop: '15px', fontSize: '16px' }}>正在加载中国地图数据...</p>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div style={{ 
        color: 'red', 
        padding: '20px', 
        textAlign: 'center', 
        backgroundColor: '#fff0f0', 
        border: '1px solid #ffcccc', 
        borderRadius: '8px' 
      }}>
        错误: {loadingError}
      </div>
    );
  }

  if (!geoJson) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: '#666' 
      }}>
        地图数据未能加载，无法显示图表。请检查网络连接或数据源。
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      overflow: 'hidden', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
    }}>
      {/* 头部 */}
      <div style={{ 
        padding: '20px 25px', 
        borderBottom: '1px solid #f0f0f0', 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '20px' 
        }}>
          <div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#2196f3', 
              margin: 0 
            }}>
              中国文旅数据地理热力图 
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#666', 
              margin: '8px 0 0 0' 
            }}>
              省份颜色深浅表示该指标数值高低，支持缩放和拖拽
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {Object.entries(metrics).map(([key, metric]) => (
              <button
                key={key}
                onClick={() => setCurrentMetric(key)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  backgroundColor: currentMetric === key ? '#2196f3' : 'white',
                  color: currentMetric === key ? 'white' : '#444',
                  borderColor: currentMetric === key ? '#2196f3' : '#d0d0d0',
                  boxShadow: currentMetric === key ? 
                    '0 2px 8px rgba(33,150,243,0.3)' : 
                    '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                {metric.name}
              </button>
            ))}
            <button
              id="reset-zoom"
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #d0d0d0',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500',
                backgroundColor: 'white',
                color: '#444',
                transition: 'all 0.3s ease',
              }}
            >
              重置缩放
            </button>
          </div>
        </div>
      </div>

      {/* 地图容器 */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          style={{ 
            width: '100%', 
            height: '650px',
            display: 'block' 
          }}
        />
      </div>

      {/* 底部说明 */}
      <div style={{ 
        padding: '15px 25px', 
        borderTop: '1px solid #f0f0f0', 
        background: '#f8f9fa', 
        fontSize: '13px', 
        color: '#555' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '10px' 
        }}>
          <i className="fas fa-info-circle" style={{ 
            color: '#2196f3', 
            marginTop: '3px', 
            fontSize: '16px' 
          }}></i>
          <div>
            <p style={{ margin: '0 0 6px 0', fontWeight: '500' }}>
              数据说明：基于文化和旅游部公开的文旅产业统计数据，使用D3.js渲染。
            </p>
            <p style={{ margin: 0 }}>
              💡 鼠标悬停查看详细数据，点击省份进行交互，滚轮缩放，拖拽移动地图。
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .d3-tooltip {
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
};

export default ChinaHeatMapD3;