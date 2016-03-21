var schedule = require('node-schedule');
var request = require('request');
var moment = require('moment');
var Log = require('log'),
  log = new Log('info');
var pg = require('pg');
var conString = "postgres://thomas:test@localhost/velib";



var j = schedule.scheduleJob('0 * * * * *', function() {
  getPoints();
});



function getPoints() {
  log.debug("On lance la requête \n");
  var stations = [];
  var filling = [];
  var url = 'http://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&rows=3000&facet=banking&facet=bonus&facet=status&facet=contract_name';
  request(url, function(error, response, body) {
    log.debug("C'est parti mon kiki " + response.statusCode + "\n");
    var name;
    if (!error && response.statusCode == 200) {
      var date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss Z');

      body = JSON.parse(body);
      var rows = body.records;

      for (var i = 0; i < rows.length; i++) {
        var current = rows[i];

        id = current.fields.name.split(" ", 1);

        stations.push({
          id: id[0],
          lat: current.geometry.coordinates[1],
          lng: current.geometry.coordinates[0]
        });

        if (current.fields.status == "CLOSED") {

          filling.push({
            open: false,
            station_id: id[0],
            stands: 0,
            bikes: 0,
            date
          });
          continue;
        }

        filling.push({
          open: true,
          station_id: id[0],
          stands: current.fields.available_bikes_stands,
          bikes: current.fields.available_bikes,
          date
        });
      }
      log.info(date + ' information saved, ' + filling.length + ' lines recorded');
      saveDB(stations, filling);
    }
  });

}


/**
 * saveDB - Function used to save the two arrays in the database
 *
 * @param  {array of objects} array_stations holds all the stations
 * @param  {array of objects} array_filling  holds all the data to save
 * @return void                no return
 */
function saveDB(array_stations, array_filling) {
  var i;
  var client = new pg.Client(conString);
  console.log("on arrive jusque là");
  client.connect(function(err) {
    if (err) {
      return console.error('could not connect to postgres', err);
    }
    client.query('select * from station', function(err, result) {
      if (err) {
        return console.error('error running query', err);
      }
      var sql;

      if (result.rows.length == 0) {
        for (i = 0; i < array_stations; i++) {
          sql = 'insert into station (lat, lng, id) values (' + array_stations[i].lat + ',' + array_stations[i].lng + ',' + array_stations[i].id + ');';
          console.log(sql);
          client.query();
        }
      } else if (result.rows.length != array_stations.length) {
        //TODO gérer la comparaison et l'ajout de nouvelles stations
      }

      for (i = 0; i < array_filling.length; i++) {
        client.query('insert into filling (open,station_id,stands,bikes,creation_date) values (' + array_filling[i].open + ',' + array_filling[i].station_id + ',' + array_filling[i].stands + ',' + array_filling[i].bikes + ',' + array_filling[i].date + ')')
      }

      log.info('On est à la fin de save');
      //client.end();
    });
  });

}
