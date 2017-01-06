angular.module('growify.controllers', [])

.controller('LoginCtrl', function($scope, $webSql, $http, $ionicModal, $rootScope, $location, $state, $localStorage, $ionicLoading) {
  
  $rootScope.db = $webSql.openDatabase("growify", "1.1", "Aplicacion Growify", 5 * 1024 * 1024);
  
  /* REBOOT DATABASE AND STORAGE */ 
  //$localStorage.growify = default_app;

  /* Preload Data */
  $scope.showload = function(msg) {
    $ionicLoading.show({template: '<ion-spinner></ion-spinner>'+(msg ? '<br>'+msg : '')}).then(function(){});
  };

  $scope.hideload = function(){
    $ionicLoading.hide().then(function(){});
  };
  

  if ($localStorage.growify && $localStorage.growify.auth == 1 && $localStorage.growify.username != "" && $localStorage.growify.password != "") {
    var data = {'username': $localStorage.growify.username, 'password': $localStorage.growify.password };
    $http.post($localStorage.growify.rest+'/login', data).
    then(function (data, status, headers, config) {
      //console.log(data);
      if (data.data.jwt) { 
        $localStorage.growify.username = $scope.loginData.username;
        $localStorage.growify.email = data.data.profile.email;
        $localStorage.growify.city = data.data.profile.city;
        $localStorage.growify.password = $scope.loginData.password;
        $localStorage.growify.access_token = data.data.jwt;     
        $localStorage.growify.auth = 1;
        $state.go("main.home");
      }
      else {
        err();
      }
    },
    function (data, status, headers, config) { 
      err(data.data.message);
      $scope.cargandoLogin = false;
      $scope.botonesLogin = true;
    });

    
  } else {
    $localStorage.growify = default_app;
  }

  $scope.goToTerms = function() { $state.go( "terms" ); }
  $scope.reloadMaster = function() {
    $scope.showload();
    $http.get($localStorage.growify.rest+'/app-options').
    then(function (data, status, headers, config) {
      $scope.hideload();
      $localStorage.growify.productBrands = [];
      $localStorage.growify.productCategory = [];
      $localStorage.growify.storeDeliveryTimes = [];
      $localStorage.growify.storeDeliveryTypes = [];
      var d = data.data;
      
      for (var i = 0; i < d.productBrands.length;i++) { $localStorage.growify.productBrands.push(d.productBrands[i]); }
      for (var i = 0; i < d.productCategory.length;i++) { $localStorage.growify.productCategory.push(d.productCategory[i]); }
      for (var i = 0; i < d.storeDeliveryTimes.length;i++) { $localStorage.growify.storeDeliveryTimes.push(d.storeDeliveryTimes[i]); }
      for (var i = 0; i < d.storeDeliveryTypes.length;i++) { $localStorage.growify.storeDeliveryTypes.push(d.storeDeliveryTypes[i]); }
      
    },
    function (data, status, headers, config) { 
      $scope.hideload();
    });
  };
  $scope.reloadMaster();

  $scope.loginData = {user: '', password: ''};
  $scope.botonesLogin = true;
  $scope.cargandoLogin = false;
  $scope.doLogin = function() {
    $scope.cargandoLogin = true;
    $scope.botonesLogin = false;
    var data = {'username': $scope.loginData.username, 'password': $scope.loginData.password };
    $http.post($localStorage.growify.rest+'/login', data).
    then(function (data, status, headers, config) {

      if (data.data.jwt) { 
        $localStorage.growify.username = $scope.loginData.username;
        $localStorage.growify.email = data.data.profile.email;
        $localStorage.growify.city = data.data.profile.city;
        $localStorage.growify.password = $scope.loginData.password;
        $localStorage.growify.access_token = data.data.jwt;    	
        $localStorage.growify.auth = 1;
        $state.go( "terms" );
      }
      else {
      	err();
      }
    },
    function (data, status, headers, config) { 
      err(data.data.message);
      $scope.cargandoLogin = false;
      $scope.botonesLogin = true;
    });
  };

  $scope.loginGoogle = function() {
    $scope.showload();
    window.plugins.googleplus.login(
        {
          'scopes': '', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
          'webClientId': '', // optional (client id of the web app/server side) clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
          'offline': false, // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
        },
        function (obj) {
          //err(JSON.stringify(obj)); // Solo para test

          // Intentar logear
          var login_xpress = {'googleToken': obj.userId };
          $http.post($localStorage.growify.rest+'/login', login_xpress).
          then(function (data, status, headers, config) {
            $localStorage.growify.access_token = data.data.jwt;
            //err('Autologin OK');
            $scope.hideload();
            $state.go( "terms" );
          },function() {
            //err('No pude hacer autologin, cuenta nueva?');
            var data = {
              'username':    obj.email, 
              'email':       obj.email, 
              'googleToken': obj.userId,
              'avatar':      obj.imageUrl,
              'firstName':    obj.displayName
            };

            $http.post($localStorage.growify.rest+'/registration', data).
            then(function (data, status, headers, config) {
              if (data.data.active == true) { 
                $localStorage.growify.username = obj.email;
                $localStorage.growify.email = obj.email;
                $localStorage.growify.googleToken = obj.userId;
                $localStorage.growify.id = data.data._id;
                $localStorage.growify.auth = 1;
                // get access token
                var login_xpress = {'googleToken': obj.userId };
                $http.post($localStorage.growify.rest+'/login', login_xpress).
                then(function (data, status, headers, config) {
                  $scope.hideload();
                  $localStorage.growify.access_token = data.data.jwt;
                  $state.go( "terms" );
                });        
              }
              else {
                $scope.hideload();
                err('No pudo acceder con Google a Growify, es posible que ya tenga una cuenta creada con el correo electrónico indicado');
              }
            },
            function (data, status, headers, config) {
              $scope.hideload(); 
              err(data.data.message);
              $scope.registrandoLoading = false;
              $scope.botonesRegistro = true;
            });
          }); 
        },
        function (msg) {
          $scope.hideload();
          err('error: ' + msg);
        }
    );
  };


  $scope.loginFacebook = function() {
    $scope.showload();
    CordovaFacebook.login({
       permissions: ['email', 'public_profile'],
       onSuccess: function(result) {
          if(result.declined.length > 0) {
             err('Se ha rechazado la conexión con Facebook');
          }
          else if (result.success == 1) {
            //err(JSON.stringify(result));

            //result.userID 
            // Intentar logear

            
            var login_xpress = {'facebookToken': result.userID };
            $http.post($localStorage.growify.rest+'/login', login_xpress).
            then(function (data, status, headers, config) {
              $localStorage.growify.access_token = data.data.jwt;
              //err('Autologin OK');
              $scope.hideload();
              $state.go( "terms" );
            },function() {
              //err('No pude hacer autologin, cuenta nueva?');

              $http.get("https://graph.facebook.com/me?fields=id,name,email&access_token="+result.accessToken, {}).
              then(function (data, status, headers, config) {
                $http.post($localStorage.growify.rest+'/registration', data).
                then(function (data, status, headers, config) {
                  if (data.data.active == true) { 
                    $localStorage.growify.username = obj.email;
                    $localStorage.growify.email = obj.email;
                    $localStorage.growify.googleToken = result.userID;
                    $localStorage.growify.id = data.data._id;
                    $localStorage.growify.auth = 1;
                    // get access token
                    var login_xpress = {'facebookToken': result.userID };
                    $http.post($localStorage.growify.rest+'/login', login_xpress).
                    then(function (data, status, headers, config) {
                      $scope.hideload();
                      $localStorage.growify.access_token = data.data.jwt;
                      $state.go( "terms" );
                    });        
                  }
                  else {
                    $scope.hideload();
                    err('No pudo acceder con Google a Growify, es posible que ya tenga una cuenta creada con el correo electrónico indicado');
                  }
                },
                function (data, status, headers, config) {
                  $scope.hideload(); 
                  err(data.data.message);
                  $scope.registrandoLoading = false;
                  $scope.botonesRegistro = true;
                });
              }); 

              });             
          }
          else {
            err('Error al intentar conectar con Facebook. Intente más tarde');
          }
       },
       onFailure: function(result) {
          if(result.cancelled) {
             err('Operacion Cancelada')
          } else if(result.error) {
             alert("Error:" + result.errorLocalized);
          }
       }
    });
  };
})

