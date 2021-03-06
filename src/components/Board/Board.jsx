import React, { useState, useEffect, useRef } from "react";
import { Client } from '@stomp/stompjs'
import * as SockJS from 'sockjs-client';
import "./Board.css";
import Controls from "../Controls/Controls";

function Board() {

    const modes = Object.freeze({ "PEN": 0, "LINE": 1, "ERASE": 2 });

    const canvasRef = useRef(null);
    const parentRef = useRef(null);
    const [mode, setMode] = useState(modes["PEN"]);
    const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
    const [drawing, setDrawing] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [color, setColor] = useState("#000000");
    const [thickness, setThickness] = useState(2);
    const [sessionID, setSessionID] = useState("UKG-TechStars");

    const connRef = useRef(null);
    const subscriptionLineRef = useRef(null);
    const subscriptionClearRef = useRef(null);

    const canvasResize = () => {
        // TODO: add debounce so this does not fire too often
        // TODO: add proper scaling
        let canvas = canvasRef.current;
        let ctx = canvas.getContext("2d");
        let temp = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // Make canvas fill parent component
        canvas.width = parentRef.current.offsetWidth;
        canvas.height = parentRef.current.offsetHeight;

        let offset = canvas.getBoundingClientRect();
        setCanvasOffset({ x: parseInt(offset.left), y: parseInt(offset.top) });

        ctx.putImageData(temp, 0, 0);
    };

    useEffect(() => {
        canvasResize();

        window.addEventListener('resize', canvasResize);
    }, []);



    useEffect(() => {
        const onDrawingEvent = (data) => {
            let canvas = canvasRef.current;
            const w = canvas.width;
            const h = canvas.height;
            drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.thickness);
        }

        const onClearEvent = () => {
            clearCanvas();
        }

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
                if (!connRef.current?.connected) return;
                subscriptionLineRef.current = connRef.current.subscribe(`/topic/whiteboard/line/${sessionID}`, (message) => {
                    const payload = JSON.parse(message.body);
                    onDrawingEvent(payload);
                });
                // TODO: remove unused arg?
                subscriptionClearRef.current = connRef.current.subscribe(`/topic/whiteboard/clear/${sessionID}`, (message) => {
                    onClearEvent();
                });
            }
        };

        connRef.current = new Client(stompConfig);
        connRef.current.activate();
    }, [sessionID]);

    const handleMouseDown = (e) => {
        setDrawing(true);
        if (mode === modes["LINE"]) {
            let mouseX = e.clientX - canvasOffset.x;
            let mouseY = e.clientY - canvasOffset.y;
            setPosition({ x: mouseX, y: mouseY });
        }
    }

    const handleMouseUp = (e) => {
        if (mode === modes["LINE"]) {
            handleDrawLine(e);
        }
        setDrawing(false);
    }

    const handleMouseMove = (e) => {
        if (mode === modes["PEN"] || mode === modes["ERASE"]) {
            handleDrawLine(e);
        }
    }

    const handleDrawLine = (e) => {
        // TODO: add debounce so this does not fire too often
        let mouseX = e.clientX - canvasOffset.x;
        let mouseY = e.clientY - canvasOffset.y;
        if (drawing) {
            let activeColor = mode === modes["ERASE"] ? "#FFFFFF" : color;
            drawLine(position.x, position.y, mouseX, mouseY, activeColor, thickness);
            publishDraw(position.x, position.y, mouseX, mouseY, activeColor, thickness);
        }
        setPosition({ x: mouseX, y: mouseY });
    }

    const drawLine = (x0, y0, x1, y1, lineColor, lineThickness) => {
        let canvas = canvasRef.current;
        if (!canvas) return;
        let ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
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
        if (!canvas) return;
        const w = canvas.width;
        const h = canvas.height;

        if (!connRef.current?.connected) return;
        connRef.current.publish({
            destination: `/app/whiteboard/line/${sessionID}`,
            body: JSON.stringify({
                x0: x0 / w,
                y0: y0 / h,
                x1: x1 / w,
                y1: y1 / h,
                color: lineColor,
                thickness: lineThickness,
            })
        });
    }

    const publishClear = () => {
        if (!connRef.current?.connected) return;
        connRef.current.publish({
            destination: `/app/whiteboard/clear/${sessionID}`,
            body: "clear"
        });
    }

    const handleColorChange = (c) => {
        setColor(c);
    }

    const handleModeChange = (m) => {
        setMode(m);
    }

    const handleThicknessChange = (e, val) => {
        setThickness(val);
    }

    const handleSessionIDChange = (id) => {
        setSessionID(id);
        if (subscriptionLineRef.current) {
            subscriptionLineRef.current.unsubscribe();
            subscriptionLineRef.current = null;
        }
        if (subscriptionClearRef.current) {
            subscriptionClearRef.current.unsubscribe();
            subscriptionClearRef.current = null;
        }
    }

    const clearCanvas = () => {
        let canvas = canvasRef.current;
        if (!canvas) return;
        let ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const handleClear = () => {
        clearCanvas();
        publishClear();
    }

    return (
        <div className="board" ref={parentRef}>
            <Controls sessionID={sessionID}
                color={color}
                modes={modes}
                handleMode={handleModeChange}
                handleColor={handleColorChange}
                handleThickness={handleThicknessChange}
                handleSessionID={handleSessionIDChange}
                handleClear={handleClear} />
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
