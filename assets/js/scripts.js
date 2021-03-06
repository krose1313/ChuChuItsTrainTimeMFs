
// Initialize Firebase and add Firebase configs
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

//update train "table" in firebase when the user enters train info
database.ref("trains").on("value", function(snapshot) {
	trainsSnapshot = snapshot.val();

});

// user submits a new train with new data 
$("#trainSubmit").on("click", function() {
	event.preventDefault();
	// trim the values the user enters
	var name = $("#trainName").val();
	var destination = $("#destination").val();
	var ftt = $("#firstTrainTime").val();
	var frequency = $("#frequency").val();
	//push the trimmed data the user enters to the Firebase db
	trainRef.push().set({
		name: name,
		destination: destination,
		firstTrainTime: ftt,
		frequency: frequency,
	});
		$("input").val("");
})

//user inputs a new train and this function update that data to the 'tbody' section of the HTML
function addNewTrain(train, key) {
	
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

		nextTrain = (moment(lastTrain, 'hh:mm a')).add(train.frequency,'minutes').format('hh:mm a');

		minutesUntil = train.frequency - mod;

	}
 
	var trainTime = moment(train.ftt, 'HH:mm')._i; 
	var row = $("#" + key);

	$(row).empty();


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
	

	//set train times relevant to current time for user
	var update = setInterval(function() {
		$("tbody").empty();
		$.each(trainsSnapshot, function(key,value) {
			addNewTrain(value,key);
		})
	}, 60000);
});
	


