import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const OccupancyChart = ({ selectedCity, selectedYear, data }) => {
  const chartRef = useRef(null);
  
  useEffect(() => {
    if (chartRef.current && data) {
      drawChart();
    }
  }, [selectedYear, selectedCity, data]);
  
  const drawChart = () => {
    d3.select(chartRef.current).selectAll("*").remove();
    
    // 准备数据
    let cityData;
    if (selectedCity === "全国") {
      // 全国数据
      const nationalData = data.filter(d => d[0] === "全国");
      cityData = nationalData.map(d => ({
        star: d[1],           
        occupancy: d[4]      
      }));
    } else {
      // 特定城市数据
      const specificCityData = data.filter(d => d[0] === selectedCity);
      cityData = specificCityData.map(d => ({
        star: d[1],           
        occupancy: d[4]       
      }));
    }
    
    // 按星级排序
    cityData.sort((a, b) => a.star - b.star);
    
    // 图表尺寸
    const width = 500;
    const height = 400;
    const margin = { top: 90, right: 120, bottom: 100, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "#fafafa")
      .style("border-radius", "8px");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // 比例尺
    const xScale = d3.scaleBand()
      .domain(cityData.map(d => `${d.star}星级`))
      .range([0, innerWidth])
      .padding(0.3);
    
    const yScale = d3.scaleLinear()
      .domain([0, 80])
      .range([innerHeight, 0]);
    
    // 配色
    const colorScale = d3.scaleOrdinal()
      .domain([2, 3, 4, 5])
      .range(['#9c27b0', '#2196f3', '#4caf50', '#e91e63']);
    
    // 渐变色
    const defs = svg.append("defs");
    
    cityData.forEach(d => {
      const gradient = defs.append("linearGradient")
        .attr("id", `occupancy-gradient-${d.star}-${selectedYear}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", yScale(0))
        .attr("x2", 0).attr("y2", yScale(d.occupancy));
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.color(colorScale(d.star)).brighter(0.4))
        .attr("stop-opacity", 0.8);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorScale(d.star))
        .attr("stop-opacity", 1);
    });
    
    // 网格线
    const yTicks = yScale.ticks(5);
    g.selectAll(".grid-line")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .style("stroke", "#e8e8e8")
      .style("stroke-width", 1)
      .style("opacity", 0.7);
    
    // 基准线（目标入住率70%）
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", yScale(70))
      .attr("y2", yScale(70))
      .style("stroke", "#e91e63")
      .style("stroke-width", 2)
      .style("stroke-dasharray", "5,5")
      .style("opacity", 0.8);
    
    // 基准线标签
    g.append("text")
      .attr("x", innerWidth - 5)
      .attr("y", yScale(70) - 5)
      .attr("text-anchor", "end")
      .style("font-size", "10px")
      .style("fill", "#e91e63")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .text("目标入住率 70%");
    
    // 坐标轴
    const xAxis = g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale));
    
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`));
    
    // 坐标轴样式
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#666")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif");
    
    yAxis.selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#666")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif");
    
    xAxis.select(".domain").style("stroke", "#ddd");
    yAxis.select(".domain").style("stroke", "#ddd");
    xAxis.selectAll(".tick line").style("stroke", "#ddd");
    yAxis.selectAll(".tick line").style("stroke", "#ddd");
    
    // 提示框
    const tooltip = d3.select("body").selectAll(".occupancy-tooltip")
      .data([0])
      .join("div")
      .attr("class", "occupancy-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.85)")
      .style("color", "white")
      .style("padding", "10px 12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)")
      .style("z-index", 1000);
    
    // 带渐变的柱状图
    const bars = g.selectAll(".bar")
      .data(cityData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(`${d.star}星级`))
      .attr("y", innerHeight)
      .attr("width", xScale.bandwidth())
      .attr("height", 0)
      .attr("fill", d => `url(#occupancy-gradient-${d.star}-${selectedYear})`)
      .attr("rx", 4)
      .attr("ry", 4)
      .style("cursor", "pointer")
      .style("filter", "drop-shadow(0 2px 6px rgba(0,0,0,0.15))");
    
    // 柱状图动画
    bars.transition()
      .duration(1000)
      .ease(d3.easeBackOut)
      .attr("y", d => yScale(d.occupancy))
      .attr("height", d => innerHeight - yScale(d.occupancy));
    
    // 鼠标悬停
    bars.on("mouseover", function(event, d) {
        // 放大当前柱子
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 0.9)
          .attr("transform", "scale(1.03)");
        
        // 判断等级
        const performance = d.occupancy >= 60 ? "优秀" : d.occupancy >= 45 ? "良好" : "待提升";
        const performanceColor = d.occupancy >= 60 ? "#4caf50" : d.occupancy >= 45 ? "#2196f3" : "#e91e63";
        
        // 提示框
        tooltip
          .style("opacity", 1)
          .html(`
            <div style="font-weight: bold; color: ${colorScale(d.star)};">${d.star}星级酒店</div>
            <div>入住率: ${d.occupancy}%</div>
            <div>城市: ${selectedCity}</div>
            <div>年份: ${selectedYear}</div>
            <div style="color: ${performanceColor};">表现: ${performance}</div>
          `)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        // 恢复柱子大小
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .attr("transform", "scale(1)");
        
        // 隐藏提示框
        tooltip.style("opacity", 0);
      });
    
    // 入住率标签+动画
    const labels = g.selectAll(".label")
      .data(cityData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => xScale(`${d.star}星级`) + xScale.bandwidth() / 2)
      .attr("y", innerHeight)
      .attr("text-anchor", "middle")
      .text(d => `${d.occupancy}%`)
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("fill", "#333")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .style("opacity", 0);
    
    // 标签动画
    labels.transition()
      .delay(800)
      .duration(400)
      .attr("y", d => yScale(d.occupancy) - 8)
      .style("opacity", 1);
    
    // 年份标题
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .text(`${selectedCity}酒店入住率`)
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", "#333")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif");
    
    // 年份指示器
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 45)
      .attr("text-anchor", "middle")
      .text(`${selectedYear}年数据`)
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("fill", "#666")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif");
    
    // 带性能指标的图例
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - margin.right + 10}, ${margin.top + 20})`);
    
    // 图例数据
    const legendData = cityData.map(d => ({
      star: d.star,
      label: `${d.star}星级`,
      color: colorScale(d.star),
      occupancy: d.occupancy,
      performance: d.occupancy >= 60 ? "优秀" : d.occupancy >= 45 ? "良好" : "待提升",
      performanceColor: d.occupancy >= 60 ? "#4caf50" : d.occupancy >= 45 ? "#2196f3" : "#e91e63"
    }));
    
    // 图例项目
    const legendItems = legend.selectAll(".legend-item")
      .data(legendData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 32})`)
      .style("cursor", "pointer");
    
    // 图例色块
    legendItems.append("rect")
      .attr("width", 14)
      .attr("height", 14)
      .attr("rx", 3)
      .attr("fill", d => d.color)
      .style("opacity", 0.9)
      .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.1))");
    
    // 图例文字
    legendItems.append("text")
      .attr("x", 20)
      .attr("y", 7)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", "#666")
      .style("font-weight", "500")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .text(d => d.label);
    
    // 性能指标
    legendItems.append("text")
      .attr("x", 20)
      .attr("y", 22)
      .style("font-size", "10px")
      .style("fill", d => d.performanceColor)
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .style("font-weight", "500")
      .text(d => `${d.occupancy}% ${d.performance}`);
    
    // 图例交互效果
    legendItems.on("mouseover", function(event, d) {
        // 只显示对应星级的柱子
        bars.style("opacity", bar => bar.star === d.star ? 1 : 0.3);
        d3.select(this).select("rect").style("opacity", 1).style("transform", "scale(1.1)");
      })
      .on("mouseout", function() {
        // 恢复所有柱子显示
        bars.style("opacity", 1);
        d3.select(this).select("rect").style("opacity", 0.9).style("transform", "scale(1)");
      });
    
    // 坐标轴标签
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 45)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#666")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .text("酒店星级");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#666")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .text("入住率 (%)");
  };
  
  return (
    <div 
      ref={chartRef} 
      className="chart"
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        overflow: 'hidden'
      }}
    />
  );
};

export default OccupancyChart;