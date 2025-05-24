import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ScatterPlot = ({ data, selectedCity, selectedYear, onYearChange }) => {
  const chartRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // 可用年份
  const availableYears = [2019, 2020, 2021, 2022, 2023, 2024];
  
  useEffect(() => {
    if (chartRef.current) {
      drawChart();
    }
  }, [data, selectedCity, selectedYear]);
  
  const drawChart = () => {
    d3.select(chartRef.current).selectAll("*").remove();
    
    // 过滤掉全国数据
    const filteredData = data.filter(d => d[0] !== "全国");
    
    // 处理数据
    const scatterData = filteredData.map(d => ({
      city: d[0],
      star: d[1],
      price: d[3],
      occupancy: d[4],
      count: d[2],
      highlighted: d[0] === selectedCity
    }));
    
    // 画布图表
    const width = 500;
    const height = 400; 
    const margin = { top: 60, right: 150, bottom: 100, left: 100 };
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
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(scatterData, d => d.price) * 1.1])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(scatterData, d => d.occupancy) * 1.1])
      .range([innerHeight, 0]);
    
    const rScale = d3.scaleSqrt()
      .domain([0, d3.max(scatterData, d => d.count)])
      .range([4, 20]);
    
    // 配色
    const colorScale = d3.scaleOrdinal()
      .domain([2, 3, 4, 5])
      .range(['#9c27b0', '#2196f3', '#4caf50', '#e91e63']);
    
    // 网格线+动画
    const xTicks = xScale.ticks(6);
    const yTicks = yScale.ticks(6);
    
    const xGridLines = g.selectAll(".x-grid")
      .data(xTicks)
      .enter()
      .append("line")
      .attr("class", "x-grid")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", innerHeight)
      .attr("y2", innerHeight)
      .style("stroke", "#e8e8e8")
      .style("stroke-width", 1)
      .style("opacity", 0);
    
    xGridLines.transition()
      .delay((d, i) => i * 50)
      .duration(500)
      .attr("y2", 0)
      .style("opacity", 0.7);
    
    const yGridLines = g.selectAll(".y-grid")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("class", "y-grid")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .style("stroke", "#e8e8e8")
      .style("stroke-width", 1)
      .style("opacity", 0);
    
    yGridLines.transition()
      .delay((d, i) => i * 50)
      .duration(500)
      .attr("x2", innerWidth)
      .style("opacity", 0.7);
    
    // 坐标轴
    const xAxis = g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `¥${d}`));
    
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}%`));
    
    // 坐标轴样式
    xAxis.selectAll("text")
      .style("font-size", "10px")
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
    
    // tooltip
    const tooltip = d3.select("body").selectAll(".scatter-tooltip")
      .data([0])
      .join("div")
      .attr("class", "scatter-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.85)")
      .style("color", "white")
      .style("padding", "12px 15px")
      .style("border-radius", "8px")
      .style("font-size", "12px")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("box-shadow", "0 6px 16px rgba(0,0,0,0.3)")
      .style("z-index", 1000);
    
    // 为圆圈添加渐变色
    const defs = svg.append("defs");
    
    [2, 3, 4, 5].forEach(star => {
      const gradient = defs.append("radialGradient")
        .attr("id", `circle-gradient-${star}-${selectedYear}`)
        .attr("cx", "30%")
        .attr("cy", "30%");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.color(colorScale(star)).brighter(0.4))
        .attr("stop-opacity", 0.9);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorScale(star))
        .attr("stop-opacity", 0.8);
    });
    
    // 散点+动画效果
    const circles = g.selectAll("circle")
      .data(scatterData)
      .enter()
      .append("circle")
      .attr("cx", innerWidth / 2) // 从中心位置开始
      .attr("cy", innerHeight / 2)
      .attr("r", 0)
      .attr("fill", d => `url(#circle-gradient-${d.star}-${selectedYear})`)
      .attr("stroke", d => d.highlighted ? "#333" : "#fff")
      .attr("stroke-width", d => d.highlighted ? 3 : 2)
      .style("cursor", "pointer")
      .style("filter", "drop-shadow(0 3px 6px rgba(0,0,0,0.2))");
    
    // 散点移动到最终位置的动画
    circles.transition()
      .duration(1000)
      .delay((d, i) => 300 + i * 80)
      .ease(d3.easeBackOut)
      .attr("cx", d => xScale(d.price))
      .attr("cy", d => yScale(d.occupancy))
      .attr("r", d => rScale(d.count));
    
    // 鼠标悬停
    circles.on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", rScale(d.count) * 1.4)
          .attr("stroke-width", 4);
        
        // 淡化其他圆圈
        circles.style("opacity", circle => circle === d ? 1 : 0.3);
        
        // 显示提示框
        tooltip
          .style("opacity", 1)
          .html(`
            <div style="font-weight: bold; margin-bottom: 6px; color: ${colorScale(d.star)};">${d.city} - ${d.star}星级酒店</div>
            <div style="margin: 3px 0;">平均房价: ¥${d.price}/晚</div>
            <div style="margin: 3px 0;">入住率: ${d.occupancy}%</div>
            <div style="margin: 3px 0;">酒店数量: ${d.count}家</div>
            <div style="margin: 3px 0;">年份: ${selectedYear}</div>
            <div style="margin-top: 6px; color: #ffd54f; font-size: 11px;">⭐ 点击查看详情</div>
          `)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function(event, d) {
        // 还原圆圈大小和透明度
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", rScale(d.count))
          .attr("stroke-width", d => d.highlighted ? 3 : 2);
        
        circles.style("opacity", 1);
        tooltip.style("opacity", 0);
      })
      .on("click", function(event, d) {
        console.log(`Clicked on ${d.city} ${d.star}星级酒店 - ${selectedYear}年`);
        
        // 点击动画
        d3.select(this)
          .transition()
          .duration(150)
          .attr("r", rScale(d.count) * 1.6)
          .transition()
          .duration(150)
          .attr("r", rScale(d.count));
      });
    
    // 高亮的点添加城市标签
    const labels = g.selectAll(".city-label")
      .data(scatterData.filter(d => d.highlighted))
      .enter()
      .append("text")
      .attr("class", "city-label")
      .attr("x", d => xScale(d.price))
      .attr("y", d => yScale(d.occupancy) - rScale(d.count) - 12)
      .attr("text-anchor", "middle")
      .text(d => `${d.city}`)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#333")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .style("opacity", 0)
      .style("filter", "drop-shadow(0 1px 2px rgba(255,255,255,0.8))");
    
    // 标签淡入动画
    labels.transition()
      .delay(1500)
      .duration(400)
      .style("opacity", 1);
    
    // 年份标签
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .text(`价格与入住率关系 (${selectedYear}年)`)
      .style("font-size", "18px")
      .style("font-weight", "600")
      .style("fill", "#333")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif");
    
    // 副标题
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 48)
      .attr("text-anchor", "middle")
      .text("气泡大小表示酒店数量")
      .style("font-size", "12px")
      .style("fill", "#666")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif");
    
    // 坐标轴标题
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "400")
      .style("fill", "#333")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .text("平均房价 (元/晚)");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("fill", "#333")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .text("平均入住率 (%)");
    
    // 图例
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - margin.right + 40}, ${margin.top + 40})`);
    
    // 星级图例
    legend.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#333")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .text("酒店星级");
    
    // 星级图例数据
    const starLegend = [2, 3, 4, 5].map(star => {
      const sampleData = scatterData.find(d => d.star === star) || { count: 10 };
      return {
        star,
        color: colorScale(star),
        size: rScale(sampleData.count)
      };
    });
    
    // 星级图例项
    const starItems = legend.selectAll(".star-legend")
      .data(starLegend)
      .enter()
      .append("g")
      .attr("class", "star-legend")
      .attr("transform", (d, i) => `translate(0, ${20 + i * 25})`)
      .style("cursor", "pointer")
      .style("opacity", 0);
    
    // 星级图例项圆圈
    starItems.append("circle")
      .attr("cx", 8)
      .attr("cy", 0)
      .attr("r", 8)
      .attr("fill", d => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("opacity", 0.8)
      .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.1))");
    
    // 星级图例项文本
    starItems.append("text")
      .attr("x", 22)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", "#666")
      .style("font-weight", "500")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .text(d => `${d.star}星级`);
    
    // 星级图例动画
    starItems.transition()
      .delay((d, i) => 1800 + i * 100)
      .duration(400)
      .style("opacity", 1);
    
    // 酒店数量图例大小
    const sizeLegend = legend.append("g")
      .attr("transform", `translate(0, ${20 + 4 * 25 + 20})`)
      .style("opacity", 0);
    
    sizeLegend.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#333")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .text("酒店数量");
    
    // 圆圈图例数据
    const sizeData = [
      { label: "较少", size: rScale(10), value: "10家以下" },
      { label: "中等", size: rScale(20), value: "20-50家" },
      { label: "较多", size: rScale(40), value: "50家以上" }
    ];
    
    const sizeItems = sizeLegend.selectAll(".size-legend")
      .data(sizeData)
      .enter()
      .append("g")
      .attr("class", "size-legend")
      .attr("transform", (d, i) => `translate(0, ${20 + i * 25})`);
    
    sizeItems.append("circle")
      .attr("cx", 8)
      .attr("cy", 0)
      .attr("r", d => d.size)
      .attr("fill", "#bbb")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .style("opacity", 0.7);
    
    sizeItems.append("text")
      .attr("x", 22)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .style("font-size", "10px")
      .style("fill", "#666")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .text(d => d.value);
    
    // 图例动画
    sizeLegend.transition()
      .delay(2200)
      .duration(400)
      .style("opacity", 1);
    
    // 图例交互效果
    starItems.on("mouseover", function(event, d) {
        circles.style("opacity", circle => circle.star === d.star ? 1 : 0.2);
        d3.select(this).select("circle").style("opacity", 1).style("transform", "scale(1.2)");
      })
      .on("mouseout", function() {
        circles.style("opacity", 1);
        d3.select(this).select("circle").style("opacity", 0.8).style("transform", "scale(1)");
      });
    
    
    // 趋势线
    if (scatterData.length > 1) {
      // 线性回归趋势线
      const xValues = scatterData.map(d => d.price);
      const yValues = scatterData.map(d => d.occupancy);
      const n = xValues.length;
      const xMean = d3.mean(xValues);
      const yMean = d3.mean(yValues);
      
      const slope = d3.sum(xValues.map((x, i) => (x - xMean) * (yValues[i] - yMean))) / 
                   d3.sum(xValues.map(x => (x - xMean) ** 2));
      const intercept = yMean - slope * xMean;
      
      const trendLineData = [
        { x: d3.min(xValues), y: slope * d3.min(xValues) + intercept },
        { x: d3.max(xValues), y: slope * d3.max(xValues) + intercept }
      ];
      
      const trendLine = g.append("line")
        .attr("x1", xScale(trendLineData[0].x))
        .attr("y1", yScale(trendLineData[0].y))
        .attr("x2", xScale(trendLineData[0].x))
        .attr("y2", yScale(trendLineData[0].y))
        .style("stroke", "#ff9800")
        .style("stroke-width", 2)
        .style("stroke-dasharray", "5,5")
        .style("opacity", 0.6);
      
      trendLine.transition()
        .delay(2000)
        .duration(800)
        .attr("x2", xScale(trendLineData[1].x))
        .attr("y2", yScale(trendLineData[1].y));
      
      // 趋势线标签
      g.append("text")
        .attr("x", xScale(trendLineData[1].x) - 50)
        .attr("y", yScale(trendLineData[1].y) - 10)
        .style("font-size", "11px")
        .style("fill", "#ff9800")
        .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
        .style("opacity", 0)
        .text("趋势线")
        .transition()
        .delay(2500)
        .duration(400)
        .style("opacity", 1);
    }
  };
  
  return (
    <div 
      ref={chartRef} 
      className="chart"
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        overflow: 'hidden',
        opacity: isAnimating ? 0.7 : 1,
        transition: 'opacity 0.3s ease'
      }}
    />
  );
};

export default ScatterPlot;