/**
 * Heatmap View (MVCR - View Layer)
 * Renders the 52-week GitHub activity matrix and interactive tooltips
 */

export function renderGitHubHeatmap(gridId = 'github-heatmap-grid') {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  grid.innerHTML = '';

  let tooltip = document.querySelector('.heatmap-floating-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'heatmap-floating-tooltip';
    document.body.appendChild(tooltip);
  }

  const TOTAL_WEEKS = 52;
  const DAYS_PER_WEEK = 7;
  const endDate = new Date(2026, 8, 19); // Sep 19, 2026

  const activityMap = {
    '27-1': 1,
    '27-3': 1,
    '39-5': 1,
    '43-3': 1,
    '44-5': 2,
    '48-5': 1,
    '48-6': 2,
    '49-2': 1,
    '49-4': 4,
    '50-1': 1,
    '51-3': 2,
    '51-5': 3,
    '52-1': 4,
    '52-2': 2,
    '52-3': 1
  };

  function updateTooltipPos(e) {
    tooltip.style.left = `${e.clientX}px`;
    tooltip.style.top = `${e.clientY}px`;
  }

  for (let d = 0; d < DAYS_PER_WEEK; d++) {
    for (let w = 0; w < TOTAL_WEEKS; w++) {
      const cell = document.createElement('div');
      cell.className = 'heat-cell';

      const key = `${w + 1}-${d}`;
      const count = activityMap[key] || 0;

      let level = 0;
      if (count >= 4) level = 4;
      else if (count === 3) level = 3;
      else if (count === 2) level = 2;
      else if (count === 1) level = 1;

      cell.classList.add(`l${level}`);

      const daysBack = ((TOTAL_WEEKS - 1 - w) * 7) + (6 - d);
      const cellDate = new Date(endDate.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      const dateString = cellDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      cell.setAttribute('data-date', dateString);
      cell.setAttribute('data-count', String(count));

      cell.addEventListener('mouseenter', (e) => {
        const c = parseInt(cell.getAttribute('data-count'), 10);
        const dt = cell.getAttribute('data-date');
        const text = c === 0 ? `No contributions on ${dt}` : `${c} contribution${c > 1 ? 's' : ''} on ${dt}`;
        tooltip.textContent = text;
        tooltip.classList.add('visible');
        updateTooltipPos(e);
      });

      cell.addEventListener('mousemove', updateTooltipPos);

      cell.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
      });

      grid.appendChild(cell);
    }
  }
}
