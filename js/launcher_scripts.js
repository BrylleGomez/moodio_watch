/////////////////////////////////////////////////////////////////////////////
/////* ~~~~~~~~~~~~~~~~~~ Scripts for launcher.html ~~~~~~~~~~~~~~~~~~ */////
/////////////////////////////////////////////////////////////////////////////

////////////////////////////////// ON LOAD //////////////////////////////////

window.onload = init();

	
function init() {	// begin window.onload 
	
	// Debug
	console.log("Starting LAUNCHER scripts!");
	
	var sensors = tizen.sensorservice.getAvailableSensors();
	console.log('Available sensor: ' + sensors.toString());
	
	// Attach back key listener
	window.addEventListener("tizenhwkey", function(ev) {
		var activePopup = null, page = null, pageId = "";
		if (ev.keyName === "back") {
			activePopup = document.querySelector(".ui-popup-active");
			page = document.getElementsByClassName("ui-page-active")[0];
			pageId = page ? page.id : "";
			if (pageId === "main" && !activePopup) {
				try {
					console.log("Exiting app!");
					tizen.application.getCurrentApplication().exit();
				} catch (ignore) {
				}
			} else {
				console.log("Back key pressed!");
				window.history.back();
			}
		}
	});
	
	// Connect to MQTT
	console.log("Attempting to Connect...");		
    mqttClient.connect({onSuccess:onConnect});			// connect to MQTT broker
    mqttClient.onMessageArrived = onMessageArrived;		// set message arrival callback
	
	/* ~~~~~~~~~~~~~~~~~~~~~~~~ Section Changer ~~~~~~~~~~~~~~~~~~~~~~~~ */
	
	var self = this, page = document.getElementById("main"), changer = document
			.getElementById("hsectionchanger"), sectionChanger, elPageIndicator = document
			.getElementById("pageIndicator"), pageIndicator, pageIndicatorHandler;

	page.addEventListener("pagebeforeshow", function() {
		/* Create PageIndicator */
		pageIndicator = tau.widget.PageIndicator(elPageIndicator, {
			numberOfPages : 2,
			layout : "circular"
		});
		pageIndicator.setActive(0);

		sectionChanger = new tau.widget.SectionChanger(changer, {
			circular : false,
			orientation : "horizontal",
			useBouncingEffect : true
		});
	});

	page.addEventListener("pagehide", function() {
		sectionChanger.destroy();
		pageIndicator.destroy();
	});

	// Indicator setting handler
	pageIndicatorHandler = function(e) {
		pageIndicator.setActive(e.detail.active);
	};

	// Bind the callback 
	changer.addEventListener("sectionchange", pageIndicatorHandler, false);
	
}	// end window.onload 

/////////////////////////////////////////////////////////////////////////////


////////////////////////////// EVENT LISTENERS //////////////////////////////

$("#launcher_smiley").click(function(){
	window.location.pathname = '/dashboard.html';
});

$("#div_playlist").click(function(){
	window.location.pathname = '/playlists.html';
});

$("#div_play").click(function(){
	// send "play/pause" to MQTT topic "moodio/music"
	var message = new Paho.MQTT.Message("play");
    message.destinationName = mqtt_music_control;
    mqttClient.send(message); // publish message
});

$("#div_next").click(function(){
	// send "next" to MQTT topic "moodio/music"
	var message = new Paho.MQTT.Message("next");
    message.destinationName = mqtt_music_control;
    mqttClient.send(message); // publish message
});

$("#div_prev").click(function(){
	// send "prev" to MQTT topic "moodio/music"
	var message = new Paho.MQTT.Message("prev");
    message.destinationName = mqtt_music_control;
    mqttClient.send(message); // publish message
});

/////////////////////////////////////////////////////////////////////////////


///////////////////////// HELPER/CALLBACK FUNCTIONS /////////////////////////

//Dismiss feedback message
$(".dismissFeedback").click(function(){
	  $("#div_feedback").hide();
});

// MQTT onConnect
function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("Connected to MQTT broker!");
    mqttClient.subscribe(mqtt_mood);
    mqttClient.subscribe(mqtt_music_info);
    console.log("Subscribed to all topics!");
    
    // Fetch mood from server via MQTT
    var message = new Paho.MQTT.Message("moodreq");
    message.destinationName = mqtt_mood;
    mqttClient.send(message); // publish message
    
}

// MQTT onMessageArrived
function onMessageArrived(message){
	
	if(message.destinationName == mqtt_mood && message.payloadString != "moodreq"){
		
		console.log("Response from server: " + message.payloadString);			// test
		updateMood(message.payloadString);										// update global variable with mood retrieved from server
		updateLauncherUI();												// update UI due to mood change
		
    }
	
	if(message.destinationName == mqtt_music_info && message.payloadString.charAt(0) == "{"){
		
		console.log("Response from server: " + message.payloadString);			// test
		var songDetails = JSON.parse(message.payloadString);
		var songArtist = songDetails.artist;
		var songTitle = songDetails.title;
		updateMusicUI(songArtist, songTitle);							// update music player UI
		
    }
	
}

// Update launcher UI
function updateLauncherUI() {
	
	// Launcher Smiley & Message
	var smiley_src = "";
	var launcher_message = "";
	switch(current_mood) {
		case mood.HAPPY:
			smiley_src = "css/images/happy_smiley.png";
			launcher_message = "Someone's in a cheerful mood!";
			break;
		case mood.SAD:
			smiley_src = "css/images/sad_smiley.png";
			launcher_message = "Why the sad face?";
			break;
		case mood.ANGRY:
			smiley_src = "css/images/angry_smiley.png";
			launcher_message = "Someone's all worked up...";
			break;
		default: // default is happy
			smiley_src = "";
			launcher_message = "ERROR!";
	}
	$("#launcher_smiley").attr("src", smiley_src);
	$("#laucher_message").text(launcher_message);
	
}

// Update music player UI
function updateMusicUI(artist_name,song_title) {

	var playlist_name = "";
	switch(current_mood) {
	case mood.HAPPY:
		playlist_name = "Happy Playlist"

		break;
	case mood.SAD:
		playlist_name = "Sad Playlist"
		break;
	case mood.ANGRY:
		playlist_name = "Angry Playlist"
		break;
	default: // default is happy
		playlist_name = "Happy Playlist"			
	}
	
	$("#div_artistname").text(artist_name);
	$("#div_songtitle").text(song_title);
	$("#div_playlist").text(playlist_name);
	
}

/////////////////////////////////////////////////////////////////////////////