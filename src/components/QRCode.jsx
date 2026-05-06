import React from 'react';

export function QRCode({ id }) {
  const SIZE = 25;
  const seed = id.split("").reduce((a, c, i) => a + c.charCodeAt(0) * (i + 7), 0);
  const rand = (r, c) => ((seed * 1103515245 + (r * 12345 + c * 6789)) >>> 0) % 2 === 0;
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  
  const drawFinder = (sr, sc) => {
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
      const o = r === 0 || r === 6 || c === 0 || c === 6, i = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      grid[sr + r][sc + c] = o || i;
    }
  };
  
  drawFinder(0, 0); drawFinder(0, SIZE - 7); drawFinder(SIZE - 7, 0);
  
  const drawAlign = (sr, sc) => {
    for (let r = -2; r <= 2; r++) for (let c = -2; c <= 2; c++)
      grid[sr + r][sc + c] = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
  };
  
  drawAlign(18, 18);
  for (let i = 8; i < SIZE - 8; i++) { grid[6][i] = i % 2 === 0; grid[i][6] = i % 2 === 0; }
  
  const res = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  for (let r = 0; r <= 8; r++) { for (let c = 0; c <= 8; c++) res[r][c] = true; }
  for (let r = 0; r <= 8; r++) { for (let c = SIZE - 8; c < SIZE; c++) res[r][c] = true; }
  for (let r = SIZE - 8; r < SIZE; r++) { for (let c = 0; c <= 8; c++) res[r][c] = true; }
  for (let i = 0; i < SIZE; i++) { res[6][i] = true; res[i][6] = true; }
  for (let r = 16; r <= 20; r++) for (let c = 16; c <= 20; c++) res[r][c] = true;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!res[r][c]) grid[r][c] = rand(r, c);
  
  const rects = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++)
    if (grid[r][c]) rects.push(<rect key={`${r}-${c}`} x={c + 2} y={r + 2} width="1" height="1" fill="#111" />);
    
  return (
    <div className="qr-wrap">
      <svg width="120" height="120" viewBox={`0 0 ${SIZE + 4} ${SIZE + 4}`}>
        <rect x="0" y="0" width={SIZE + 4} height={SIZE + 4} fill="white" />
        {rects}
      </svg>
    </div>
  );
}
