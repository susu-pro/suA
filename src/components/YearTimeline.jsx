import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const YearTimeline = ({ 
  selectedYear, 
  onYearChange, 
  availableYears = ['2019', '2020', '2021', '2022', '2023', '2024'],
  autoPlay = false 
}) => {
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playSpeed, setPlaySpeed] = useState(3000);

  // 自动播放逻辑
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        const currentIndex = availableYears.indexOf(selectedYear);
        const nextIndex = (currentIndex + 1) % availableYears.length;
        onYearChange(availableYears[nextIndex]);
      }, playSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedYear, availableYears, onYearChange, playSpeed]);

  // 时间轴
  useEffect(() => {
    if (containerRef.current) {
      drawTimeline();
    }
  }, [selectedYear, availableYears, isPlaying]);

  const drawTimeline = () => {
    const container = d3.select(containerRef.current);
    container.selectAll("*").remove();

    // 容器宽度
    const containerWidth = containerRef.current.offsetWidth;
    const width = Math.max(containerWidth, 800);
    const height = 120;
    const margin = { top: 20, right: 80, bottom: 40, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // SVG
    const svg = container
      .append("svg")
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "transparent");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // 比例尺
    const xScale = d3.scalePoint()
      .domain(availableYears)
      .range([0, innerWidth])
      .padding(0.1);

    // 当前选中年份的索引
    const currentIndex = availableYears.indexOf(selectedYear);
    const progressWidth = currentIndex === 0 ? 0 : (currentIndex / (availableYears.length - 1)) * innerWidth;

    // 渐变
    const defs = svg.append("defs");
    
    // 进度条渐变
    const progressGradient = defs.append("linearGradient")
      .attr("id", `progress-gradient-${Date.now()}`)
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");
    
    progressGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#2196f3")
      .attr("stop-opacity", 1);
    
    progressGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#4caf50")
      .attr("stop-opacity", 1);

    // 背景轨道
    const trackY = innerHeight / 2;
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", trackY)
      .attr("y2", trackY)
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round");

    // 进度条
    const progressLine = g.append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", trackY)
      .attr("y2", trackY)
      .attr("stroke", `url(#progress-gradient-${Date.now()})`)
      .attr("stroke-width", 4)
      .attr("stroke-linecap", "round");

    // 动画进度条
    progressLine.transition()
      .duration(600)
      .ease(d3.easeQuadOut)
      .attr("x2", progressWidth);

    // 节点数据
    const nodeData = availableYears.map((year, i) => ({
      year,
      x: xScale(year),
      index: i,
      isSelected: year === selectedYear,
      isPast: i < currentIndex,
      isFuture: i > currentIndex
    }));

    // 年份标签
    const labelGroups = g.selectAll(".year-label-group")
      .data(nodeData)
      .enter()
      .append("g")
      .attr("class", "year-label-group")
      .attr("transform", d => `translate(${d.x}, ${trackY - 35})`)
      .style("cursor", "pointer");

    // 年份标签背景
    labelGroups.append("rect")
      .attr("x", -30)
      .attr("y", -12)
      .attr("width", 60)
      .attr("height", 24)
      .attr("rx", 12)
      .attr("fill", d => {
        if (d.isSelected) return "#2196f3";
        if (d.isPast) return "#e8f5e8";
        return "#f5f7fa";
      })
      .attr("stroke", d => {
        if (d.isSelected) return "#2196f3";
        if (d.isPast) return "#4caf50";
        return "#e0e0e0";
      })
      .attr("stroke-width", 1.5)
      .style("filter", d => d.isSelected ? "drop-shadow(0 4px 12px rgba(33,150,243,0.4))" : "none")
      .style("transform", d => d.isSelected ? "scale(1.1)" : "scale(1)")
      .style("transition", "all 0.3s ease");

    // 年份标签文字
    labelGroups.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .text(d => d.year)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", d => {
        if (d.isSelected) return "white";
        if (d.isPast) return "#4caf50";
        return "#666";
      })
      .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
      .style("pointer-events", "none");

    // 节点圆圈
    const nodes = g.selectAll(".timeline-node")
      .data(nodeData)
      .enter()
      .append("circle")
      .attr("class", "timeline-node")
      .attr("cx", d => d.x)
      .attr("cy", trackY)
      .attr("r", 0)
      .attr("fill", d => {
        if (d.isSelected) return "#2196f3";
        if (d.isPast) return "#4caf50";
        return "white";
      })
      .attr("stroke", d => {
        if (d.isSelected) return "#2196f3";
        if (d.isPast) return "#4caf50";
        return "#e0e0e0";
      })
      .attr("stroke-width", d => d.isSelected ? 3 : 2)
      .style("cursor", "pointer")
      .style("filter", "drop-shadow(0 2px 6px rgba(0,0,0,0.15))");

    // 动画节点出现
    nodes.transition()
      .duration(500)
      .delay((d, i) => i * 80)
      .ease(d3.easeBackOut)
      .attr("r", d => d.isSelected ? 10 : 6);

    // 选中节点的内圈
    g.selectAll(".selected-inner")
      .data(nodeData.filter(d => d.isSelected))
      .enter()
      .append("circle")
      .attr("class", "selected-inner")
      .attr("cx", d => d.x)
      .attr("cy", trackY)
      .attr("r", 0)
      .attr("fill", "white")
      .transition()
      .delay(600)
      .duration(300)
      .attr("r", 3);

    // 播放状态动画效果
    if (isPlaying) {
      const selectedNode = nodeData.find(d => d.isSelected);
      if (selectedNode) {
        const pulseRing = g.append("circle")
          .attr("cx", selectedNode.x)
          .attr("cy", trackY)
          .attr("r", 10)
          .attr("fill", "none")
          .attr("stroke", "#2196f3")
          .attr("stroke-width", 2)
          .style("opacity", 0.8);

        const pulse = () => {
          pulseRing
            .attr("r", 10)
            .style("opacity", 0.8)
            .transition()
            .duration(1000)
            .attr("r", 18)
            .style("opacity", 0)
            .on("end", pulse);
        };
        pulse();
      }
    }

    // 交互
    labelGroups.on("click", function(event, d) {
      onYearChange(d.year);
      if (isPlaying) setIsPlaying(false);
    })
    .on("mouseover", function(event, d) {
      if (!d.isSelected) {
        d3.select(this).select("rect")
          .transition()
          .duration(200)
          .style("transform", "scale(1.05)")
          .attr("fill", "#f0f8ff")
          .attr("stroke", "#2196f3");
        
        d3.select(this).select("text")
          .transition()
          .duration(200)
          .attr("fill", "#2196f3");
      }
    })
    .on("mouseout", function(event, d) {
      if (!d.isSelected) {
        d3.select(this).select("rect")
          .transition()
          .duration(200)
          .style("transform", "scale(1)")
          .attr("fill", d.isPast ? "#e8f5e8" : "#f5f7fa")
          .attr("stroke", d.isPast ? "#4caf50" : "#e0e0e0");
        
        d3.select(this).select("text")
          .transition()
          .duration(200)
          .attr("fill", d.isPast ? "#4caf50" : "#666");
      }
    });

    nodes.on("click", function(event, d) {
      onYearChange(d.year);
      if (isPlaying) setIsPlaying(false);
    })
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", d.isSelected ? 12 : 8);
    })
    .on("mouseout", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", d.isSelected ? 10 : 6);
    });
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleQuickNav = (direction) => {
    const currentIndex = availableYears.indexOf(selectedYear);
    let newIndex;
    
    switch(direction) {
      case 'first':
        newIndex = 0;
        break;
      case 'prev':
        newIndex = Math.max(0, currentIndex - 1);
        break;
      case 'next':
        newIndex = Math.min(availableYears.length - 1, currentIndex + 1);
        break;
      case 'last':
        newIndex = availableYears.length - 1;
        break;
      default:
        return;
    }
    
    onYearChange(availableYears[newIndex]);
    if (isPlaying) setIsPlaying(false);
  };

  return (
    <div style={{
      width: '100%',
      margin: '25px 0',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e0e0e0',
      overflow: 'hidden'
    }}>
      {/* 控制栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 25px 15px',
        borderBottom: '1px solid #f5f7fa',
        backgroundColor: '#fafbfc'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#2196f3',
            margin: 0,
            fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
          }}>年份时间轴</h3>
          <span style={{
            fontSize: '14px',
            color: '#666',
            fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
          }}></span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select 
            value={playSpeed} 
            onChange={(e) => setPlaySpeed(Number(e.target.value))}
            style={{
              padding: '4px 8px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              fontSize: '12px',
              backgroundColor: 'white',
              color: '#666'
            }}
          >
            <option value={800}>快速</option>
            <option value={3000}>正常</option>
            <option value={4500}>慢速</option>
          </select>
          
          <button
            onClick={togglePlay}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer',
              backgroundColor: isPlaying ? '#e91e63' : '#2196f3',
              color: 'white',
              fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
            }}
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`} style={{fontSize: '10px'}}></i>
            {isPlaying ? '暂停' : '播放'}
          </button>
        </div>
      </div>

      {/* 时间轴 */}
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%',
          padding: '20px 0',
          backgroundColor: 'white'
        }}
      ></div>

      {/* 快捷控制 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        padding: '15px 25px 20px',
        backgroundColor: '#fafbfc',
        borderTop: '1px solid #f5f7fa'
      }}>
        <button
          onClick={() => handleQuickNav('first')}
          disabled={selectedYear === availableYears[0]}
          style={{
            padding: '6px 10px',
            fontSize: '12px',
            color: '#666',
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            cursor: selectedYear === availableYears[0] ? 'not-allowed' : 'pointer',
            opacity: selectedYear === availableYears[0] ? 0.5 : 1
          }}
        >
          <i className="fas fa-fast-backward"></i> 最早
        </button>
        <button
          onClick={() => handleQuickNav('prev')}
          disabled={selectedYear === availableYears[0]}
          style={{
            padding: '6px 10px',
            fontSize: '12px',
            color: '#666',
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            cursor: selectedYear === availableYears[0] ? 'not-allowed' : 'pointer',
            opacity: selectedYear === availableYears[0] ? 0.5 : 1
          }}
        >
          <i className="fas fa-step-backward"></i> 上一年
        </button>
        <button
          onClick={() => handleQuickNav('next')}
          disabled={selectedYear === availableYears[availableYears.length - 1]}
          style={{
            padding: '6px 10px',
            fontSize: '12px',
            color: '#666',
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            cursor: selectedYear === availableYears[availableYears.length - 1] ? 'not-allowed' : 'pointer',
            opacity: selectedYear === availableYears[availableYears.length - 1] ? 0.5 : 1
          }}
        >
          下一年 <i className="fas fa-step-forward"></i>
        </button>
        <button
          onClick={() => handleQuickNav('last')}
          disabled={selectedYear === availableYears[availableYears.length - 1]}
          style={{
            padding: '6px 10px',
            fontSize: '12px',
            color: '#666',
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            cursor: selectedYear === availableYears[availableYears.length - 1] ? 'not-allowed' : 'pointer',
            opacity: selectedYear === availableYears[availableYears.length - 1] ? 0.5 : 1
          }}
        >
          最新 <i className="fas fa-fast-forward"></i>
        </button>
      </div>

      {/* 当前状态提示 */}
      <div style={{
        textAlign: 'center',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        fontSize: '13px',
        color: '#666',
        fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif'
      }}>
        当前查看 <strong style={{color: '#2196f3'}}>{selectedYear}</strong> 年数据
        {isPlaying && (
          <span style={{ marginLeft: '8px', color: '#4caf50' }}>
            • 自动播放中
          </span>
        )}
      </div>
    </div>
  );
};

export default YearTimeline;