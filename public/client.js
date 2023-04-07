

var raceResults = {};

function readJSON(file) {
    var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {//Called when data returns from server
		if (this.readyState == 4 && this.status == 200) {
			var raceRes = JSON.parse(this.responseText);
			raceResults = raceRes;
			alert(JSON.stringify(raceResults));
			//createUserHeader(marshie[1]);
		}   
		else {
		  //alert("Error communicating with server: " + xhttp.status);
		}
	  };

    xhttp.open('GET', '/getraces', true);
    xhttp.send();
    //if (request.status == 200)
      //  return request.responseText;
};

var temp = readJSON('../GirraphicTest/MarathonResults.json');
//alert(temp);