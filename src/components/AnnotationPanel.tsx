
"use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { fabric } from 'fabric';

export type ItemLayout = {
    id: string;
    label: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    fontWeight: 'normal' | 'bold';
    color: string;
    type: 'text' | 'image';
    width?: number;
    height?: number;
}

export type Template = {
  id: string;
  name: string;
  url: string;
  items: ItemLayout[];
};

interface AnnotationPanelProps {
  template: Template;
  onLayoutUpdate: (newItems: ItemLayout[]) => void;
}

const AnnotationPanel: React.FC<AnnotationPanelProps> = ({ template, onLayoutUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstanceRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateCanvasContent = useCallback(() => {
    const container = containerRef.current;
    if (!container || !canvasInstanceRef.current) return;
    
    const canvas = canvasInstanceRef.current;
    if(!canvas) return;

    fabric.Image.fromURL(template.url, (img) => {
        const currentCanvas = canvasInstanceRef.current;
        if (!currentCanvas) return; 

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const imgAspectRatio = img.width! / img.height!;
        let canvasWidth, canvasHeight;

        if (containerWidth / containerHeight > imgAspectRatio) {
            canvasHeight = containerHeight;
            canvasWidth = containerHeight * imgAspectRatio;
        } else {
            canvasWidth = containerWidth;
            canvasHeight = containerWidth / imgAspectRatio;
        }
        
        currentCanvas.setDimensions({ width: canvasWidth, height: canvasHeight });

        currentCanvas.setBackgroundImage(img, currentCanvas.renderAll.bind(currentCanvas), {
            scaleX: canvasWidth / img.width!,
            scaleY: canvasHeight / img.height!,
        });

        currentCanvas.remove(...currentCanvas.getObjects());

        const items = Array.isArray(template.items)
          ? template.items
          : Object.values(template.items || {});

        items.forEach(item => {
            let fabricObject;
            const commonProps = {
                left: item.x,
                top: item.y,
                originX: 'left',
                originY: 'top',
                hasControls: true,
                borderColor: 'orange',
                cornerColor: 'orange',
                cornerSize: 8,
                transparentCorners: false,
                data: { id: item.id, type: item.type },
            };
            
            if (item.type === 'text') {
                fabricObject = new fabric.IText(item.label, {
                    ...commonProps,
                    fontSize: item.fontSize,
                    fontFamily: item.fontFamily,
                    fontWeight: item.fontWeight,
                    fill: item.color,
                    backgroundColor: 'rgba(255, 165, 0, 0.5)',
                    padding: 2,
                });
            } else {
                fabricObject = new fabric.Rect({
                    ...commonProps,
                    width: item.width || 50,
                    height: item.height || 50,
                    fill: 'rgba(0, 128, 0, 0.3)',
                    stroke: 'green',
                    strokeWidth: 1,
                });
            }
            currentCanvas.add(fabricObject);
        });
        currentCanvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  }, [template]);

  useEffect(() => {
      if (!canvasRef.current) return;

      const canvas = new fabric.Canvas(canvasRef.current);
      canvasInstanceRef.current = canvas;

      const handleObjectModified = (e: fabric.IEvent) => {
          const modifiedObject = e.target;
          if (!modifiedObject) return;

          const id = modifiedObject.data?.id;
          if (!id) return;
          
          onLayoutUpdate(prevItems => {
              const currentItems = Array.isArray(prevItems) ? prevItems : Object.values(prevItems || []);
              return currentItems.map(item =>
                  item.id === id
                      ? {
                          ...item,
                          x: modifiedObject.left!,
                          y: modifiedObject.top!,
                          width: item.type === 'image' ? modifiedObject.getScaledWidth() : item.width,
                          height: item.type === 'image' ? modifiedObject.getScaledHeight() : item.height
                        }
                      : item
              )
          });
      };

      canvas.on('object:modified', handleObjectModified);

      const resizeObserver = new ResizeObserver(() => {
          if (canvasInstanceRef.current) updateCanvasContent();
      });
      if (containerRef.current) resizeObserver.observe(containerRef.current);

      updateCanvasContent();

      return () => {
          resizeObserver.disconnect();
          if (canvasInstanceRef.current) {
            canvasInstanceRef.current.dispose();
            canvasInstanceRef.current = null;
          }
      };
  }, [updateCanvasContent, onLayoutUpdate]);

  useEffect(() => {
    updateCanvasContent();
  }, [template, updateCanvasContent]);

  return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center">
          <canvas ref={canvasRef} />
      </div>
  );
};

export default AnnotationPanel;
