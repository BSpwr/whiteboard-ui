import React, { useState } from "react";
import { CompactPicker } from "react-color";

function Color(props) {
  const popover = {
    position: "absolute",
    zIndex: "2",
  };
  const cover = {
    position: "fixed",
    top: "0px",
    right: "0px",
    bottom: "0px",
    left: "0px",
  };
  const [color, setColor] = useState("#000000");

  function handleChange(pickerColor) {
    setColor(pickerColor.hex);
    props.handleColor(pickerColor.hex);
  }

  return (
    <div className="color">
      <CompactPicker color={color} onChange={handleChange} />
    </div>
  );
}

export default Color;