.controller('PerfilCtrl', function($scope, $webSql, $http, $ionicModal, $rootScope, $location, $state, $localStorage) {

})

.controller('RegistroCtrl', function($scope, $webSql, $http, $ionicModal, $rootScope, $location, $state, $localStorage) {

  $scope.regData = {user: '', password: '', email: '', comuna: ''};
  $scope.botonesRegistro = true;
  $scope.registrandoLoading = false;
  $scope.doRegistro = function() {
    $scope.registrandoLoading = true;
    $scope.botonesRegistro = false;
    var data = {
    	'username': 	$scope.regData.username, 
    	'email': 			$scope.regData.email, 
    	'password': 	$scope.regData.password,
    	'city': 			$scope.regData.comuna
    };
    $http.post($localStorage.growify.rest+'/registration', data).
    then(function (data, status, headers, config) {
      if (data.data.active == true) { 
        $localStorage.growify.username = $scope.regData.username;
        $localStorage.growify.email = $scope.regData.email;
        $localStorage.growify.password = $scope.regData.password;
        $localStorage.growify.id = data.data._id;
        $localStorage.growify.auth = 1;
        // get access token
	    var login_xpress = {'username': $scope.growify.username, 'password': $scope.growify.password };
	    $http.post($localStorage.growify.rest+'/login', login_xpress).
	    then(function (data, status, headers, config) {
	    	$localStorage.growify.access_token = data.data.jwt;
	    	$state.go( "terms" );
	    });        
      }
      else {
        err();
        $scope.registrandoLoading = false;
        $scope.botonesRegistro = true;
      }
    },
    function (data, status, headers, config) { 
      err(data.data.message);
      $scope.registrandoLoading = false;
      $scope.botonesRegistro = true;
    });
  };
})

