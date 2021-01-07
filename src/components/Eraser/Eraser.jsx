import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser } from "@fortawesome/free-solid-svg-icons";

function Eraser(props) {
  function handleEraser(e) {
    e.preventDefault();
    props.handleColor("#ffffff");
  }

  return (
    <div className="eraser">
      <FontAwesomeIcon
        title="erase"
        icon={faEraser}
        className="fa-icon"
        size="5x"
        onClick={handleEraser}
        inverse />
    </div>
  );
}

export default Eraser;
