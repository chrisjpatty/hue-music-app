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
	getInitialState: function(){
		return{
			lights: null,
			duration: 0,
			script: null
		}
	},
	componentDidMount: function(){
		this.discover();
	},
	loadVideo: function(){
		player = YouTubePlayer("video-player");
		player.loadVideoById('fXSovfzyx28');
		player.on('stateChange', (event) => {
	    if(event.data == 1){
	    	player.getDuration().then((data) => {
	    		var lights = this.state.lights;
	    		var lightArray = [];
	    		var duration = Math.round(data);
	    		
	    		lights.filter(function(light){
	    			var script = [];
		    		for(var i = 0; i < duration; i++){
		    			script.push({t:i+1, on: false, bri: 254, hue: 65535, sat: 0, transition: 0});
		    		}
	    			lightArray.push({light: light, lightScript: script});
	    		})

	    		console.log("lightArray",lightArray);
	    		this.setState({
	    			duration: duration,
	    			script: lightArray
	    		})
	    	});
	    	this.stopVideo();
	    }
		});
	},
	playVideo: function(){
		player.playVideo().then(() => {
			timer = setInterval(this.playScript, 1000);
		});
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
		var capture = this;
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
	                capture.getLights();
	            });
	        }
	    },
	    function(error) {
	        console.error(error.message);
	    }
		);
	},
	getLights: function(){
		var capture = this;
    user.getLights(function(data){
    	var numLights = Object.keys(data).length;
    	var lights = [];
    	for(var i = 0; i < numLights; i++){
    		if(typeof data[(i+1)] !== 'undefined'){
    			data[(i+1)].lightId = i+1;
    			lights.push(data[(i+1)]);
    		}
    	}
			console.log(lights);
    	capture.setState({
    		lights: lights
    	}, function(){
    		this.loadVideo();
    	})
    });
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
  	var lights = this.state.lights;
    return (
      <div className="App">
	      <div className="app-top">
	      	<div id="video-player"></div>
	      </div>
	      <div className="app-bottom">
		      <div className="timeline-wrapper">
		      	<table className="timeline">
		      		<thead>
		      			<tr>
			      			<th>
			      				Light Name
			      			</th>
			      			{
					      		this.state.script == null ?
					      		null
					      		:
					      		this.state.script[0].lightScript.map(function(light, i){
					      			return <TimeHead time={i%5 == 0 ? i : null} key={i}/>
					      		})
					      	}
				      	</tr>
		      		</thead>
		      		<tbody>
				      	{
				      		this.state.script == null ?
				      		null
				      		:
				      		this.state.script.map(function(light, i){
				      			return <LightRow light={light} key={i}/>
				      		})
				      	}
			      	</tbody>
		      	</table>
		      </div>
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

var LightRow = React.createClass({
	render: function(){
		return(
			<tr className="light-row">
				<td className="light-column name-column">
					{this.props.light.light.name}
				</td>

					{
						this.props.light.lightScript.map(function(second, i){
							return <Second key={i}/>
						})
					}

			</tr>
		)
	}
})

var TimeHead = React.createClass({
	render: function(){
		return(
			<th className="lh">{this.props.time}</th>
		)
	}
})

var Second = React.createClass({
	getInitialState: function(){
		return {
			showModal: false
		}
	},
	toggleModal: function(){
		if(this.state.showModal){
			this.setState({
				showModal: false
			})
		}else{
			this.setState({
				showModal: true
			})
		}
	},
	render: function(){
		return(
			<td className="lc">
				<div className="ls" onClick={this.toggleModal}></div>
				{
					this.state.showModal ?
					<div className="second-modal">
						<div className="modal-row">
							<label>Hue</label>
							<input className="modal-input" />
						</div>
						<div className="modal-row">
							<label>Brightness</label>
							<input className="modal-input" />
						</div>
						<div className="modal-row">
							<label>Saturation</label>
							<input className="modal-input" />
						</div>
						<div className="modal-row">
							<label>Transition</label>
							<input className="modal-input" />
						</div>
					</div>
					:
					null
				}
			</td>
		)
	}
})

export default App;