.controller('termsCtrl', function($scope, $webSql, $http, $ionicModal, $rootScope, $location, $state, $localStorage) {

})
.controller('MainCtrl', function($scope, $webSql, $timeout, $location, $state, $ionicLoading, $localStorage, $state, $http, $rootScope, $ionicModal, $cordovaGeolocation, $interval) {

  if (!$localStorage.growify) {
      $state.go( "login" );
  }

  if (!$rootScope.db)
    $rootScope.db = $webSql.openDatabase("growify", "1.1", "Aplicacion Growify", 5 * 1024 * 1024);


  $scope.growify = $localStorage.growify;

  $scope.share = function(name,url,msg){
    var options = {
      message: 'Les recomiendo este Growify Shop!', // not supported on some apps (Facebook, Instagram) 
      subject: name, // fi. for email 
      files: ['', ''], // an array of filenames either locally or remotely 
      url: url,
      chooserTitle: 'Growify' // Android only, you can override the default share sheet title 
    }
    window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
  }

  $scope.showload = function() {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner>'
    }).then(function(){
       //console.log("The loading indicator is now displayed");
    });
  };
  $scope.hideload = function(){
    $ionicLoading.hide().then(function(){
       //console.log("The loading indicator is now hidden");
    });
  };

  $scope.showfav = function() {
    $ionicLoading.show({
      template: '<i class="icon ion-checkmark" style="font-size: 2em;"></i><br />Agregado a favoritos'
    }).then(function(){
       //console.log("The loading indicator is now displayed");
    });
  };

  $scope.cerrarSesion = function() {
    if (confirmar('¿Desea realmente cerrar su sesión?')) {
      $localStorage.growify = default_app;
      $state.go("login");
    }
  };

  $scope.gotoPerfil = function() {
    jQuery("#tabs_footer").find("li").removeClass("active");
    $state.go("main.perfil");
  };
	$scope.gotoTiendas = function() {
		jQuery("#tabs_footer").find("li").removeClass("active");
		jQuery(jQuery("#tabs_footer>li").get(0)).addClass("active");
		$state.go("main.home");
	};
	$scope.gotoPromos = function() {
		jQuery("#tabs_footer").find("li").removeClass("active");
		jQuery(jQuery("#tabs_footer>li").get(1)).addClass("active");
		$state.go("main.promociones");
	};
	$scope.gotoFavoritos = function() {
		jQuery("#tabs_footer").find("li").removeClass("active");
		jQuery(jQuery("#tabs_footer>li").get(2)).addClass("active");
		$state.go("main.favoritos");
	};
	$scope.gotoBuscar = function() {
		jQuery("#tabs_footer").find("li").removeClass("active");
		jQuery(jQuery("#tabs_footer>li").get(3)).addClass("active");
		$state.go("main.buscar");
	};

})

