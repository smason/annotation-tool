import React, { MouseEvent, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { distanceBetweenPoints, pointOnLineNearLine } from '../geometry'
import { addArrow } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { Arrow, Marker, UnfinishedArrow } from '../types'
import { pointFromEvent } from '../util'

type SvgMouseEvents = {
  onMouseMove: (event: MouseEvent) => void
  onMouseUp: (event: MouseEvent) => void
}

type MarkerMouseEvents = {
  onMouseDown: (event: MouseEvent, marker: Marker) => void
  onMouseMove: (event: MouseEvent, marker: Marker) => void
  onMouseUp: (event: MouseEvent, marker: Marker) => void
}

type ArrowMouseEvents = {
  onMouseDown: (event: MouseEvent, arrow: Arrow) => void
}

type ReturnType = {
  drag: UnfinishedArrow | null
  mouseEvents: {
    svg: SvgMouseEvents
    marker: MarkerMouseEvents
    arrow: ArrowMouseEvents
  }
}

export default function useArrowDrawing(
  containerRef: React.MutableRefObject<SVGSVGElement | null>,
): ReturnType {
  const [drag, setDrag] = React.useState<UnfinishedArrow | null>(null)
  const showStraightArrows = useSelector((state) => state.showStraightArrows)
  const dispatch = useDispatch()

  const onMouseDown = useCallback(
    (event: MouseEvent, target: Marker | Arrow) => {
      event.preventDefault()
      const currentPoint = pointFromEvent(event, containerRef.current!)
      const { fromPoint, fromMarker, dependencies } = dragStartProperties(
        event,
        target,
        showStraightArrows,
        containerRef,
      )
      setDrag({
        fromPoint,
        fromMarker,
        midPoints: [],
        toPoint: currentPoint,
        toMarker: null,
        dependencies,
      })
    },
    [containerRef],
  )

  const onMouseMove = useCallback(
    (event: MouseEvent, marker: Marker | null = null) => {
      if (!drag) {
        return
      }

      if (marker) {
        event.stopPropagation()
      }

      const markerIsOriginMarker = marker?.id === drag.fromMarker

      const currentPoint = pointFromEvent(event, containerRef.current!)
      const lastPoint =
        drag.midPoints[drag.midPoints.length - 1] ?? drag.fromPoint

      const newMidPoints =
        !showStraightArrows &&
        distanceBetweenPoints(currentPoint, lastPoint) > 10
          ? [...drag.midPoints, currentPoint]
          : drag.midPoints

      setDrag({
        ...drag,
        midPoints: newMidPoints,
        toPoint: currentPoint,
        toMarker: markerIsOriginMarker ? null : marker?.id ?? null,
      })
    },
    [containerRef, drag, showStraightArrows],
  )

  const onMouseUp = useCallback(
    (event: MouseEvent, marker: Marker | null = null) => {
      if (!drag) {
        return
      }

      if (!marker || marker.id === drag.fromMarker) {
        setDrag(null)
        return
      }

      const arrow = {
        fromMarker: drag.fromMarker,
        fromPoint: drag.fromPoint,
        midPoints: drag.midPoints,
        toMarker: marker.id,
        toPoint: pointFromEvent(event, containerRef.current!),
        id: uuid(),
        dependencies: { ...drag.dependencies, [marker.id]: true },
      }
      dispatch(addArrow(arrow))
      setDrag(null)
    },
    [containerRef, drag, setDrag],
  )

  return {
    drag,
    mouseEvents: {
      svg: {
        onMouseMove: (e) => onMouseMove(e),
        onMouseUp: (e) => onMouseUp(e),
      },
      marker: {
        onMouseDown: (e, marker) => onMouseDown(e, marker),
        onMouseMove: (e, marker) => onMouseMove(e, marker),
        onMouseUp: (e, marker) => onMouseUp(e, marker),
      },
      arrow: {
        onMouseDown: (e, arrow) => onMouseDown(e, arrow),
      },
    },
  }
}

function dragStartProperties(
  event: MouseEvent,
  target: Arrow | Marker,
  straight: boolean,
  containerRef: React.MutableRefObject<SVGSVGElement | null>,
): Pick<UnfinishedArrow, 'fromPoint' | 'fromMarker' | 'dependencies'> {
  const currentPoint = pointFromEvent(event, containerRef.current!)
  if ('fromMarker' in target) {
    return {
      fromPoint: straight
        ? pointOnLineNearLine(target.fromPoint, target.toPoint, currentPoint)
        : currentPoint,
      fromMarker: target.fromMarker,
      dependencies: {
        ...target.dependencies,
        [target.id]: true,
        [target.fromMarker]: true,
      },
    }
  } else {
    return {
      fromPoint: currentPoint,
      fromMarker: target.id,
      dependencies: { [target.id]: true },
    }
  }
}
