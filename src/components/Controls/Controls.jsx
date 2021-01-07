import React from "react";
import "./Controls.css";
import Color from "../Color/Color";
import Eraser from "../Eraser/Eraser";
import { AppBar } from '@material-ui/core';


function Controls(props) {
  return (
    <div className="controls">
      <div className="colorBox"><Color handleColor={props.handleColor} /></div>
      <div className="eraserBox"><Eraser handleColor={props.handleColor} /></div>

      {/* 
      <Eraser handleColor={props.handleColor} />
      <Eraser handleColor={props.handleColor} />
      <Eraser handleColor={props.handleColor} /> */}

    </div>
  );
}

export default Controls;