.controller('PromocionesCtrl', function($rootScope, $scope, $state, $http, $ionicLoading, $ionicModal, $interval, $timeout, $location, $localStorage, $cordovaGeolocation, $ionicSlideBoxDelegate) {
	$scope.offers = [];
	$scope.getOffers = function() {
		$scope.showload();
    $http.get($localStorage.growify.rest+'/get_offers', {
    	headers: { 'x-access-token': $localStorage.growify.access_token }
    }).
    then(function (data, status, headers, config) {
      $scope.hideload();
      for (var i = 0; i < data.data.length;i++) {
      	var offer = data.data[i];
        $scope.offers.push(offer);
      }
      //console.log($scope.offers);
      default_app.offersLoaded = 1;
    },
    function (data, status, headers, config) { 
      $scope.hideload();
      err(data.data.message);
    });
	};

	if (default_app.offersLoaded == 0) { 
		$scope.getOffers();
	}
})

.controller('FavoritosCtrl', function($rootScope, $scope, $state, $http, $ionicLoading, $ionicModal, $interval, $timeout, $location, $localStorage, $cordovaGeolocation, $ionicSlideBoxDelegate) {

})

.controller('BuscarCtrl', function($rootScope, $scope, $state, $http, $ionicLoading, $ionicModal, $interval, $timeout, $location, $localStorage, $cordovaGeolocation, $ionicSlideBoxDelegate) {
  if (default_app.searchLoaded == 0) {
    $scope.showload();
    $http.get($localStorage.growify.rest+'/get_stores', {
      headers: { 'x-access-token': $localStorage.growify.access_token }
    }).
    then(function (data, status, headers, config) {
      $scope.hideload();
      $scope.stores = data.data;
      default_app.searchLoaded = 1;
    },
    function (data, status, headers, config) { 
      $scope.hideload();
      err(data.data.message);
    });
  }

})
.controller('VerTiendaProductoCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicLoading, $ionicModal, $interval, $timeout, $location, $localStorage, $cordovaGeolocation, $ionicSlideBoxDelegate) {
  $scope.product = 0;
  $scope.showload();

  $scope.addFavorito = function(product,prodname) {
    confirmar('¿Agregar producto '+prodname+' a favoritos?', function() {
        $scope.showfav();
        $timeout(function() {
          $scope.hideload();
        }, 2000);
    });
  };
  
  $http.get($localStorage.growify.rest+'/stores/'+$stateParams.id, {
    headers: { 'x-access-token': $localStorage.growify.access_token }
  }).
  then(function (data, status, headers, config) {
    $http.get($localStorage.growify.rest+'/get_products/'+$stateParams.id, {
      headers: { 'x-access-token': $localStorage.growify.access_token }
    }).
    then(function (data2, status2, headers2, config2) {
      $scope.store = data.data;
      for (i = 0; i < data2.data.length; i++) {
        if ($stateParams.pro == data2.data[i].productId._id) { 
          $scope.product = data2.data[i];
          break;
        }
      }
      console.log($localStorage.growify.productCategory);
      for (i=0;i<$localStorage.growify.productCategory.length;i++) {
        if ($localStorage.growify.productCategory[i]._id == $scope.product.productId.categoryId) {
          $scope.categName = $localStorage.growify.productCategory[i].description;
          break;
        }
      }
      $scope.hideload();
      
    },
    function (data2, status2, headers2, config2) { 
      $scope.hideload();
      err(data2.data.message);
    });
  },
  function (data, status, headers, config) { 
    $scope.hideload();
    err(data.data.message);
  });
  
})

