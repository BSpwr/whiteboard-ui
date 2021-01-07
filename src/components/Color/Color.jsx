import React, { useState } from "react";
import { CompactPicker } from "react-color";

function Color(props) {
    const [color, setColor] = useState("#000000");

    function handleChange(colorPicker) {
        setColor(colorPicker.hex);
        props.handleColor(colorPicker.hex);
    }

    return (
        <div >
            <CompactPicker color={color} onChange={handleChange} />
        </div>
    );
}

export default Color;
