import React, { useState, useEffect, useRef } from "react";
import { Client } from '@stomp/stompjs'
import * as SockJS from 'sockjs-client';
import "./Board.css";
import Controls from "../Controls/Controls";

function Board() {
  const canvasRef = React.useRef(null);
  const parentRef = React.useRef(null);
  const [ctx, setCtx] = useState({}); // WHY IS THIS NEEDED... IT ONLY SEEMS TO BREAK THINGS
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [drawing, setDrawing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState("#000000");

  const connRef = useRef();

  useEffect(() => {
    let canvas = canvasRef.current;
    // Make canvas fill parent component
    canvas.width = parentRef.current.offsetWidth;
    canvas.height = parentRef.current.offsetHeight;

    let canvasCtx = canvas.getContext("2d");
    canvasCtx.lineJoin = "round";
    canvasCtx.lineCap = "round";
    setCtx(canvasCtx);

    let offset = canvas.getBoundingClientRect();
    setCanvasOffset({ x: parseInt(offset.left), y: parseInt(offset.top) });
  }, [ctx]);

  useEffect(() => {
    const stompConfig = {
      webSocketFactory: () => {
        return new SockJS("http://localhost:8080/ws");
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      // Subscriptions should be done inside onConnect as those need to reinstated when the broker reconnects
      onConnect: function (frame) {
        // The return object has a method called `unsubscribe`
        connRef.current.subscribe('/topic/msg', function (message) {
          const payload = JSON.parse(message.body);
          onDrawingEvent(payload);
        });
      }
    };

    connRef.current = new Client(stompConfig);
    connRef.current.activate();
  }, []);

  const onDrawingEvent = (data) => {
    let canvas = canvasRef.current;
    const w = canvas.width;
    const h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  const handleMouseDown = (e) => {
    setDrawing(true);
    setPosition({
      x: parseInt(e.clientX - canvasOffset.x),
      y: parseInt(e.clientY - canvasOffset.y),
    });
  }
  const handleMouseUp = () => {
    setDrawing(false);
  }

  const handleMouseMove = (e) => {
    let mouseX = e.clientX - canvasOffset.x;
    let mouseY = e.clientY - canvasOffset.y;
    if (drawing) {
      drawLine(position.x, position.y, mouseX, mouseY, color, 4);
      publishDraw(position.x, position.y, mouseX, mouseY, color, 4);
    }
    setPosition({ x: mouseX, y: mouseY });
  }

  const drawLine = (x0, y0, x1, y1, lineColor, lineThickness) => {
    let canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineThickness;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
  }

  const publishDraw = (x0, y0, x1, y1, lineColor, lineThickness) => {
    let canvas = canvasRef.current;
    const w = canvas.width;
    const h = canvas.height;

    connRef.current.publish({
      destination: "/app/user-all",
      body: JSON.stringify({
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color,
      })
    });
  }

  return (
    <div className="board" ref={parentRef}>
      <Controls handleColor={(c) => setColor(c)} />
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseUp}
        onMouseMove={handleMouseMove}
        // Add touch support
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        onTouchCancel={handleMouseUp}
        onTouchMove={handleMouseMove}
      />
    </div>
  );
}

export default Board;
