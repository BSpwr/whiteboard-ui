import React, { Component } from 'react';
import SockJsClient from 'react-stomp';
import './App.css';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  sendMessage = (msg) => {
    this.clientRef.sendMessage('/topics/all', msg);
  }

  render() {
    return (
      <div>
        <canvas class="whiteboard" ></canvas>

        <div class="colors">
          <div class="color black"></div>
          <div class="color red"></div>
          <div class="color green"></div>
          <div class="color blue"></div>
          <div class="color yellow"></div>
        </div>
        <SockJsClient url='http://localhost:8080/ws' topics={['/topics/all']}
          onMessage={(msg) => { console.log(msg); }}
          ref={(client) => { this.clientRef = client }} />
      </div>
    );
  }
}

export default App;
