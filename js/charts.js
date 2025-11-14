// SVG Chart generation module

// Create an SVG element with attributes
export function createSVGElement(type, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', type);
    
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    
    return element;
}

// Create XP progress chart (line chart with time axis)
export function createXPChart(data, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="text-gray-600 text-center py-8">No XP data available</p>';
        return;
    }
    
    // Group XP by month and calculate cumulative
    const groupedData = groupXPByMonthCumulative(data);
    
    // Chart dimensions
    const width = container.clientWidth || 600;
    const height = 400;
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    // Create SVG
    const svg = createSVGElement('svg', {
        width: '100%',
        height: height,
        viewBox: `0 0 ${width} ${height}`,
        class: 'xp-chart'
    });
    
    // Find max XP for scaling
    const maxXP = Math.floor(Math.max(...groupedData.map(d => d.cumulative)));
    const pointSpacing = chartWidth / (groupedData.length - 1 || 1);
    
    // Draw axes
    const axesGroup = createSVGElement('g', { class: 'axes' });
    
    // Y-axis
    const yAxis = createSVGElement('line', {
        x1: padding.left,
        y1: padding.top,
        x2: padding.left,
        y2: height - padding.bottom,
        stroke: '#e2e8f0',
        'stroke-width': 2
    });
    axesGroup.appendChild(yAxis);
    
    // X-axis
    const xAxis = createSVGElement('line', {
        x1: padding.left,
        y1: height - padding.bottom,
        x2: width - padding.right,
        y2: height - padding.bottom,
        stroke: '#e2e8f0',
        'stroke-width': 2
    });
    axesGroup.appendChild(xAxis);
    
    // Y-axis labels
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
        const y = padding.top + (chartHeight / ySteps) * i;
        const value = Math.floor(maxXP * (1 - i / ySteps) / 1000);
        
        const label = createSVGElement('text', {
            x: padding.left - 10,
            y: y + 5,
            'text-anchor': 'end',
            class: 'text-xs',
            fill: '#475569',
            style: 'font-family: Montserrat, sans-serif;'
        });
        label.textContent = formatNumber(value);
        axesGroup.appendChild(label);
        
        // Grid line
        const gridLine = createSVGElement('line', {
            x1: padding.left,
            y1: y,
            x2: width - padding.right,
            y2: y,
            stroke: '#f1f5f9',
            'stroke-width': 1
        });
        axesGroup.appendChild(gridLine);
    }
    
    svg.appendChild(axesGroup);
    
    // Draw line chart
    const lineGroup = createSVGElement('g', { class: 'line-chart' });
    
    // Create path for line
    const pathData = groupedData.map((item, index) => {
        const x = padding.left + index * pointSpacing;
        const y = padding.top + chartHeight - (item.cumulative / maxXP) * chartHeight;
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
    
    const linePath = createSVGElement('path', {
        d: pathData,
        fill: 'none',
        stroke: 'url(#lineGradient)',
        'stroke-width': 3,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    });
    lineGroup.appendChild(linePath);
    
    // Draw area under the line
    const areaData = pathData + 
        ` L ${padding.left + (groupedData.length - 1) * pointSpacing} ${height - padding.bottom}` +
        ` L ${padding.left} ${height - padding.bottom} Z`;
    
    const areaPath = createSVGElement('path', {
        d: areaData,
        fill: 'url(#areaGradient)',
        opacity: 0.3
    });
    lineGroup.insertBefore(areaPath, lineGroup.firstChild);
    
    // Store circles and tooltips separately to control z-index
    const circlesData = [];
    const tooltipsData = [];
    
    // Prepare circles and tooltips data
    groupedData.forEach((item, index) => {
        const x = padding.left + index * pointSpacing;
        const y = padding.top + chartHeight - (item.cumulative / maxXP) * chartHeight;
        
        circlesData.push({ x, y, item, index });
    });
    
    // Draw points first
    circlesData.forEach(({ x, y, item, index }) => {
        // Point circle
        const circle = createSVGElement('circle', {
            cx: x,
            cy: y,
            r: 5,
            fill: '#1e40af',
            stroke: '#EBEFEF',
            'stroke-width': 2,
            class: 'point'
        });
        circle.style.cursor = 'pointer';
        
        // Create tooltip
        const tooltip = createSVGElement('g', {
            class: 'tooltip',
            style: 'opacity: 0; pointer-events: none;'
        });
        
        const tooltipBg = createSVGElement('rect', {
            x: x - 50,
            y: y - 55,
            width: 100,
            height: 40,
            fill: '#1e293b',
            rx: 6,
            opacity: 0.95,
            stroke: '#475569',
            'stroke-width': 1
        });
        
        const tooltipText = createSVGElement('text', {
            x: x,
            y: y - 38,
            'text-anchor': 'middle',
            class: 'text-xs font-semibold',
            fill: '#FFFFFF',
            style: 'font-family: Montserrat, sans-serif;'
        });
        tooltipText.textContent = `${item.month}`;
        
        const tooltipValue = createSVGElement('text', {
            x: x,
            y: y - 22,
            'text-anchor': 'middle',
            class: 'text-xs',
            fill: '#FFFFFF',
            style: 'font-family: Montserrat, sans-serif;'
        });
        tooltipValue.textContent = `${formatNumber(Math.floor(item.cumulative / 1000))} k`;
        
        tooltip.appendChild(tooltipBg);
        tooltip.appendChild(tooltipText);
        tooltip.appendChild(tooltipValue);
        
        circle.addEventListener('mouseenter', () => {
            circle.setAttribute('r', 7);
            tooltip.style.opacity = '1';
        });
        
        circle.addEventListener('mouseleave', () => {
            circle.setAttribute('r', 5);
            tooltip.style.opacity = '0';
        });
        
        lineGroup.appendChild(circle);
        tooltipsData.push(tooltip);
        
        // X-axis label (show every 3 months)
        if (index % 3 === 0 || index === circlesData.length - 1) {
            const label = createSVGElement('text', {
                x: x,
                y: height - padding.bottom + 20,
                'text-anchor': 'middle',
                class: 'text-xs',
                fill: '#475569',
                style: 'font-family: Montserrat, sans-serif;'
            });
            label.textContent = item.shortMonth;
            lineGroup.appendChild(label);
        }
    });
    
    // Append all tooltips after circles to ensure they render on top
    tooltipsData.forEach(tooltip => {
        lineGroup.appendChild(tooltip);
    });
    
    // Add gradient definitions
    const defs = createSVGElement('defs');
    
    // Line gradient
    const lineGradient = createSVGElement('linearGradient', {
        id: 'lineGradient',
        x1: '0%',
        y1: '0%',
        x2: '100%',
        y2: '0%'
    });
    const lineStop1 = createSVGElement('stop', {
        offset: '0%',
        'stop-color': '#1e40af'
    });
    const lineStop2 = createSVGElement('stop', {
        offset: '100%',
        'stop-color': '#1e40af'
    });
    lineGradient.appendChild(lineStop1);
    lineGradient.appendChild(lineStop2);
    defs.appendChild(lineGradient);
    
    // Area gradient
    const areaGradient = createSVGElement('linearGradient', {
        id: 'areaGradient',
        x1: '0%',
        y1: '0%',
        x2: '0%',
        y2: '100%'
    });
    const areaStop1 = createSVGElement('stop', {
        offset: '0%',
        'stop-color': '#1e40af',
        'stop-opacity': '0.4'
    });
    const areaStop2 = createSVGElement('stop', {
        offset: '100%',
        'stop-color': '#1e40af',
        'stop-opacity': '0.1'
    });
    areaGradient.appendChild(areaStop1);
    areaGradient.appendChild(areaStop2);
    defs.appendChild(areaGradient);
    
    svg.appendChild(defs);
    svg.appendChild(lineGroup);
    
    // Chart title
    const title = createSVGElement('text', {
        x: width / 2,
        y: 25,
        'text-anchor': 'middle',
        class: 'text-sm font-semibold',
        fill: '#1e293b',
        style: 'font-family: Montserrat, sans-serif;'
    });
    svg.appendChild(title);
    
    container.appendChild(svg);
}

// Create skills radar/spider chart
export function createSkillsRadarChart(skillsData, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (!skillsData || skillsData.length === 0) {
        container.innerHTML = '<p class="text-gray-600 text-center py-8">No skills data available</p>';
        return;
    }
    
    const size = Math.min(container.clientWidth || 400, 450);
    const center = size / 2;
    const radius = size * 0.32;
    const levels = 5;
    
    // Create SVG
    const svg = createSVGElement('svg', {
        width: '100%',
        height: size,
        viewBox: `0 0 ${size} ${size}`,
        class: 'skills-radar-chart'
    });
    
    // Ensure exactly 7 skills
    const numAxes = 8;
    const angleStep = (2 * Math.PI) / numAxes;
    
    // Draw background circles (levels)
    const levelsGroup = createSVGElement('g', { class: 'levels' });
    
    for (let level = 1; level <= levels; level++) {
        const levelRadius = (radius / levels) * level;
        const circle = createSVGElement('circle', {
            cx: center,
            cy: center,
            r: levelRadius,
            fill: 'none',
            stroke: '#e2e8f0',
            'stroke-width': 1
        });
        levelsGroup.appendChild(circle);
    }
    
    svg.appendChild(levelsGroup);
    
    // Use fixed max of 100 for consistent scaling
    const maxScale = 100;
    
    // Draw axes and labels
    const axesGroup = createSVGElement('g', { class: 'axes' });
    const points = [];
    
    skillsData.forEach((skill, index) => {
        const angle = angleStep * index - Math.PI / 2; // Start from top
        
        // Axis line
        const endX = center + radius * Math.cos(angle);
        const endY = center + radius * Math.sin(angle);
        
        const axis = createSVGElement('line', {
            x1: center,
            y1: center,
            x2: endX,
            y2: endY,
            stroke: '#cbd5e1',
            'stroke-width': 1
        });
        axesGroup.appendChild(axis);
        
        // Label without value
        const labelDistance = radius + 30;
        const labelX = center + labelDistance * Math.cos(angle);
        const labelY = center + labelDistance * Math.sin(angle);
        
        const label = createSVGElement('text', {
            x: labelX,
            y: labelY,
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            class: 'text-xs font-semibold',
            fill: '#1e293b',
            style: 'font-family: Montserrat, sans-serif;'
        });
        label.textContent = skill.name;
        axesGroup.appendChild(label);
        
        // Calculate point position (scale to 0-100)
        const skillValue = Math.min(skill.value || 0, maxScale);
        const pointRadius = (skillValue / maxScale) * radius;
        const pointX = center + pointRadius * Math.cos(angle);
        const pointY = center + pointRadius * Math.sin(angle);
        
        points.push({ x: pointX, y: pointY, value: skill.value || 0 });
    });
    
    svg.appendChild(axesGroup);
    
    // Draw filled polygon
    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
    
    const polygon = createSVGElement('polygon', {
        points: polygonPoints,
        fill: 'rgba(30, 64, 175, 0.2)',
        stroke: '#1e40af',
        'stroke-width': 2
    });
    
    svg.appendChild(polygon);
    
    // Draw points
    const pointsGroup = createSVGElement('g', { class: 'points' });
    
    // Store references to circles and labels for cross-interaction
    const circleRefs = [];
    const tooltipRefs = [];
    
    points.forEach((point, index) => {
        const circle = createSVGElement('circle', {
            cx: point.x,
            cy: point.y,
            r: 4,
            fill: '#1e40af',
            stroke: '#EBEFEF',
            'stroke-width': 2
        });
        
        circle.style.cursor = 'pointer';
        circle.style.transition = 'r 0.2s ease';
        
        circleRefs.push(circle);
        pointsGroup.appendChild(circle);
    });
    
    svg.appendChild(pointsGroup);
    
    // Create tooltips group (separate from points to ensure proper z-index)
    const tooltipsGroup = createSVGElement('g', { class: 'tooltips' });
    
    points.forEach((point, index) => {
        // Create tooltip for this point
        const tooltip = createSVGElement('g', {
            class: 'skill-tooltip',
            style: 'opacity: 0; pointer-events: none;'
        });
        
        const tooltipBg = createSVGElement('rect', {
            x: point.x - 30,
            y: point.y - 40,
            width: 60,
            height: 28,
            fill: '#1e293b',
            rx: 6,
            opacity: 0.95,
            stroke: '#475569',
            'stroke-width': 1
        });
        
        const tooltipValue = createSVGElement('text', {
            x: point.x,
            y: point.y - 22,
            'text-anchor': 'middle',
            class: 'text-sm font-semibold',
            fill: '#FFFFFF',
            style: 'font-family: Montserrat, sans-serif;'
        });
        tooltipValue.textContent = `${Math.round(skillsData[index].value)}%`;
        
        tooltip.appendChild(tooltipBg);
        tooltip.appendChild(tooltipValue);
        
        tooltipRefs.push(tooltip);
        tooltipsGroup.appendChild(tooltip);
    });
    
    svg.appendChild(tooltipsGroup);
    
    // Add hover effects to labels (stored from earlier)
    skillsData.forEach((skill, index) => {
        const angle = angleStep * index - Math.PI / 2;
        const labelDistance = radius + 30;
        const labelX = center + labelDistance * Math.cos(angle);
        const labelY = center + labelDistance * Math.sin(angle);
        
        // Find the label element that was created earlier
        const labels = axesGroup.querySelectorAll('text');
        const label = labels[index];
        
        if (label) {
            label.style.cursor = 'pointer';
            label.style.transition = 'all 0.2s ease';
            
            // Hover on label affects corresponding circle and shows tooltip
            label.addEventListener('mouseenter', () => {
                circleRefs[index].setAttribute('r', 6);
                label.setAttribute('fill', '#1e40af');
                tooltipRefs[index].style.opacity = '1';
            });
            
            label.addEventListener('mouseleave', () => {
                circleRefs[index].setAttribute('r', 4);
                label.setAttribute('fill', '#1e293b');
                tooltipRefs[index].style.opacity = '0';
            });
        }
    });
    
    // Add hover effects to circles
    circleRefs.forEach((circle, index) => {
        const labels = axesGroup.querySelectorAll('text');
        const label = labels[index];
        
        circle.addEventListener('mouseenter', () => {
            circle.setAttribute('r', 6);
            tooltipRefs[index].style.opacity = '1';
            if (label) {
                label.setAttribute('fill', '#1e40af');
            }
        });
        
        circle.addEventListener('mouseleave', () => {
            circle.setAttribute('r', 4);
            tooltipRefs[index].style.opacity = '0';
            if (label) {
                label.setAttribute('fill', '#1e293b');
            }
        });
    });
    
    container.appendChild(svg);
}

// Group XP transactions by month with cumulative totals
function groupXPByMonthCumulative(transactions) {
    // Filter out piscine exercises (same logic as getTotalXP)
    const filteredTransactions = transactions.filter(t => {
        const path = t.path?.toLowerCase() || '';
        const objectType = t.object?.type?.toLowerCase() || '';
        
        // If path contains piscine-go, piscine-js, or piscine-ux
        if (path.includes('piscine-go') || path.includes('piscine-js') || path.includes('piscine-ux')) {
            // Exclude only if it's an exercise (keep piscine/module/raid/project rewards)
            return objectType !== 'exercise';
        }
        
        // Keep all other transactions
        return true;
    });
    
    const grouped = new Map();
    
    filteredTransactions.forEach(transaction => {
        const date = new Date(transaction.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        const shortMonth = date.toLocaleDateString('en-US', { year: '2-digit', month: 'short' }); // "Oct 24"
        
        if (grouped.has(monthKey)) {
            grouped.get(monthKey).xp += transaction.amount;
        } else {
            grouped.set(monthKey, {
                month: monthLabel,
                shortMonth: shortMonth,
                xp: transaction.amount,
                key: monthKey
            });
        }
    });
    
    // Convert to array and sort by date
    const sortedData = Array.from(grouped.values()).sort((a, b) => a.key.localeCompare(b.key));
    
    // Calculate cumulative XP
    let cumulative = 0;
    return sortedData.map(item => {
        cumulative += item.xp;
        return {
            ...item,
            cumulative: Math.floor(cumulative)
        };
    });
}

// Format number with thousand separators
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

