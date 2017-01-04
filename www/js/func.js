function err(msg) {
  if (default_app.modo == "dev") {
    alert(msg ? msg : 'Error al consultar el servicio. Intente más tarde');
  }
  else {
    navigator.notification.alert(
        (msg ? msg : 'Error al consultar el servicio. Intente más tarde'),  // message
        function() { },
        'Error',
        'OK'
    );
  }
}
function ok(msg) {
  if (default_app.modo == "dev") {
    alert(msg);
  }
  else {
    navigator.notification.alert(
        (msg ? msg : 'Operación realizada'),  // message
        function() { },
        'Listo',
        'OK'
    );
  }
}
function confirmar(msg) {
  console.log('Confirmar: '+msg);
  //if (default_app.modo == "dev") {
    return confirm(msg ? msg : '¿Desea continuar?');
  /*}
  else {
    return navigator.notification.confirm(
        (msg ? msg : '¿Desea continuar?'),  // message
        function(boton) { if (boton == 1) { return true } else { return false; }},
        'Confirmar',
        ['Si', 'No']
    );
  }*/
}
function preguntar(msg) {
  console.log('Preguntar: '+msg);
  if (default_app.modo == "dev") {
    return prompt(msg);
  }
  else {
    navigator.notification.prompt(
        (msg ? msg : 'Ingrese monto'),  // message
        function(results) { if (results.buttonIndex == 1) { return results.input1; } else { return false; }},
        'Monto',
        ['Listo','Cancelar']
    );
  }
}


String.prototype.toBytes = function() {
    var arr = []
    for (var i=0; i < this.length; i++) {
    arr.push(this[i].charCodeAt(0))
    }
    return arr
}

function calculateAndDisplayRoute(directionsService, directionsDisplay, o_lat, o_lng, d_lat, d_lng) {
  o_lat = parseFloat(o_lat);
  o_lng = parseFloat(o_lng);
  d_lat = parseFloat(d_lat);
  d_lng = parseFloat(d_lng);
  directionsService.route({
    origin: {lat: o_lat, lng: o_lng},  
    destination: {lat: d_lat, lng: d_lng},
    drivingOptions: {
      departureTime: new Date(Date.now() + 10000),  // for the time N milliseconds from now.
      trafficModel: "optimistic"
    },
    //provideRouteAlternatives: true,  
    // Note that Javascript allows us to access the constant
    // using square brackets and a string value as its
    // "property."
    travelMode: google.maps.TravelMode.DRIVING
  }, function(response, status) {
    console.log(response);
    if (response.routes[0].legs[0].duration_in_traffic.text) {
      jQuery("#div_tlr").hide();
      jQuery("#div2_tlr").show();
      jQuery("#div3_tlr").hide();
      jQuery("#timeleft_route2").html(response.routes[0].legs[0].duration_in_traffic.text);
    }
    else {
      jQuery("#div_tlr").show();
      jQuery("#div2_tlr").hide();
      jQuery("#div3_tlr").hide();
      jQuery("#timeleft_route").html(response.routes[0].legs[0].duration.text);
    }
    
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      /*
      for (var i = 0, len = response.routes.length; i < len; i++) {
        new google.maps.DirectionsRenderer({
            map: mapObject,
            directions: response,
            routeIndex: i
        });
      }
      */
    } else {
     err('Fallo servicio de direcciones ' + status);
    }
  });
}


function calculateDistance(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = Math.PI * lat1/180
  var radlat2 = Math.PI * lat2/180
  var radlon1 = Math.PI * lon1/180
  var radlon2 = Math.PI * lon2/180
  var theta = lon1-lon2
  var radtheta = Math.PI * theta/180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist)
  dist = dist * 180/Math.PI
  dist = dist * 60 * 1.1515
  if (unit=="K") { dist = dist * 1.609344 }
  if (unit=="N") { dist = dist * 0.8684 }
  return dist
}

function miles(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? ',' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + '.' + '$2');
    }
    return x1 + x2;
}

function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}