var rawData = [];

//read data from file
function readJSON() {
    var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {//Called when data returns from server
		if (this.readyState == 4 && this.status == 200) {
			var raceRes = JSON.parse(this.responseText);
			rawData = raceRes;
			//alert(JSON.stringify(rawData));
			setUp();
		}   
		else {
		  //alert("Error communicating with server: " + xhttp.status);
		}
	  };

    xhttp.open('GET', '/getraces', true);
    xhttp.send();
};

window.onload = function() {
	readJSON();
};

function createHeader() {
	var hdr = document.getElementById("header");
	var logo = document.createElement("img");
	logo.src = "logo.png";
	logo.width = 120;

	hdr.appendChild(logo);
}


//rawData = list of races if more than one JSON file/race results file present
//selectrace = default of first in list; displays name of race

function selectRace() {
	var raceNames = [];

	for(var i=0; i<rawData.length; i++) {
		raceNames.push(rawData[i].results.racename);
	}

	var label = document.createElement("p");
	label.innerHTML = "Select Race:  "

	var sel = document.createElement("select");
	sel.id = "selectrace";
	sel.onchange = function() {
		currentRace = this.value;
		createRaceHeader();
		createRaceResults();
	};
	
	//create options with label = race name
	for(var j=0; j<raceNames.length; j++) {
		var opt = document.createElement("option");
		opt.value = raceNames[j];
		opt.innerHTML = raceNames[j];
		sel.appendChild(opt);
	}

	label.appendChild(sel);
	document.getElementById("selectRace").appendChild(label);
}

//currentRace = list of details and athletes of selected race
var currentRace = {};

function createRaceHeader() {
	var selection = document.getElementById("selectrace").value;
	var div = document.getElementById("raceHeader");
	currentRace = getSelectedRace(selection);
	
	//race data = race name, length, category, date
	var hdr = "<table style='width:100%;'><tr><td><h1>" + currentRace.racename + "</h1></td></tr>";
	hdr += "<tr><td><h3>Category: " + capitalize(currentRace.gender) + "</h3></td><td><h3>Date: " + new Date(currentRace.tod).toLocaleDateString("en-US", {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}) + "</h3></td></tr>";
	hdr += "<tr><td><h3>Length: " + currentRace.racelength + " miles</h3></td><td style='text-align:right;'><button onclick='formatJSON()' style='text-decoration:underline;'>Download CSV</button></td></tr>";
	hdr += "</table>";

	div.innerHTML = hdr;
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getSelectedRace(rname) {
	for(var i=0; i<rawData.length; i++) {
		if(rawData[i].results.racename == rname) {
			return JSON.parse(JSON.stringify(rawData[i].results));
		}
	}
}

function createRaceResults() {
	//var selection = document.getElementById("selectrace").value;
	var div = document.getElementById("results");
	//var currentRace = getSelectedRace(selection);

	var res = "<h1>Race Results</h1>";
	res += "<table id='raceresults'><tr><th><button onclick='sortRacers(currentRace.athletes,\"rank\")'>Rank ⇵</button></th><th><button onclick='sortRacers(currentRace.athletes,\"bibnumber\")'>Bib ⇵</button></th><th><button onclick='sortRacers(currentRace.athletes,\"flag\")'>Country ⇵</button></th><th>Name</th><th>Time</th></tr>";

	for(var i=0; i<currentRace.athletes.length; i++) {
		var racer = currentRace.athletes[i];
		if(parseInt(racer.rank)<=3) {
			res += "<tr style='background-color:#DAA030'><td>" + racer.rank + "</td><td>" + racer.bibnumber + "</td><td>" + racer.flag + "</td><td>" + racer.firstname.concat(" ", racer.surname) + "<td>" + racer.finishtime + "</td></td></tr>";
		} else {
			res += "<tr><td>" + racer.rank + "</td><td>" + racer.bibnumber + "</td><td>" + racer.flag + "</td><td>" + racer.firstname.concat(" ", racer.surname) + "<td>" + racer.finishtime + "</td></td></tr>";
		}
	}

	res += "</table>";

	div.innerHTML = res;
}


function createFooter() {
	var ftr = document.createElement("footer");
	ftr.innerHTML = "<p style='font-size:10px;'>Girraphic Junior Software Developer Media Information System With Data Export - Kristen Rebello</p>";

	document.getElementById("footer").appendChild(ftr);
}

//SORT

//sorted in ascending? true/false
//default sort by rank
var sortedAsc = {
	"rank": true,
	"bibnumber": false,
	"flag": false //country on table
};

function sortRacers(arr, cat) {
	//reset other values
	var objkeys = Object.keys(sortedAsc);
	for(var i=0; i<objkeys.length; i++) {
		if(objkeys[i] != cat) {
			sortedAsc[objkeys[i]] = false;
		}
	}

	//deal with category
	if(sortedAsc[cat]) {
		sortedAsc[cat] = false;
		cat = "-" + cat;
	} else {
		sortedAsc[cat] = true;
	}

	arr.sort(dynamicSort(cat));
	createRaceResults();
}

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}


//DOWNLOAD TO CSV
function formatJSON() {
	//get original data array
	var selection = document.getElementById("selectrace").value;
	var csv = getSelectedRace(selection).athletes;
	//make changes and format according to specifications
	csv = csv.map(function(item) { 
		item.fullname = item.firstname.concat(" ", item.surname);
		delete item.firstname;
		delete item.surname;
		delete item.athleteid;
		delete item.raceprogress;
		delete item.teamname;
		item.countrycode = item.flag;
		delete item.flag; 
		delete item.countryname;
		delete item.bibnumber;
		item = JSON.parse(JSON.stringify( item, ["rank","fullname","finishtime", "countrycode"] , 4));
		return item; 
	});
	//convert to CSV
	JSONtoCSV(csv);
}


function JSONtoCSV(JSONData) {
	//If JSONData is not an object then JSON.parse will parse the JSON string in an Object
	var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

	var CSV = '';
	var row = "";

	//headers
	row = "Rank, Full Name, Finish Time, Country Code";

    CSV += row + '\r\n'; //append Label row with line break

	//1st loop is to extract each row
	for (var i = 0; i < arrData.length; i++) {
		var row = "";

		//2nd loop will extract each column and convert it in string comma-seprated
		for (var index in arrData[i]) {
			row += '"' + arrData[i][index] + '",';
		}

		row.slice(0, row.length - 1);
		CSV += row + '\r\n'; //add a line break after each row
	}

	if (CSV == '') {
		alert("Invalid data");
		return;
	}

	//Generate a file name
	var fileName = "race_results";

	//Initialize file format you want csv or xls
	var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

  
	//this will generate a temp <a /> tag
	var link = document.createElement("a");
	link.href = uri;

	//set the visibility hidden so it will not effect on your web-layout
	link.style = "visibility:hidden";
	link.download = fileName + ".csv";

	//this part will append the anchor tag and remove it after automatic click
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}



//MAIN
function setUp() {
	createHeader();
	selectRace();
	createRaceHeader();
	createRaceResults();
	createFooter();
}
