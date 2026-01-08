import React, { useRef, useState, useEffect } from 'react';
import { 
  Undo, Redo, MousePointer2, Pen, Eraser, Minus, Square, Circle, Ruler, Trash2, 
  Type, Table as TableIcon, Activity, Zap, Spline, Hand
} from 'lucide-react';
import { useHistory } from '../hooks/useHistory';
import { useTheme } from '../context/ThemeContext';

interface Element {
  id: string;
  type: 'pen' | 'line' | 'rect' | 'circle' | 'stamp' | 'ruler' | 'text' | 'curve' | 'table';
  points?: number[]; // [x1, y1, x2, y2, ...]
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  stampType?: 'AND' | 'OR' | 'NOT' | 'RESISTOR' | 'CAPACITOR' | 'BATTERY' | 'GROUND';
  distance?: number;
  text?: string;
  fontSize?: number;
  tableData?: Record<string, string>;
  tableRows?: number;
  tableCols?: number;
}

interface CanvasEditorProps {
  initialData?: string;
  onSave: (data: string) => void;
}

type ToolType = 'select' | 'hand' | 'pen' | 'eraser' | 'line' | 'rect' | 'circle' | 'curve' | 'ruler' | 'text' | 'stamp' | 'table';
type StampType = 'AND' | 'OR' | 'NOT' | 'RESISTOR' | 'CAPACITOR' | 'BATTERY' | 'GROUND';

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ initialData, onSave }) => {
  const { state: elements, set: setElements, undo, redo, canUndo, canRedo } = useHistory<Element[]>(
    initialData ? JSON.parse(initialData) : []
  );
  const { theme } = useTheme();
  
  const [tool, setTool] = useState<ToolType>('pen');
  const [selectedStamp, setSelectedStamp] = useState<StampType>('AND');
  const [strokeColor, setStrokeColor] = useState('#1e293b');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<Element | null>(null);
  
  // Panning State
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPoint = useRef({ x: 0, y: 0 });

  // Moving Element State
  const [dragInfo, setDragInfo] = useState<{ id: string, startX: number, startY: number, originalX: number, originalY: number } | null>(null);
  const isDraggingElement = useRef(false);

  // Text/Table Input State
  const [inputState, setInputState] = useState<{
    id?: string, 
    x: number, 
    y: number, 
    width?: number,
    height?: number,
    text: string,
    type: 'text' | 'tableCell',
    cellKey?: string
  } | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    onSave(JSON.stringify(elements));
  }, [elements, onSave]);

  const handleToolSelect = (newTool: ToolType) => {
    if (newTool === 'table') {
        const rows = prompt("Enter number of rows:", "3");
        const cols = prompt("Enter number of columns:", "3");
        if (rows !== null && cols !== null) {
             (window as any)._tempTableConfig = { rows: parseInt(rows) || 3, cols: parseInt(cols) || 3 };
             setTool(newTool);
        }
    } else {
        setTool(newTool);
    }
  };

  const getCoordinates = (e: React.PointerEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left - panOffset.x,
      y: e.clientY - rect.top - panOffset.y
    };
  };

  const getRenderColor = (color: string) => {
    if (theme === 'dark' && (color === '#1e293b' || color === '#000000' || color === 'black')) {
        return '#f8fafc';
    }
    if (theme === 'light' && (color === '#f8fafc' || color === '#ffffff' || color === 'white')) {
        return '#1e293b';
    }
    return color;
  };

  const hitTest = (x: number, y: number): string | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        const tol = 10;

        if (el.type === 'rect' || el.type === 'table' || el.type === 'stamp' || el.type === 'text') {
            const ex = (el.width || 0) < 0 ? (el.x || 0) + (el.width || 0) : (el.x || 0);
            const ey = (el.height || 0) < 0 ? (el.y || 0) + (el.height || 0) : (el.y || 0);
            const ew = Math.abs(el.width || (el.type === 'text' ? (el.text?.length || 1) * 12 : 0)); 
            const eh = Math.abs(el.height || (el.type === 'text' ? 24 : 0));
            
            if (x >= ex && x <= ex + ew && y >= ey && y <= ey + eh) return el.id;
        }
        else if (el.type === 'circle') {
             const cx = (el.x || 0) + (el.width || 0)/2;
             const cy = (el.y || 0) + (el.height || 0)/2;
             const r = Math.sqrt(Math.pow(el.width||0, 2) + Math.pow(el.height||0, 2)) / 2;
             const dist = Math.sqrt(Math.pow(x-cx, 2) + Math.pow(y-cy, 2));
             if (dist <= r) return el.id;
        }
        else if (el.type === 'line' || el.type === 'ruler') {
            const x1 = el.x || 0;
            const y1 = el.y || 0;
            const x2 = x1 + (el.width || 0);
            const y2 = y1 + (el.height || 0);
            if (x >= Math.min(x1, x2)-tol && x <= Math.max(x1, x2)+tol && 
                y >= Math.min(y1, y2)-tol && y <= Math.max(y1, y2)+tol) return el.id;
        }
        else if (el.type === 'pen' || el.type === 'curve') {
             // Basic bounding box for paths for simplicity
             if (!el.points || el.points.length < 2) continue;
             const xs = el.points.filter((_, idx) => idx % 2 === 0).map(v => v + (el.x || 0));
             const ys = el.points.filter((_, idx) => idx % 2 === 1).map(v => v + (el.y || 0));
             const minX = Math.min(...xs) - tol;
             const maxX = Math.max(...xs) + tol;
             const minY = Math.min(...ys) - tol;
             const maxY = Math.max(...ys) + tol;
             if (x >= minX && x <= maxX && y >= minY && y <= maxY) return el.id;
        }
    }
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (inputState) {
        handleInputSubmit();
        return;
    }

    const { x, y } = getCoordinates(e);

    if (tool === 'hand') {
      setIsPanning(true);
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    if (tool === 'select') {
        const hitId = hitTest(x, y);
        if (hitId) {
            const el = elements.find(e => e.id === hitId);
            if (el) {
                setDragInfo({
                    id: hitId,
                    startX: x,
                    startY: y,
                    originalX: el.x || 0,
                    originalY: el.y || 0
                });
                isDraggingElement.current = false;
                e.currentTarget.setPointerCapture(e.pointerId);
                return;
            }
        }
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    
    if (tool === 'text') {
      setInputState({ x, y, text: '', type: 'text' });
      return;
    }

    setIsDrawing(true);
    const id = crypto.randomUUID();

    if (tool === 'pen') {
      setCurrentElement({ id, type: 'pen', points: [x, y], stroke: strokeColor, strokeWidth: 2 });
    } else if (tool === 'curve') {
      setCurrentElement({ id, type: 'curve', points: [x, y], stroke: strokeColor, strokeWidth: 2 });
    } else if (tool === 'line') {
      setCurrentElement({ id, type: 'line', x, y, width: 0, height: 0, stroke: strokeColor, strokeWidth: 2 });
    } else if (tool === 'rect') {
      setCurrentElement({ id, type: 'rect', x, y, width: 0, height: 0, stroke: strokeColor, fill: 'transparent', strokeWidth: 2 });
    } else if (tool === 'circle') {
      setCurrentElement({ id, type: 'circle', x, y, width: 0, height: 0, stroke: strokeColor, fill: 'transparent', strokeWidth: 2 });
    } else if (tool === 'ruler') {
      setCurrentElement({ id, type: 'ruler', x, y, width: 0, height: 0, stroke: '#ef4444', strokeWidth: 2 });
    } else if (tool === 'table') {
      const conf = (window as any)._tempTableConfig || { rows: 3, cols: 3 };
      setCurrentElement({ 
        id, type: 'table', x, y, width: 0, height: 0, stroke: strokeColor, strokeWidth: 1,
        tableRows: conf.rows, tableCols: conf.cols, tableData: {} 
      });
    } else if (tool === 'stamp') {
      setCurrentElement({ 
        id, 
        type: 'stamp', 
        x, 
        y, 
        width: 0, 
        height: 0,
        stampType: selectedStamp, 
        stroke: strokeColor, 
        strokeWidth: 2 
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPoint.current.x;
      const dy = e.clientY - lastPanPoint.current.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const { x, y } = getCoordinates(e);

    if (dragInfo && tool === 'select') {
        const dx = x - dragInfo.startX;
        const dy = y - dragInfo.startY;
        
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            isDraggingElement.current = true;
        }

        setElements(elements.map(el => {
            if (el.id === dragInfo.id) {
                return { ...el, x: (dragInfo.originalX || 0) + dx, y: (dragInfo.originalY || 0) + dy };
            }
            return el;
        }));
        return;
    }

    if (!isDrawing || !currentElement) return;

    if (tool === 'pen' || tool === 'curve') {
      setCurrentElement({ ...currentElement, points: [...(currentElement.points || []), x, y] });
    } else if (['line', 'rect', 'circle', 'ruler', 'stamp', 'table'].includes(tool)) {
      setCurrentElement({
        ...currentElement,
        width: x - (currentElement.x || 0),
        height: y - (currentElement.y || 0),
        distance: tool === 'ruler' 
          ? Math.sqrt(Math.pow(x - (currentElement.x || 0), 2) + Math.pow(y - (currentElement.y || 0), 2))
          : undefined
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (dragInfo) {
        setDragInfo(null);
        e.currentTarget.releasePointerCapture(e.pointerId);
        return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (currentElement) {
      if (['rect', 'circle', 'line', 'table', 'stamp'].includes(currentElement.type)) {
        if (Math.abs(currentElement.width || 0) < 5 && Math.abs(currentElement.height || 0) < 5) {
            const defaultSize = 50;
            const newEl = { ...currentElement, width: defaultSize, height: defaultSize };
            if (currentElement.type === 'table') { newEl.width = 150; newEl.height = 100; }
            setElements([...elements, newEl]);
            setCurrentElement(null);
            return;
        }
      }
      setElements([...elements, currentElement]);
      setCurrentElement(null);
    }
  };

  const handleElementClick = (el: Element, e: React.MouseEvent) => {
    e.stopPropagation();

    if (tool === 'select' && isDraggingElement.current) {
        return;
    }
    
    if (tool === 'eraser') {
      setElements(elements.filter(e => e.id !== el.id));
      return;
    }
    
    if (el.type === 'table' && tool === 'select') {
      const canvasCoords = getCoordinates(e as unknown as React.PointerEvent);
      
      const rows = el.tableRows || 3;
      const cols = el.tableCols || 3;
      const absW = Math.abs(el.width || 0);
      const absH = Math.abs(el.height || 0);
      const startX = (el.width || 0) < 0 ? (el.x || 0) + (el.width || 0) : (el.x || 0);
      const startY = (el.height || 0) < 0 ? (el.y || 0) + (el.height || 0) : (el.y || 0);
      
      const relX = canvasCoords.x - startX;
      const relY = canvasCoords.y - startY;

      if (relX >= 0 && relX <= absW && relY >= 0 && relY <= absH) {
         const colIdx = Math.min(cols - 1, Math.floor(relX / (absW / cols)));
         const rowIdx = Math.min(rows - 1, Math.floor(relY / (absH / rows)));
         const cellKey = `${rowIdx}-${colIdx}`;
         
         const cellX = startX + colIdx * (absW / cols);
         const cellY = startY + rowIdx * (absH / rows);

         setInputState({
           id: el.id,
           x: cellX,
           y: cellY,
           width: absW / cols,
           height: absH / rows,
           text: el.tableData?.[cellKey] || '',
           type: 'tableCell',
           cellKey
         });
      }
    }
  };

  const handleInputSubmit = () => {
    if (!inputState) return;

    if (inputState.type === 'text' && inputState.text.trim()) {
      setElements([...elements, {
        id: crypto.randomUUID(),
        type: 'text',
        x: inputState.x,
        y: inputState.y,
        text: inputState.text,
        stroke: strokeColor,
        fontSize: 20
      }]);
    } 
    else if (inputState.type === 'tableCell' && inputState.id && inputState.cellKey) {
       setElements(elements.map(el => {
         if (el.id === inputState.id) {
            return {
              ...el,
              tableData: { ...el.tableData, [inputState.cellKey!]: inputState.text }
            };
         }
         return el;
       }));
    }
    setInputState(null);
  };

  const clearCanvas = () => {
    if (window.confirm('Clear all drawings?')) {
      setElements([]);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const getSvgPathFromPoints = (points: number[]) => {
    if (points.length < 4) return "";
    let d = `M ${points[0]},${points[1]}`;
    for (let i = 2; i < points.length - 2; i += 2) {
        const xc = (points[i] + points[i + 2]) / 2;
        const yc = (points[i + 1] + points[i + 3]) / 2;
        d += ` Q ${points[i]},${points[i + 1]} ${xc},${yc}`;
    }
    d += ` L ${points[points.length - 2]},${points[points.length - 1]}`;
    return d;
  };

  const renderStamp = (el: Element) => {
    const { x = 0, y = 0, stroke } = el;
    const finalStroke = getRenderColor(stroke || '#000');
    const w = el.width || 50;
    const h = el.height || 50;
    const rX = w < 0 ? x + w : x;
    const rY = h < 0 ? y + h : y;
    const absW = Math.abs(w);
    const absH = Math.abs(h);

    let content = null;
    switch (el.stampType) {
      case 'AND': 
        content = <path d="M10 10 V90 H40 A50 40 0 0 0 40 10 H10 Z" fill="none" stroke={finalStroke} strokeWidth="5" />; break;
      case 'OR': 
        content = <path d="M10 10 V90 Q40 90 90 50 Q40 10 10 10" fill="none" stroke={finalStroke} strokeWidth="5" />; break;
      case 'NOT': 
        content = <><path d="M10 10 V90 L80 50 Z" fill="none" stroke={finalStroke} strokeWidth="5" /><circle cx="90" cy="50" r="8" fill="none" stroke={finalStroke} strokeWidth="5" /></>; break;
      case 'RESISTOR': 
        content = <polyline points="0,50 10,50 20,20 40,80 60,20 80,80 90,50 100,50" fill="none" stroke={finalStroke} strokeWidth="5" strokeLinejoin="round"/>; break;
      case 'CAPACITOR':
        content = <><line x1="40" y1="0" x2="40" y2="100" stroke={finalStroke} strokeWidth="5"/><line x1="60" y1="0" x2="60" y2="100" stroke={finalStroke} strokeWidth="5"/><line x1="0" y1="50" x2="40" y2="50" stroke={finalStroke} strokeWidth="5"/><line x1="60" y1="50" x2="100" y2="50" stroke={finalStroke} strokeWidth="5"/></>; break;
      case 'BATTERY':
        content = <><line x1="40" y1="20" x2="40" y2="80" stroke={finalStroke} strokeWidth="8"/><line x1="60" y1="0" x2="60" y2="100" stroke={finalStroke} strokeWidth="8"/><line x1="0" y1="50" x2="40" y2="50" stroke={finalStroke} strokeWidth="5"/><line x1="60" y1="50" x2="100" y2="50" stroke={finalStroke} strokeWidth="5"/></>; break;
       case 'GROUND':
         content = <><line x1="50" y1="0" x2="50" y2="50" stroke={finalStroke} strokeWidth="5" /><line x1="20" y1="50" x2="80" y2="50" stroke={finalStroke} strokeWidth="5" /><line x1="30" y1="70" x2="70" y2="70" stroke={finalStroke} strokeWidth="5" /><line x1="40" y1="90" x2="60" y2="90" stroke={finalStroke} strokeWidth="5" /></>; break;
    }

    return (
       <g transform={`translate(${rX},${rY})`} onClick={(e) => handleElementClick(el, e)} className="cursor-pointer group">
         <rect width={absW} height={absH} fill="transparent" stroke="transparent" className="group-hover:stroke-brand-200/50" strokeWidth="1" />
         <svg viewBox="0 0 100 100" width={absW} height={absH} overflow="visible" preserveAspectRatio="none">
            {content}
         </svg>
       </g>
    );
  };

  const renderTable = (el: Element) => {
    const rX = (el.width || 0) < 0 ? (el.x || 0) + (el.width || 0) : el.x;
    const rY = (el.height || 0) < 0 ? (el.y || 0) + (el.height || 0) : el.y;
    const absW = Math.abs(el.width || 0);
    const absH = Math.abs(el.height || 0);
    const rows = el.tableRows || 3;
    const cols = el.tableCols || 3;
    const cellW = absW / cols;
    const cellH = absH / rows;
    const finalStroke = getRenderColor(el.stroke || '#000');

    const gridLines = [];
    for(let i=0; i<=rows; i++) gridLines.push(<line key={`h-${i}`} x1="0" y1={i*cellH} x2={absW} y2={i*cellH} stroke={finalStroke} strokeWidth={el.strokeWidth} />);
    for(let i=0; i<=cols; i++) gridLines.push(<line key={`v-${i}`} x1={i*cellW} y1="0" x2={i*cellW} y2={absH} stroke={finalStroke} strokeWidth={el.strokeWidth} />);
    
    const cells = [];
    if (el.tableData) {
        for (const [key, val] of Object.entries(el.tableData)) {
            const [r, c] = key.split('-').map(Number);
            if (val) {
                cells.push(
                    <foreignObject key={key} x={c * cellW} y={r * cellH} width={cellW} height={cellH} className="pointer-events-none">
                        <div className={`w-full h-full flex items-center justify-center text-xs text-center p-0.5 overflow-hidden break-words ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            {val}
                        </div>
                    </foreignObject>
                );
            }
        }
    }

    return (
        <g transform={`translate(${rX},${rY})`} onClick={(e) => handleElementClick(el, e)} className="cursor-pointer">
            <rect width={absW} height={absH} fill={theme === 'dark' ? '#334155' : 'white'} fillOpacity={theme === 'dark' ? 0.3 : 0.8} />
            {gridLines}
            {cells}
        </g>
    );
  };

  const renderElement = (el: Element) => {
    const finalStroke = getRenderColor(el.stroke || '#000');
    const props = {
      key: el.id,
      stroke: finalStroke,
      strokeWidth: el.strokeWidth,
      fill: el.fill || 'none',
      onClick: (e: React.MouseEvent) => handleElementClick(el, e),
      style: { cursor: tool === 'eraser' ? 'crosshair' : 'pointer' }
    };
    
    const tX = el.x || 0;
    const tY = el.y || 0;
    const transform = (el.type === 'pen' || el.type === 'curve') ? `translate(${tX}, ${tY})` : undefined;

    switch (el.type) {
      case 'pen':
        const points = el.points || [];
        const d = `M ${points[0]} ${points[1]} ` + points.slice(2).reduce((acc, val, i, arr) => {
           return i % 2 === 0 ? acc + `L ${val} ${arr[i+1]} ` : acc;
        }, '');
        return <path d={d} strokeLinecap="round" strokeLinejoin="round" fill="none" transform={transform} {...props} />;
      case 'curve':
        return <path d={getSvgPathFromPoints(el.points || [])} strokeLinecap="round" strokeLinejoin="round" fill="none" transform={transform} {...props} />;
      case 'line':
        return <line x1={el.x} y1={el.y} x2={(el.x||0) + (el.width||0)} y2={(el.y||0) + (el.height||0)} {...props} />;
      case 'rect':
        const rX = (el.width || 0) < 0 ? (el.x || 0) + (el.width || 0) : el.x;
        const rY = (el.height || 0) < 0 ? (el.y || 0) + (el.height || 0) : el.y;
        return <rect x={rX} y={rY} width={Math.abs(el.width||0)} height={Math.abs(el.height||0)} {...props} />;
      case 'circle':
        const cX = (el.x || 0) + (el.width || 0)/2;
        const cY = (el.y || 0) + (el.height || 0)/2;
        const r = Math.sqrt(Math.pow(el.width||0, 2) + Math.pow(el.height||0, 2)) / 2;
        return <circle cx={cX} cy={cY} r={r} {...props} />;
      case 'stamp': return renderStamp(el);
      case 'table': return renderTable(el);
      case 'text':
        return (
          <text key={el.id} x={el.x} y={el.y} fill={finalStroke} fontSize={el.fontSize} onClick={(e) => handleElementClick(el, e)} className="select-none cursor-pointer">
            {el.text}
          </text>
        );
      case 'ruler':
        const endX = (el.x||0) + (el.width||0);
        const endY = (el.y||0) + (el.height||0);
        const midX = (el.x||0) + (el.width||0)/2;
        const midY = (el.y||0) + (el.height||0)/2;
        const distPx = Math.round(el.distance || 0);
        const distIn = (distPx / 96).toFixed(2);
        
        return (
          <g key={el.id} onClick={(e) => handleElementClick(el, e)} className="cursor-pointer group">
             <line x1={el.x} y1={el.y} x2={endX} y2={endY} stroke="#ef4444" strokeWidth="2" strokeDasharray="4" />
             <rect x={midX - 30} y={midY - 15} width="60" height="30" fill={theme === 'dark' ? '#1e293b' : 'white'} stroke="#ef4444" rx="4" className="shadow-sm"/>
             <text x={midX} y={midY + 4} textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="bold">{distPx}px / {distIn}"</text>
          </g>
        );
      default: return null;
    }
  };

  const ToolButton = ({ t, icon: Icon, label }: { t: ToolType, icon: any, label: string }) => (
    <button 
      onClick={() => handleToolSelect(t)} 
      className={`p-1.5 rounded-md transition-all ${tool === t ? 'bg-brand-600 text-white shadow-sm' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`} 
      title={label}
    >
      <Icon size={18} />
    </button>
  );

  const StampButton = ({ t, label }: { t: StampType, label: string }) => (
    <button 
      onClick={() => { setTool('stamp'); setSelectedStamp(t); }} 
      className={`px-2 py-1 text-[10px] font-bold rounded border transition-all ${tool === 'stamp' && selectedStamp === t ? 'bg-brand-600 text-white border-brand-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`} 
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-b-xl overflow-hidden transition-colors duration-200">
      {/* Canvas Toolbar */}
      <div className="flex flex-col gap-2 p-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm z-10">
        
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 gap-1">
              <ToolButton t="hand" icon={Hand} label="Pan View (Move the canvas)" />
              <ToolButton t="select" icon={MousePointer2} label="Move Tool (Drag items)" />
              <ToolButton t="text" icon={Type} label="Text Tool" />
              <ToolButton t="table" icon={TableIcon} label="Table Tool" />
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 gap-1">
              <ToolButton t="pen" icon={Pen} label="Pen" />
              <ToolButton t="curve" icon={Spline} label="Smooth Curve" />
              <ToolButton t="line" icon={Minus} label="Line" />
              <ToolButton t="rect" icon={Square} label="Rectangle" />
              <ToolButton t="circle" icon={Circle} label="Circle" />
              <ToolButton t="eraser" icon={Eraser} label="Eraser" />
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 gap-1">
              <ToolButton t="ruler" icon={Ruler} label="Ruler" />
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={strokeColor} 
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border-2 border-slate-200 dark:border-slate-600 p-0 overflow-hidden"
                title="Color"
              />
              <div className="flex gap-1">
                 <button onClick={undo} disabled={!canUndo} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-600 dark:text-slate-300"><Undo size={16}/></button>
                 <button onClick={redo} disabled={!canRedo} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-600 dark:text-slate-300"><Redo size={16}/></button>
                 <button onClick={clearCanvas} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" title="Clear All"><Trash2 size={16}/></button>
              </div>
            </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
             <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                <Activity size={12} className="text-slate-400 mr-1" />
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Logic</span>
                <StampButton t="AND" label="AND" />
                <StampButton t="OR" label="OR" />
                <StampButton t="NOT" label="NOT" />
             </div>
             <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                <Zap size={12} className="text-slate-400 mr-1" />
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Circuit</span>
                <StampButton t="RESISTOR" label="RES" />
                <StampButton t="CAPACITOR" label="CAP" />
                <StampButton t="BATTERY" label="BAT" />
                <StampButton t="GROUND" label="GND" />
             </div>
        </div>
      </div>

      <div className="flex-1 relative bg-white dark:bg-[#1a1a1a] cursor-crosshair overflow-hidden touch-none transition-colors">
        {inputState && (
          <input
            autoFocus
            className="absolute z-50 bg-white dark:bg-slate-700 border border-brand-500 rounded px-1 text-sm outline-none shadow-lg text-black dark:text-white"
            style={{ 
              left: inputState.x + panOffset.x, 
              top: inputState.y + panOffset.y - (inputState.type === 'tableCell' ? (inputState.height||20)/2 : 10), 
              width: inputState.width ? Math.max(inputState.width - 4, 100) : 200,
              textAlign: inputState.type === 'tableCell' ? 'center' : 'left'
            }}
            value={inputState.text}
            onChange={(e) => setInputState({ ...inputState, text: e.target.value })}
            onKeyDown={(e) => { if(e.key === 'Enter') handleInputSubmit(); }}
            onBlur={handleInputSubmit}
            placeholder={inputState.type === 'text' ? "Type text..." : ""}
          />
        )}
        <svg 
          ref={svgRef}
          className={`w-full h-full ${isPanning ? 'cursor-grab active:cursor-grabbing' : (tool === 'select' ? 'cursor-default' : 'cursor-crosshair')}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
             <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
               <path d="M 20 0 L 0 0 0 20" fill="none" stroke={theme === 'dark' ? '#333' : '#e2e8f0'} strokeWidth="0.5" />
             </pattern>
          </defs>
          <g transform={`translate(${panOffset.x}, ${panOffset.y})`}>
            <rect x={-panOffset.x} y={-panOffset.y} width="100%" height="100%" fill="url(#grid)" className="pointer-events-none"/>
            {elements.map(renderElement)}
            {currentElement && renderElement(currentElement)}
          </g>
        </svg>
      </div>
    </div>
  );
};