.controller('VerTiendaCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicLoading, $ionicModal, $interval, $timeout, $location, $localStorage, $cordovaGeolocation, $ionicSlideBoxDelegate) {

  $scope.range = function(min, max, step) {
      step = step || 1;
      var input = [];
      for (var i = min; i <= max; i += step) {
          input.push(i);
      }
      return input;
  };


  $scope.addFavorito = function(store,storename) {
    confirmar('¿Agregar la tienda '+storename+' a favoritos?', function() {
        $scope.showfav();
        $timeout(function() {
          $scope.hideload();
        }, 2000);
    });
  };

  $scope.rateStore = function(store, num) {
    confirmar('¿Calificar con '+num+' estrellas a la tienda?', function() {
      var data = {'storeId': store, 'value': num };
      $http.post($localStorage.growify.rest+'/store-rate', data, {
        headers: { 'x-access-token': $localStorage.growify.access_token }
      }).
      then(function (data, status, headers, config) {
        if (data.data.success) {
          ok('Gracias por tu calificación');
        }
        else {
          err(data.data.message);
        }
        $scope.tiendaCargar();
      },
      function (data, status, headers, config) { 
        err(data.data.message);
        $scope.cargandoLogin = false;
        $scope.botonesLogin = true;
      });
    });
  };

  $scope.tiendaCargar = function() {

    $scope.showload();
    $http.get($localStorage.growify.rest+'/stores/'+$stateParams.id, {
      headers: { 'x-access-token': $localStorage.growify.access_token }
    }).
    then(function (data, status, headers, config) {
      $http.get($localStorage.growify.rest+'/get_products/'+$stateParams.id, {
        headers: { 'x-access-token': $localStorage.growify.access_token }
      }).
      then(function (data2, status2, headers2, config2) {
        $scope.hideload();
        $scope.store = data.data;
        $scope.products = data2.data;
      },
      function (data2, status2, headers2, config2) { 
        $scope.hideload();
        err(data2.data.message);
      });
    },
    function (data, status, headers, config) { 
      $scope.hideload();
      err(data.data.message);
    });
  };

  $scope.tiendaCargar();

})
.controller('HomeCtrl', function($scope, $http, $ionicModal, $timeout, $state, $location, $localStorage, $cordovaGeolocation) {
	$scope.mylat = 0;
	$scope.mylng = 0;
	var scl = new google.maps.LatLng(-33.447487,-70.673676);
    var mapOptions = {
      center: scl,
      zoom: 12,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var myLatLng = null;
    $scope.stores = [];
	$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    /* Mapa OK - Cargar sucursales y obtener mis coordenadas */ 
    google.maps.event.addListenerOnce($scope.map, 'idle', function(){

		var posOptions = {timeout: 10000, enableHighAccuracy: false};
		$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
			myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			$scope.mylat = position.coords.latitude;
			$scope.mylng = position.coords.longitude;
	        marker = new google.maps.Marker({
	          map: $scope.map,
	          animation: google.maps.Animation.DROP,
	          position: myLatLng,
	          icon: 'img/icon.me.png'
	        });
			if (default_app.storeLoaded == 0) {
				$scope.getStores();
			}
		});
	});
    
  $scope.followMe = function() {
		$scope.map.setCenter(myLatLng);
  };

	$scope.getStores = function() {
		$scope.showload();
    $http.get($localStorage.growify.rest+'/get_stores', {
    	headers: { 'x-access-token': $localStorage.growify.access_token }
    }).
    then(function (data, status, headers, config) {
      $scope.hideload();
      for (var i = 0; i < data.data.length;i++) {
      	var store = data.data[i];
      	var storeGeo = new google.maps.LatLng(store.geolocation.lat, store.geolocation.long);
        marker[i] = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          position: storeGeo,
          icon: 'img/icon.grow.png',
          url: '#/main/vertienda/'+store._id+'/'
        });

        google.maps.event.addListener(marker[i], 'click', function() {
          window.location.href = this.url;
        });


        if ($scope.mylng != 0 && $scope.mylat != 0) { 
        	store.miDistancia = (Math.round(distance($scope.mylat, $scope.mylng, store.geolocation.lat, store.geolocation.long) * 100) / 100) + " KM";
        }
        else {
        	store.miDistancia = "Distancia desconocida";	
        }

        $scope.stores.push(store);
      }
      default_app.storeLoaded = 1;
    },
    function (data, status, headers, config) { 
      $scope.hideload();
      err(data.data.message);
    });
	};
	
	$scope.tiendasShowDivMapa = function() { 
		$(".tienda_tab_lista").removeClass("active");
		$(".tienda_tab_mapa").addClass("active");
		$(".home-map").show();
		$(".home-list").hide();
	};

	$scope.tiendasShowDivLista = function() { 
		$(".tienda_tab_mapa").removeClass("active");
		$(".tienda_tab_lista").addClass("active");
		$(".home-map").hide();
		$(".home-list").show();
	};

})

.directive('onlyDigits', function () {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function (scope, element, attr, ctrl) {
      function inputValue(val) {
        if (val) {
          var digits = val.replace(/[^0-9]/g, '');

          if (digits !== val) {
            ctrl.$setViewValue(digits);
            ctrl.$render();
          }
          return parseInt(digits,10);
        }
        return undefined;
      }            
      ctrl.$parsers.push(inputValue);
    }
  };
});