import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { CANVAS_BG, ERASER_COLOR, type DrawEvent } from '../../types/game'

export interface CanvasHandle {
  replayEvents: (events: DrawEvent[]) => void
  clearCanvas: () => void
  drawStroke: (e: DrawEvent) => void
}

interface Props {
  isQuestioner: boolean
  currentColor: string
  penWidth?: number
  onDraw: (e: DrawEvent) => void
}

function applyGlow(ctx: CanvasRenderingContext2D, color: string) {
  if (color === ERASER_COLOR) {
    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'
  } else if (color === '#FFFFFF') {
    ctx.shadowBlur = 6
    ctx.shadowColor = 'rgba(255,255,255,0.6)'
  } else {
    ctx.shadowBlur = 10
    ctx.shadowColor = color
  }
}

const Canvas = forwardRef<CanvasHandle, Props>(({ isQuestioner, currentColor, penWidth = 3, onDraw }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  // 캔버스 초기화
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = CANVAS_BG
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  function getCtx() {
    return canvasRef.current?.getContext('2d') ?? null
  }

  function drawLine(ctx: CanvasRenderingContext2D, e: DrawEvent, canvasW: number, canvasH: number) {
    applyGlow(ctx, e.color)
    ctx.beginPath()
    ctx.strokeStyle = e.color
    ctx.lineWidth = e.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.moveTo(e.x0 * canvasW, e.y0 * canvasH)
    ctx.lineTo(e.x1 * canvasW, e.y1 * canvasH)
    ctx.stroke()
  }

  const drawStroke = useCallback((e: DrawEvent) => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    drawLine(ctx, e, canvas.width, canvas.height)
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    ctx.fillStyle = CANVAS_BG
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const replayEvents = useCallback((events: DrawEvent[]) => {
    clearCanvas()
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!canvas || !ctx) return
    for (const e of events) drawLine(ctx, e, canvas.width, canvas.height)
  }, [clearCanvas])

  useImperativeHandle(ref, () => ({ replayEvents, clearCanvas, drawStroke }), [replayEvents, clearCanvas, drawStroke])

  // 마우스 이벤트 (출제자만)
  function getNorm(clientX: number, clientY: number) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    }
  }

  function onMouseDown(e: React.MouseEvent) {
    if (!isQuestioner) return
    isDrawing.current = true
    lastPos.current = getNorm(e.clientX, e.clientY)
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isQuestioner || !isDrawing.current || !lastPos.current) return
    const cur = getNorm(e.clientX, e.clientY)
    const event: DrawEvent = {
      x0: lastPos.current.x, y0: lastPos.current.y,
      x1: cur.x, y1: cur.y,
      color: currentColor,
      width: penWidth,
    }
    drawStroke(event)
    onDraw(event)
    lastPos.current = cur
  }

  function onMouseUp() { isDrawing.current = false; lastPos.current = null }

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className={`w-full h-full rounded-lg border border-[#21262d] shadow-[0_0_20px_rgba(74,222,128,0.05)] ${isQuestioner ? 'cursor-crosshair' : 'cursor-default'}`}
      style={{ background: CANVAS_BG, display: 'block' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    />
  )
})

Canvas.displayName = 'Canvas'
export default Canvas
