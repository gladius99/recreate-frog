var data;

function importTheStuff() {
 	var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(this.responseText);
            }
        };
    xmlhttp.open("GET", "working-output.txt", true);
    xmlhttp.send();
    setTimeout(function() { tradeSpace3();}, 500);
}
