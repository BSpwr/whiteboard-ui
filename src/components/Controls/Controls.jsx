import React from "react";
import "./Controls.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser, faPen, faRuler, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { CompactPicker } from "react-color";
import Slider from "../Slider/Slider";
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';

function Controls(props) {
  return (
    <div className="controls">
      <div className="colorBox">
        <CompactPicker color={props.color} onChange={(colorPicker) =>
          props.handleColor(colorPicker.hex)
        } />
      </div>
      <div className="penBox">
        <FontAwesomeIcon
          title="Pen"
          icon={faPen}
          className="fa-icon"
          size="5x"
          onClick={() => props.handleMode(props.modes["PEN"])}
          inverse />
      </div>
      <div className="rulerBox">
        <FontAwesomeIcon
          title="Line"
          icon={faRuler}
          className="fa-icon"
          size="5x"
          onClick={() => props.handleMode(props.modes["LINE"])}
          inverse />
      </div>
      <div className="eraserBox">
        <FontAwesomeIcon
          title="Eraser"
          icon={faEraser}
          className="fa-icon"
          size="5x"
          onClick={() => {
            props.handleMode(props.modes["ERASE"]);
          }}
          inverse />
      </div>
      <div className="sliderBox"><Slider handleThickness={props.handleThickness} /></div>
      <div className="sessionBox">
        <TextField
          variant="filled"
          InputLabelProps={{
            style: {
              color: "white"
            }
          }}
          InputProps={{
            style: {
              color: "white"
            }
          }}
          className="sessionName"
          label="Session ID"
          value={props.sessionID}
          onChange={(event) => props.handleSessionID(event.target.value)}
        />
      </div>
      <div className="clearBox">
        <FontAwesomeIcon
          title="Clear"
          icon={faTrashAlt}
          className="fa-icon"
          size="5x"
          onClick={props.handleClear}
          inverse />
      </div>

    </div>
  );
}

Controls.propTypes = {
  sessionID: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  modes: PropTypes.object.isRequired,
  handleClear: PropTypes.func.isRequired,
  handleMode: PropTypes.func.isRequired,
  handleColor: PropTypes.func.isRequired,
  handleThickness: PropTypes.func.isRequired,
  handleSessionID: PropTypes.func.isRequired,
};

export default Controls;
