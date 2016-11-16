import React from 'react';
import jsHue from './jshue.js';
import './App.css';
import YouTubePlayer from 'youtube-player';
import script from './script.js';
let player;
var timer;
//import gapi from './api.js';
//console.log(google);
//import 'googleapis';
//import './api.js';

var hue = jsHue();
var user;

var App = React.createClass({
	componentDidMount: function(){
		this.discover();
		player = YouTubePlayer("video-player");
		player.loadVideoById('fXSovfzyx28');
		player
    .stopVideo()
    .then(() => {
        console.log("I stopped the video");
    });
	},
	playVideo: function(){
		player.playVideo();
		
		timer = setInterval(this.playScript, 1000);
	},
	stopVideo: function(){
		player.stopVideo();
		clearInterval(timer);
	},
	playScript: function(){
		player.getCurrentTime().then((data) => {
        var time = Math.round(data);
        script.filter(function(step){
        	if(step.t == time){
        		user.setLightState(9, {on: step.on, hue: step.hue, sat: step.sat, transitiontime: step.transition}, function(data) { /* ... */ });
        	}
        })
    });
	},
	discover: function(){
		hue.discover(
	    function(bridges) {
	        if(bridges.length === 0) {
	            console.log('No bridges found. :(');
	        }
	        else {
	            bridges.forEach(function(b) {
	                console.log('Bridge found at IP address %s.', b.internalipaddress);
	                console.log('Quickly! Click the bridge button!');
	                var bridge = hue.bridge(b.internalipaddress);

	                // create user account (requires link button to be pressed)
	                // bridge.createUser('hue-music-app', function(data) {
	                //     // extract bridge-generated username from returned data
	                //     var username = data[0].success.username;

	                //     console.log('New username:', username);

	                //     // instantiate user object with username
	                //     user = bridge.user(username);
	                //     user.getLights(function(data){
	                //     	console.log(data[9]);
	                //     });
	                // });
	                user = bridge.user("R5w7s0A3fVWBnVAve9NAOQA6wtT51wBqgLZAd4x-");
	                user.getLights(function(data){
	                    	console.log(data[9]);
	                    });
	            });
	        }
	    },
	    function(error) {
	        console.error(error.message);
	    }
		);
	},
	toggleLight: function(){
		user.getLight(9,function(data){
			//console.log(data.state.on);
			if(data.state.on){
				user.setLightState(9, { on: false }, function(data) { /* ... */ });
			}else{
			user.setLightState(9, { on: true }, function(data) { /* ... */ });
			}
		})
	},
	turnRed: function(){
		user.setLightState(9, { hue: 65535, sat: 254 }, function(data) { /* ... */ });
	},
  render() {
    return (
      <div className="App">
	      <div className="app-top">
	      	<div id="video-player"></div>
	      </div>
	      <div className="connect-button">
	      	<img src="img/bridge_icon_white.svg" onClick={this.discover} alt="Discover Bridges"/>
	      </div>
	      <button className="light-button" onClick={this.toggleLight}>Toggle Light</button>
	      <button className="light-button" onClick={this.turnRed}>Turn Light Red</button>
	      <button className="light-button" onClick={this.playVideo}>Play Video</button>
	      <button className="light-button" onClick={this.stopVideo}>Stop Video</button>
      </div>
    );
  }
})

export default App;
