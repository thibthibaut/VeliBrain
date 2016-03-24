window.$ = window.jQuery = require('jquery');

 // This example requires the Visualization library. Include the libraries=visualization
      // parameter when you first load the API. For example:
      // <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=visualization">

      var map, heatmap;
      var dataset = [];

      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 13,
          center: {lat: 48.860, lng: 2.340},
        });
        heatmap = new google.maps.visualization.HeatmapLayer({
          radius: 20,
        });
        heatmap.setMap(map);
      }

      function toggleHeatmap() {
        heatmap.setMap(heatmap.getMap() ? null : map);
      }

      function changeGradient() {
        var gradient = [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)'
        ]
        heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
      }

      function updateRadius(newRadius) {
        heatmap.set('radius', newRadius);
        $('#radius').html(newRadius);
      }

      function changeOpacity() {
        heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
      }

      // Heatmap data: 500 Points
      function getPoints() {
        var url = 'http://opendata.paris.fr/api/records/1.0/search/?dataset=stations-velib-disponibilites-en-temps-reel&rows=3000&facet=banking&facet=bonus&facet=status&facet=contract_name';
        $.ajax(url)
        .done(function(result){
            var rows = result.records;

            for(var i=0; i<rows.length; i++){
              var current = rows[i];
              if(current.fields.status == "CLOSED")
                continue;

              dataset.push({

               location: new google.maps.LatLng(current.geometry.coordinates[1],  current.geometry.coordinates[0]),
                weight: current.fields.available_bikes
              })
            }
            console.log(dataset);
            heatmap.setData(dataset);
        });

      }

      function init(){

      
      $('#radius').html(20);
      $('#now').html(new Date() );
      getPoints();

      }


      init();
