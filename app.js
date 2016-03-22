var schedule = require('node-schedule');
var request = require('request');
var moment = require('moment');
var Log = require('log'),
  log = new Log('info');
var pg = require('pg');
var conString = "postgres://thomas:test@localhost/velib";



var job = schedule.scheduleJob('*/2 * * * *', function() { //run every two minutes
  getPoints();
});



/**
 * getPoints - function that retriev all the data from open data paris and then dispach the interresting info into two different arrays
 *
 * @return {type}  none
 */
function getPoints() {
  log.debug("On lance la requête \n");
  var stations = [];
  var filling = [];
  var url = 'http://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&rows=3000&facet=banking&facet=bonus&facet=status&facet=contract_name';
  request(url, function(error, response, body) {
    log.debug("C'est parti mon kiki " + response.statusCode + "\n");
    var name;
    if (!error && response.statusCode == 200) {
      var date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss Z'); //WHY NOT A UNIX TIME STAMP ?
      //var date = new Date().getTime();
      //Number of miliseconds since January, first, 1970. On a 32/64 bits integer
      //(Could be parsed to 32 bits int for database storage) => see ToInt32 method

      body = JSON.parse(body);
      var rows = body.records;

      for (var i = 0; i < rows.length; i++) {
        var current = rows[i];

        id = current.fields.name.split(" ", 1)[0];

        stations.push({
          id: id,
          lat: current.geometry.coordinates[1],
          lng: current.geometry.coordinates[0]
        });

        if (current.fields.status == "CLOSED") {

          filling.push({
            open: false,
            station_id: id,
            stands: 0,
            bikes: 0,
            date
          });
          continue;
        }

        filling.push({
          open: true,
          station_id: id,
          stands: current.fields.available_bike_stands,
          bikes: current.fields.available_bikes,
          date
        });
      }
      log.info('Information retrieved, ' + filling.length + ' lines recorded for date: ' + date);
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
  var i, j;
  var client = new pg.Client(conString);
  var sql;

  client.connect(function(err) {
    if (err) {
      return console.error('could not connect to postgres', err);
    }

    client.query('select * from station', function(err, result) {

      if (err) {
        return console.error('error running query', err);
      }

      if (result.rows.length == 0) {
        for (i = 0; i < array_stations.length; i++) {
          sql = `insert into station (lat, lng, id) values (${array_stations[i].lat},${array_stations[i].lng},\'${array_stations[i].id}\');`;
          client.query(sql, function(err, res) {});
        }
      } else if (result.rows.length != array_stations.length) {
        //TODO gérer la comparaison et l'ajout de nouvelles stations
      }

      for (j = 0; j < array_filling.length; j++) {
        sql = `insert into filling (open,station_id,stands,bikes,creation_date) values (${array_filling[j].open},\'${array_filling[j].station_id}\',${array_filling[j].stands},${array_filling[j].bikes},\'${array_filling[j].date}\');`
        //log.debug(sql);
        if (j < array_filling.length - 1) {
          client.query(sql);
        } else {
          client.query(sql, function(err, res) {
            client.end();
            log.info('All data are saved in DB');
          });
        }
      }
    });
  });

}
