import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const RoseChart = ({ data, selectedCity, selectedYear, onYearChange }) => {
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
    
    // 过滤选中城市的数据
    const cityData = data.filter(d => d[0] === selectedCity);
    
    // 准备数据
    const roseData = cityData.map(d => ({
      star: d[1],           // 星级
      starLabel: `${d[1]}星级`,  // 星级标签
      price: d[3],          // 价格
      count: d[2],          // 酒店数量
      occupancy: d[4]       // 入住率
    })).sort((a, b) => a.star - b.star);
    
    // 图表尺寸（为时间轴留出空间）
    const width = 500;
    const height = 480; 
    const margin = 60;
    const radius = Math.min(width, height - 100) / 2 - margin; 
    
    // SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "#fafafa")
      .style("border-radius", "8px");
    
    const g = svg.append("g")
      .attr("transform", `translate(${width/2}, ${(height-80)/2 + 20})`); 
    
    // 配色
    const colorScale = d3.scaleOrdinal()
      .domain([2, 3, 4, 5])
      .range(['#9c27b0', '#2196f3', '#4caf50', '#e91e63']);
    
    // 基于价格的半径
    const maxPrice = d3.max(roseData, d => d.price);
    const radiusScale = d3.scaleLinear()
      .domain([0, maxPrice])
      .range([radius * 0.15, radius * 0.85]);
    
    // 角度比例尺——等分扇形
    const angleScale = d3.scaleLinear()
      .domain([0, roseData.length])
      .range([0, 2 * Math.PI]);
    
    // 渐变
    const defs = svg.append("defs");
    
    roseData.forEach(d => {
      const gradient = defs.append("radialGradient")
        .attr("id", `rose-gradient-${d.star}-${selectedYear}`)
        .attr("cx", "30%")
        .attr("cy", "30%");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.color(colorScale(d.star)).brighter(0.5))
        .attr("stop-opacity", 0.9);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorScale(d.star))
        .attr("stop-opacity", 0.8);
    });
    
    // 提示框
    const tooltip = d3.select("body").selectAll(".rose-tooltip")
      .data([0])
      .join("div")
      .attr("class", "rose-tooltip")
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
    
    // 同心圆作为参考线
    const referenceRadii = [0.3, 0.5, 0.7].map(r => r * radius);
    const referenceCircles = g.selectAll(".reference-circle")
      .data(referenceRadii)
      .enter()
      .append("circle")
      .attr("class", "reference-circle")
      .attr("r", 0)
      .attr("fill", "none")
      .attr("stroke", "#e8e8e8")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .style("opacity", 0);
    
    // 参考圆动画
    referenceCircles.transition()
      .delay((d, i) => i * 200)
      .duration(800)
      .attr("r", d => d)
      .style("opacity", 0.6);
    
    // 弧线生成器
    const arc = d3.arc()
      .innerRadius(radius * 0.15)
      .outerRadius(d => radiusScale(d.data.price))
      .startAngle((d, i) => angleScale(i) - angleScale(1) / 2)
      .endAngle((d, i) => angleScale(i) + angleScale(1) / 2)
      .cornerRadius(4);
    
    // 带动画的弧形
    const arcs = g.selectAll(".arc")
      .data(roseData)
      .enter()
      .append("path")
      .attr("class", "arc")
      .attr("d", d => {
        // 开始时只有内半径
        const startArc = d3.arc()
          .innerRadius(radius * 0.15)
          .outerRadius(radius * 0.15)
          .startAngle((d, i) => angleScale(roseData.indexOf(d)) - angleScale(1) / 2)
          .endAngle((d, i) => angleScale(roseData.indexOf(d)) + angleScale(1) / 2);
        return startArc(d);
      })
      .attr("fill", d => `url(#rose-gradient-${d.star}-${selectedYear})`)
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .style("cursor", "pointer")
      .style("filter", "drop-shadow(0 3px 8px rgba(0,0,0,0.2))");
    
    // 弧形扩展动画，错开时间
    arcs.transition()
      .duration(1200)
      .delay((d, i) => 500 + i * 250)
      .ease(d3.easeBackOut)
      .attr("d", (d, i) => {
        const finalArc = d3.arc()
          .innerRadius(radius * 0.15)
          .outerRadius(radiusScale(d.price))
          .startAngle(angleScale(i) - angleScale(1) / 2)
          .endAngle(angleScale(i) + angleScale(1) / 2)
          .cornerRadius(4);
        return finalArc(d);
      });
    
    // 鼠标悬停
    arcs.on("mouseover", function(event, d) {
        // 放大当前弧形
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 0.9)
          .attr("transform", "scale(1.06)");
        
        // 淡化其他弧形
        arcs.style("opacity", arc => arc === d ? 0.9 : 0.4);
        
        // 提示框
        tooltip
          .style("opacity", 1)
          .html(`
            <div style="font-weight: bold; margin-bottom: 6px; color: ${colorScale(d.star)};">${selectedCity} - ${d.starLabel}</div>
            <div style="margin: 3px 0;">平均房价: ¥${d.price}/晚</div>
            <div style="margin: 3px 0;">酒店数量: ${d.count}家</div>
            <div style="margin: 3px 0;">入住率: ${d.occupancy}%</div>
            <div style="margin: 3px 0;">年份: ${selectedYear}</div>
          `)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        // 恢复弧形大小
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 0.8)
          .attr("transform", "scale(1)");
        
        // 恢复所有弧形透明度
        arcs.style("opacity", 0.8);
        // 隐藏提示框
        tooltip.style("opacity", 0);
      });
    
    // 带连接线的标签
    const labelGroup = g.append("g").attr("class", "labels");
    
    roseData.forEach((d, i) => {
      const angle = angleScale(i);
      const outerRadius = radiusScale(d.price);
      const labelRadius = outerRadius + 30;
      
      // 标签连接线
      const labelLine = labelGroup.append("line")
        .attr("x1", Math.sin(angle) * outerRadius)
        .attr("y1", -Math.cos(angle) * outerRadius)
        .attr("x2", Math.sin(angle) * outerRadius) 
        .attr("y2", -Math.cos(angle) * outerRadius)
        .style("stroke", "#999")
        .style("stroke-width", 1.5)
        .style("opacity", 0);
      
      // 连接线延伸动画
      labelLine.transition()
        .delay(1500 + i * 250)
        .duration(400)
        .attr("x2", Math.sin(angle) * labelRadius)
        .attr("y2", -Math.cos(angle) * labelRadius)
        .style("opacity", 0.7);
      
      // 标签背景
      const label = labelGroup.append("g")
        .attr("transform", `translate(${Math.sin(angle) * (labelRadius + 15)}, ${-Math.cos(angle) * (labelRadius + 15)})`)
        .style("opacity", 0);
      
      // 标签背景框
      label.append("rect")
        .attr("x", Math.sin(angle) > 0 ? 0 : -70)
        .attr("y", -12)
        .attr("width", 70)
        .attr("height", 24)
        .attr("rx", 4)
        .attr("fill", "rgba(255, 255, 255, 0.9)")
        .attr("stroke", colorScale(d.star))
        .attr("stroke-width", 1);
      
      // 标签文字——星级
      label.append("text")
        .attr("x", Math.sin(angle) > 0 ? 35 : -35)
        .attr("y", -2)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-weight", "600")
        .style("fill", colorScale(d.star))
        .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
        .text(d.starLabel);
      
      // 标签文字——价格
      label.append("text")
        .attr("x", Math.sin(angle) > 0 ? 35 : -35)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("font-weight", "400")
        .style("fill", "#666")
        .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
        .text(`¥${d.price}`);
      
      // 标签淡入动画
      label.transition()
        .delay(1500 + i * 250)
        .duration(400)
        .style("opacity", 1);
    });
    
    // 中心圆形显示城市名称
    const centerCircle = g.append("circle")
      .attr("r", 0)
      .attr("fill", "url(#center-gradient)")
      .attr("stroke", "#fff")
      .attr("stroke-width", 4)
      .style("filter", "drop-shadow(0 2px 6px rgba(0,0,0,0.2))");
    
    // 中心圆扩展动画
    centerCircle.transition()
      .delay(300)
      .duration(600)
      .attr("r", radius * 0.15);
    
    // 中心渐变定义
    const centerGradient = defs.append("radialGradient")
      .attr("id", "center-gradient");
    
    centerGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#fff")
      .attr("stop-opacity", 1);
    
    centerGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#f0f2f5")
      .attr("stop-opacity", 1);
    
    // 中心文字
    const centerText = g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", "#333")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .style("opacity", 0)
      .text(selectedCity);
    
    // 中心文字淡入动画
    centerText.transition()
      .delay(800)
      .duration(400)
      .style("opacity", 1);
    
    // 包含年份的标题
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .text(`${selectedCity}酒店价格分布 (${selectedYear}年)`)
      .style("font-size", "18px")
      .style("font-weight", "600")
      .style("fill", "#333")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif");
    // 副标题
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 48)
      .attr("text-anchor", "middle")
      .text("花瓣长度表示平均房价")
      .style("font-size", "12px")
      .style("fill", "#666")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif");
    
    // 价格比例尺
    const scaleIndicator = svg.append("g")
      .attr("transform", `translate(${width - 110}, 80)`);
    
    // 背景框
    scaleIndicator.append("rect")
      .attr("x", -10)
      .attr("y", -10)
      .attr("width", 100)
      .attr("height", 80)
      .attr("rx", 6)
      .attr("fill", "rgba(255, 255, 255, 0.9)")
      .attr("stroke", "#e8e8e8")
      .attr("stroke-width", 1);
    
    // 标题
    scaleIndicator.append("text")
      .attr("x", 40)
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#333")
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .text("价格范围");
    
    // 价格范围数据
    const priceRange = [
      { label: "¥0", radius: 3 },
      { label: `¥${Math.round(maxPrice/2)}`, radius: 6 },
      { label: `¥${maxPrice}`, radius: 9 }
    ];
    
    // 价格范围指示器
    priceRange.forEach((item, i) => {
      // 指示器圆点
      scaleIndicator.append("circle")
        .attr("cx", 15)
        .attr("cy", 20 + i * 18)
        .attr("r", 0)
        .attr("fill", "#ddd")
        .attr("stroke", "#999")
        .attr("stroke-width", 1)
        .transition()
        .delay(2000 + i * 100)
        .duration(300)
        .attr("r", item.radius);
      
      // 指示器文字
      scaleIndicator.append("text")
        .attr("x", 35)
        .attr("y", 20 + i * 18)
        .attr("dy", "0.35em")
        .style("font-size", "10px")
        .style("fill", "#666")
        .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
        .style("opacity", 0)
        .text(item.label)
        .transition()
        .delay(2000 + i * 100)
        .duration(300)
        .style("opacity", 1);
    });
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

export default RoseChart;