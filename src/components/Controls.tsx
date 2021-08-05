import html2canvas from 'html2canvas'
import React from 'react'
import { setShowStraightArrows } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { redo, reset, undo, useCanUndoRedo } from '../undoable'

export default function Controls() {
  const dispatch = useDispatch()
  const showStraightArrows = useSelector((state) => state.showStraightArrows)
  const { canUndo, canRedo } = useCanUndoRedo()

  const copyImage = () => {
    if (navigator.clipboard.write) {
      const clipboardItem = new ClipboardItem({
        'image/png': containerAsCanvas().then(canvasToBlob),
      })
      navigator.clipboard
        .write([clipboardItem])
        .catch((error) => console.error(error))
    } else {
      throw new Error(`Can't use clipboard API`)
    }
  }
  const saveImage = () => {
    containerAsCanvas()
      .then(downloadCanvas)
      .catch((error) => console.error(error))
  }
  return (
    <div className='annotation-controls'>
      <input
        type='checkbox'
        id='straight-arrows'
        checked={showStraightArrows}
        onChange={(e) => dispatch(setShowStraightArrows(e.target.checked))}
      />
      <label htmlFor='straight-arrows'>Use straight arrows</label>
      <div>
        <button disabled={!canUndo} onClick={() => dispatch(undo())}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => dispatch(redo())}>
          redo
        </button>
        <button onClick={() => dispatch(reset())}>clear</button>
      </div>
      <div>
        {navigator.clipboard.write && (
          <button onClick={copyImage}>copy as image</button>
        )}
        <button onClick={saveImage}>save as image</button>
      </div>
    </div>
  )
}

async function containerAsCanvas(): Promise<HTMLCanvasElement> {
  const container = document.getElementsByClassName(
    'container',
  )[0] as HTMLElement
  if (!container) {
    throw new Error(`Couldn't find container element`)
  }
  const canvas = await html2canvas(container)
  return canvas
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`Couldn't convert canvas to blob`))
        } else {
          resolve(blob)
        }
      },
      'image/png',
      0.9,
    )
  })
}

function downloadCanvas(canvas: HTMLCanvasElement) {
  const a = document.createElement('a')
  const image = canvas
    .toDataURL('image/png')
    .replace('image/png', 'octet/stream')
  a.href = image
  a.download = 'code.png'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
