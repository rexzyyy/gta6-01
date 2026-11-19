export const MAP = { w: 2400, h: 1800, road: 104, block: 296, margin: 34 };
export const COLORS = { grass: '#80a86d', road: '#626d6a', walk: '#d7c49c', sand: '#dfc38d', water: '#5ca9b1' };

export function makeCity() {
  const buildings = [];
  const parks = [];
  const rows = 4, cols = 5;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const bx = MAP.road + x * (MAP.block + MAP.road);
    const by = MAP.road + y * (MAP.block + MAP.road);
    if ((x === 1 && y === 2) || (x === 3 && y === 0)) {
      parks.push({ x: bx + 12, y: by + 12, w: MAP.block - 24, h: MAP.block - 24 });
      continue;
    }
    const colors = ['#d48564', '#d7b46c', '#94a5a0', '#d9d0b8', '#a9a06f'];
    buildings.push({ x: bx + 12, y: by + 12, w: MAP.block - 24, h: MAP.block - 24, color: colors[(x * 3 + y) % colors.length], name: ['Motel Sol','Palm Court','Citrus Market','Marina Lofts','Sunset Storage'][(x + y) % 5] });
  }
  return { buildings, parks };
}

export function nearestRoad(x, y) {
  const lane = MAP.block + MAP.road;
  const cx = Math.round((x - MAP.road / 2) / lane) * lane + MAP.road / 2;
  const cy = Math.round((y - MAP.road / 2) / lane) * lane + MAP.road / 2;
  return Math.abs(x - cx) < Math.abs(y - cy) ? { x: cx, y, vertical: true } : { x, y: cy, vertical: false };
}

export function drawCity(ctx, city) {
  ctx.fillStyle = COLORS.grass; ctx.fillRect(0, 0, MAP.w, MAP.h);
  ctx.fillStyle = COLORS.sand; ctx.fillRect(0, 0, MAP.w, 22); ctx.fillRect(0, MAP.h - 22, MAP.w, 22);
  ctx.fillStyle = COLORS.road;
  for (let x = 0; x <= MAP.w; x += MAP.block + MAP.road) ctx.fillRect(x, 0, MAP.road, MAP.h);
  for (let y = 0; y <= MAP.h; y += MAP.block + MAP.road) ctx.fillRect(0, y, MAP.w, MAP.road);
  ctx.strokeStyle = '#e5d39a'; ctx.lineWidth = 2; ctx.setLineDash([18, 20]);
  for (let x = MAP.road / 2; x < MAP.w; x += MAP.block + MAP.road) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, MAP.h); ctx.stroke(); }
  for (let y = MAP.road / 2; y < MAP.h; y += MAP.block + MAP.road) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(MAP.w, y); ctx.stroke(); }
  ctx.setLineDash([]);
  for (const p of city.parks) {
    ctx.fillStyle = '#65915d'; ctx.fillRect(p.x,p.y,p.w,p.h);
    for (let i=0;i<8;i++) { const x=p.x+24+(i*47)%Math.max(40,p.w-48), y=p.y+25+(i*71)%Math.max(40,p.h-50); ctx.fillStyle='#3f704c'; ctx.beginPath(); ctx.arc(x,y,11,0,7); ctx.fill(); ctx.fillStyle='#bb9a68'; ctx.fillRect(x-2,y+8,4,8); }
  }
  for (const b of city.buildings) {
    ctx.fillStyle='rgba(38,48,43,.18)'; ctx.fillRect(b.x+8,b.y+9,b.w,b.h);
    ctx.fillStyle=b.color; ctx.fillRect(b.x,b.y,b.w,b.h);
    ctx.fillStyle='rgba(255,238,190,.35)';
    for(let wx=b.x+20;wx<b.x+b.w-12;wx+=34) for(let wy=b.y+22;wy<b.y+b.h-12;wy+=38) ctx.fillRect(wx,wy,13,9);
    ctx.fillStyle='rgba(40,50,45,.6)'; ctx.fillRect(b.x+8,b.y+8,b.w-16,8);
  }
}
