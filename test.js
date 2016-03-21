var schedule = require('node-schedule');
var request = require('request')



var j = schedule.scheduleJob('0 * * * * *', function() {
  getPoints();
});



function getPoints() {
  console.log("on lance la requête \n")
  var stations = [];
  var filling = [];
  var url = 'http://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&rows=3000&facet=banking&facet=bonus&facet=status&facet=contract_name';
  request(url, function(error, response, body) {
    console.log("C'est parti mon kiki " + response.statusCode + "\n");
    var name;
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      var rows = body.records;

      for (var i = 0; i < rows.length; i++) {
        var current = rows[i];

        id = current.fields.name.split(" ", 1);

        stations.push({
          id: id[0],
          Lat: current.geometry.coordinates[1],
          Lng: current.geometry.coordinates[0]
        });

        if (current.fields.status == "CLOSED") {

          filling.push({
            open: false,
            station_id: id[0],
            stands: 0,
            bikes: 0
          });
          continue;
        }

        filling.push({
          open: true,
          station_id: id[0],
          stands: current.fields.available_bikes_stands,
          bikes: current.fields.available_bikes

        });
      }
      console.log(filling);
    }

  });
}
