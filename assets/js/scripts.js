
// Initialize Firebase
var config = {
apiKey: "AIzaSyBpbio7NfAYedYz6b3TH1EsiF00RCXtTls",
authDomain: "chuchu-27407.firebaseapp.com",
databaseURL: "https://chuchu-27407.firebaseio.com",
projectId: "chuchu-27407",
storageBucket: "",
messagingSenderId: "348685910300"
};
firebase.initializeApp(config);

var database = firebase.database();

var trainRef = database.ref().child("trains");
var trainsSnapshot = {};

//update the trains variable when it is changed
database.ref("trains").on("value", function(snapshot) {
	trainsSnapshot = snapshot.val();

});

// on submit button click
$("#trainSubmit").on("click", function() {
	event.preventDefault();
	// get the value from the inputs
	var name = $("#trainName").val();
	var destination = $("#destination").val();
	var ftt = $("#firstTrainTime").val();
	var frequency = $("#frequency").val();
	//push a new object to "trains"
	trainRef.push().set({
		name: name,
		destination: destination,
		firstTrainTime: ftt,
		frequency: frequency,
	});
		$("input").val("");
})

function addNewTrain(train, key) {
	// the difference betwenn first train and now
	
	var row = $("<tr>").attr("id",key);
	
	$(row).appendTo("tbody");

	calcTrainInfo(train,key);

}

function calcTrainInfo(train, key) {

	var diff = moment().diff(moment(train.firstTrainTime, 'HH:mm'),'minutes');
	var nextTrain;
	var minutesUntil;
	if (diff < 0) {
		nextTrain = moment(train.firstTrainTime, 'HH:mm a').format('hh:mm a') + " (first)";
		minutesUntil = (moment(train.firstTrainTime, 'HH:mm').diff(moment(),'minutes'));
	} else {
		var mod = diff%train.frequency;

		// time passed since first train minus the remainer from the frequency
		var mult = diff - mod;
		// add mult + one interval length to get next train
		var lastTrain = moment(train.firstTrainTime, 'HH:mm').add(mult ,'minutes').format('hh:mm a');
		// console.log(lastTrain);
		nextTrain = (moment(lastTrain, 'hh:mm a')).add(train.frequency,'minutes').format('hh:mm a');
		// console.log(nextTrain);
		minutesUntil = train.frequency - mod;

	}
 
	var trainTime = moment(train.ftt, 'HH:mm')._i; 
	var row = $("#" + key);
	// make it empty
	$(row).empty();
	// add the cells

	var cell = $("<td>");
	var name = $(cell).clone().html(train.name);
	var destination = $(cell).clone().html(train.destination);
	var frequency = $(cell).clone().html(train.frequency);
	var ftt = $(cell).clone().html(train.ftt);
	var nextTrainCell = $(cell).clone().html(nextTrain);
	var	minutesAway = $(cell).clone().html(minutesUntil);

	$(row).append(name).append(destination).append(frequency).append(nextTrainCell).append(minutesAway);


}
function updateCells() {

}


$(document).ready(function() {
	database.ref("trains").on("child_added", function(childSnapshot) {
		addNewTrain(childSnapshot.val(),childSnapshot.key);
	});

	database.ref("trains").on("child_changed", function(childSnapshot) {
		calcTrainInfo(childSnapshot.val(),childSnapshot.key);

	});
	

	//re-add all the trains relative to the current time
	var update = setInterval(function() {
		$("tbody").empty();
		$.each(trainsSnapshot, function(key,value) {
			addNewTrain(value,key);
		})
	}, 60000);
});
	


