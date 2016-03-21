var schedule = require('node-schedule');
var request = require('request')



var j = schedule.scheduleJob('0 * * * * *', function() {
  getPoints();
});



function getPoints() {
  var dataset = [];
  var url = 'http://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&rows=3000&facet=banking&facet=bonus&facet=status&facet=contract_name';
  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      body = JSON.parse(body);
      var rows = body.records;

      for (var i = 0; i < rows.length; i++) {
        var current = rows[i];
        if (current.fields.status == "CLOSED") {
          dataset.push({
            open: false,
            Lat: current.geometry.coordinates[1],
            Lng: current.geometry.coordinates[0],
            stands: 0,
            bikes: 0
          });
          continue;
        }

        dataset.push({
          open: true,
          Lat: current.geometry.coordinates[1],
          Lng: current.geometry.coordinates[0],
          stands: current.available_bikes_stands,
          bikes: current.fields.available_bikes

        });
      }
      console.log('We have all the data we need for this time : ' + dataset.length);
    }

  });
}
