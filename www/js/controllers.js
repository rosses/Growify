angular.module('growify.controllers', [])

.controller('LoginCtrl', function($scope, $webSql, $http, $ionicModal, $rootScope, $location, $state, $localStorage, $ionicLoading) {
  
  /* REBOOT DATABASE AND STORAGE */ 
  //$localStorage.growify = default_app;
  //$rootScope.db.dropTable('FAV');


  $rootScope.db.createTable(
    'FAV', {
      "userEmail":{ "type": "TEXT" },
      "tipoElemento":{ "type": "TEXT" },
      "id": { "type": "TEXT" },
      "subid": { "type": "TEXT" }
      }
  );

  /* Preload Data */
  $scope.showload = function(msg) {
    $ionicLoading.show({template: '<ion-spinner></ion-spinner>'+(msg ? '<br>'+msg : '')}).then(function(){});
  };

  $scope.hideload = function(){
    $ionicLoading.hide().then(function(){});
  };

  $scope.urlImg = "img/loginbg.png";
  

  if ($localStorage.growify && $localStorage.growify.auth == 1) {
    var goLogin = 0;
    if ($localStorage.growify.username != "" && $localStorage.growify.password != "") {
      var data = {'username': $localStorage.growify.email, 'password': $localStorage.growify.password };
      goLogin=1;
    }
   

    if (goLogin) {
      $scope.showload();
      $http.post($localStorage.growify.rest+'/login', data).
      then(function (data, status, headers, config) {
        $scope.hideload();
        if (data.data.jwt) { 
          $localStorage.growify.username = $scope.loginData.username;
          $localStorage.growify.email = data.data.profile.email;
          $localStorage.growify.city = data.data.profile.city;
          $localStorage.growify.firstName = data.data.profile.firstName;

          if (data.data.profile.facebookId) { $localStorage.growify.facebookId = data.data.profile.facebookId; }
          if (data.data.profile.googleId) { $localStorage.growify.googleId = data.data.profile.googleId; }

          $localStorage.growify.password = $scope.loginData.password;
          $localStorage.growify.access_token = data.data.jwt;     
          $localStorage.growify.auth = 1;
          $localStorage.growify.id = data.data.profile._id;

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
    }
  } else {
    $localStorage.growify = default_app_;
  }



  $scope.goToRecover = function() { 
    $localStorage.growify.username = "";
    $localStorage.growify.email = "";
    $localStorage.growify.facebookToken = "";
    $localStorage.growify.id = 0;
    $localStorage.growify.auth = 0;
    $state.go( "recover" ); 
  }
  $scope.goToTermsNoReg = function() { 
    $localStorage.growify.username = "";
    $localStorage.growify.email = "";
    $localStorage.growify.facebookToken = "";
    $localStorage.growify.id = 0;
    $localStorage.growify.auth = 0;
    $state.go( "terms" ); 
  }
  $scope.reloadMaster = function() {
    $scope.showload();

    if (!$localStorage.growify_comunas) {
      $http.get($localStorage.growify.rest+'/locations').
      then(function (data, status, headers, config) {
        $localStorage.growify_comunas = data.data.communes;
        $rootScope.growify_comunas = $localStorage.growify_comunas;
        function compare(a,b) {
          if (a.name < b.name)
            return -1;
          if (a.name > b.name)
            return 1;
          return 0;
        }

        $rootScope.growify_comunas = $rootScope.growify_comunas.sort(compare);
      });
    }
    else {
      $rootScope.growify_comunas = $localStorage.growify_comunas;
    }


    $http.get($localStorage.growify.rest+'/app-options').
    then(function (data, status, headers, config) {
      //console.log(data.data);
      //$scope.urlImg = "../img/loginbg.png";
      if (data.data.backgroundImage != "") {
        $scope.urlImg = data.data.backgroundImage;
      }
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
    var data = {'username': $scope.loginData.username.toLowerCase(), 'password': $scope.loginData.password };
    $http.post($localStorage.growify.rest+'/login', data).
    then(function (data, status, headers, config) {

      if (data.data.jwt) { 
        $localStorage.growify.firstName = data.data.profile.firstName;
        $localStorage.growify.username = $scope.loginData.username;
        $localStorage.growify.email = data.data.profile.email;
        $localStorage.growify.city = data.data.profile.city;
        $localStorage.growify.password = $scope.loginData.password;
        $localStorage.growify.access_token = data.data.jwt;    	
        $localStorage.growify.auth = 1;
        $localStorage.growify.id = data.data.profile._id;
        $scope.cargandoLogin = false;
        $scope.botonesLogin = true;
        $scope.loginData = {user: '', password: ''};
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

          var dataPost = {
            'username':   obj.email, 
            'email':      obj.email, 
            'googleId':   obj.userId,
            'avatar':     obj.imageUrl,
            'firstName':  obj.displayName
          };

          $http.post($localStorage.growify.rest+'/registration', dataPost).
          then(function (data, status, headers, config) {

            if (data.data.jwt) { 
              $localStorage.growify.firstName = data.data.profile.firstName;
              $localStorage.growify.username = $scope.loginData.username;
              $localStorage.growify.email = data.data.profile.email;
              $localStorage.growify.city = data.data.profile.city;
              $localStorage.growify.password = $scope.loginData.password;
              $localStorage.growify.googleId = data.data.profile.googleId;
              $localStorage.growify.access_token = data.data.jwt;     
              $localStorage.growify.auth = 1;
              $localStorage.growify.id = data.data.profile._id;
              $scope.hideload();
              $state.go( "terms" );
            }
            else {
              $scope.hideload();
              err();
            }
          },
          function (data, status, headers, config) { 
            $scope.hideload();
            err(data.data.message);
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
             $scope.hideload();
          }
          else if (result.success == 1) {

            $http.get("https://graph.facebook.com/me?fields=id,name,email,picture&access_token="+result.accessToken, {}).
            then(function (data, status, headers, config) {
              
                var dataPost = {
                  'username':    data.data.email, 
                  'firstName':   data.data.name, 
                  'email':       data.data.email, 
                  'facebookId':  data.data.id,
                  'picture':     data.data.picture.data.url
                };

                $http.post($localStorage.growify.rest+'/registration', dataPost).
                then(function (data, status, headers, config) {

                  if (data.data.jwt) { 
                    $localStorage.growify.firstName = data.data.profile.firstName;
                    $localStorage.growify.username = $scope.loginData.username;
                    $localStorage.growify.email = data.data.profile.email;
                    $localStorage.growify.city = data.data.profile.city;
                    $localStorage.growify.password = $scope.loginData.password;
                    $localStorage.growify.facebookId = data.data.profile.facebookId;
                    $localStorage.growify.access_token = data.data.jwt;     
                    $localStorage.growify.auth = 1;
                    $localStorage.growify.id = data.data.profile._id;
                    $scope.hideload();
                    $state.go( "terms" );
                  }
                  else {
                    err();
                    $scope.hideload();
                  }
                },
                function (data, status, headers, config) { 
                  $scope.hideload();
                  err(data.data.message);
                });

            },function() {
              $scope.hideload();
              err('No fue posible obtener la información desde Facebook');
            });

          }
          else {
            $scope.hideload();
            err('Error al intentar conectar con Facebook. Intente más tarde');
          }
       },
       onFailure: function(result) {
          $scope.hideload();
          if(result.cancelled) {
             err('No has autorizado Growify en tu cuenta de Facebook');
          } else if(result.error) {
             err('Bloqueaste a Growify para usar tu Facebook. Debes usar otro método de autentificación');
             //alert("Error:" + result.errorLocalized);
          }
       }
    });
  };
})

.controller('PerfilCtrl', function($scope, $ionicPopup, $ionicLoading, $cordovaCamera, $webSql, $http, $ionicModal, $rootScope, $location, $state, $localStorage) {

  $scope.fotoSubida = "img/unknown.png";

  $scope.setImage = function() {
    $ionicPopup.show({
      template: '',
      title: 'Actualizar imagen',
      subTitle: 'Seleccione origen de imagen',
      scope: $scope,
      buttons: [
        {
          text: '<b>Cámara</b>',
          type: 'button-grow',
          onTap: function(e) {
            $scope.takePicture();
          }
        },
        {
          text: '<b>Galería</b>',
          type: 'button-grow',
          onTap: function(e) {
            $scope.selectPicture();
          }
        },
        { 
          text: '<i class="icon ion-close-circled"></i>',
          type:'popclose'
        }
      ]
    });
  };

  $scope.cerrarSesion = function() {
    confirmar('¿Desea realmente cerrar su sesión?', function() {
      $localStorage.growify = default_app_;
      $localStorage.growifyCfg = { tienda: 'fisica', entrega: '', despacho: '', comuna: '' };
      $state.go("login");
    });
  };  
  $scope.selectPicture = function() { 
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      targetWidth: 400,
      targetHeight: 400
    };

    $cordovaCamera.getPicture(options).then(
      function(imageURI) {
        $scope.uploadPicture(imageURI);
      },
      function(err){
        $ionicLoading.show({template: 'Error al acceder a tu galería', duration:1500});
      })
  };


  $scope.takePicture = function() {
    var options = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA
      };
    $cordovaCamera.getPicture(options).then(
    function(imageData) {
      $scope.uploadPicture(imageData);
    },
    function(err){
      $ionicLoading.show({template: 'Error al acceder a tu cámara', duration:1500});
    })
  }

  $scope.uploadPicture = function(base64) {
    $ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
    var base64Image = "data:image/jpeg;base64," + base64;
    var blob = dataURItoBlob(base64Image);
    var objURL = window.URL.createObjectURL(blob);
    var image = new Image();
    image.src = objURL;
    window.URL.revokeObjectURL(objURL);

    var formData = new FormData();
    formData.append('file', blob, 'avataruser.jpg');
    formData.append('upload_preset', 'growify');

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if(xhr.readyState === 4 && xhr.status === 200) {
          var json = JSON.parse(xhr.responseText);
          $scope.fotoSubida=json.url;
          $ionicLoading.hide();
        }
    };
    xhr.open("post", "https://api.cloudinary.com/v1_1/dujuytngk/image/upload");
    xhr.send(formData);
  };

  function dataURItoBlob(dataURI) {

      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
          byteString = atob(dataURI.split(',')[1]);
      else
          byteString = unescape(dataURI.split(',')[1]);

      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ia], {type:mimeString});
  }

})

.controller('RegistroCtrl', function($scope, $webSql, $http, $ionicModal, $rootScope, $location, $state, $localStorage) {
  $scope.urlImg = "img/loginbg.png";
  $scope.regData = {user: '', password: '', email: '', comuna: ''};
  $scope.botonesRegistro = true;
  $scope.registrandoLoading = false;

  $scope.doRegistro = function() {
    $scope.registrandoLoading = true;
    $scope.botonesRegistro = false;
    var data = {
    	'email': 	     $scope.regData.email, 
    	'firstName': 	 $scope.regData.username, 
    	'password': 	 $scope.regData.password
    };
    $http.post($localStorage.growify.rest+'/registration', data).
    then(function (data, status, headers, config) {
      if (data.data.profile.active == true) {
        $localStorage.growify.username = $scope.regData.username;
        $localStorage.growify.email = $scope.regData.email;
        $localStorage.growify.password = $scope.regData.password;
        $localStorage.growify.id = data.data._id;
        $localStorage.growify.auth = 1;
        // get access token
  	    var login_xpress = {'username': $localStorage.growify.email, 'password': $localStorage.growify.password };
  	    $http.post($localStorage.growify.rest+'/login', login_xpress).
  	    then(function (data, status, headers, config) {
          $localStorage.growify.firstName = data.data.profile.firstName;
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
.controller('recoverCtrl', function($scope, $webSql, $http, $ionicModal, $rootScope, $location, $state, $localStorage) {
  $scope.urlImg = "img/loginbg.png";
  $scope.lostData = {email: ''};
  $scope.botonesRegistro = true;
  $scope.recuperandoLoading = false;
  $scope.doRecover = function() {
    $scope.recuperandoLoading = true;
    $scope.botonesRegistro = false;
    var data = {
      'email':      $scope.lostData.email
    };
    $http.post($localStorage.growify.rest+'/reset-password', data).
    then(function (data, status, headers, config) {
      ok('Hemos enviado una nueva clave a tu correo!');
      $state.go("login");
    },
    function (data, status, headers, config) { 
      err('No hemos encontrado tu usuario, verifica que el correo ingresado sea el correcto');
      $scope.registrandoLoading = false;
      $scope.botonesRegistro = true;
    });
  };
})
.controller('MainCtrl', function($scope, $webSql, $timeout, $location, $state, $ionicLoading, $localStorage, $state, $http, $rootScope, $ionicModal, $cordovaGeolocation, $interval) {

  if (!$localStorage.growify) {
      $state.go( "login" );
  }

  if (!$rootScope.db)
    $rootScope.db = $webSql.openDatabase("growify", "1.1", "Aplicacion Growify", 5 * 1024 * 1024);

  $scope.growify = $localStorage.growify;

  if (!$localStorage.growifyCfg) {
    $localStorage.growifyCfg = { tienda: 'fisica', entrega: '', despacho: '', comuna: '' };
  }

  $scope.cfg = JSON.parse(localStorage.getItem("ngStorage-growifyCfg"));
  //console.log($scope.cfg);
  $scope.aplicarCfg = function() {
    $localStorage.growifyCfg = $scope.cfg;
    $scope.closeDrawer();
    $ionicLoading.show({
      template: '<i class="icon ion-checkmark" style="font-size: 2em;"></i><br />Configuración Aplicada',
      duration: 2500
    }).then(function(){
       
    });

    $scope.$broadcast ('updateTiendas');

  };


  //console.log($scope.growify);
  $scope.share = function(name,url,msg){
    var options = {
      message: 'Les recomiendo este Growify Shop!', 
      subject: name,
      files: [], 
      url: url,
      chooserTitle: 'Growify' 
    }
    window.plugins.socialsharing.shareWithOptions(options, function() { }, function() { });
  }

  //console.log($scope.growify);

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
      template: '<i class="icon ion-checkmark" style="font-size: 2em;"></i><br />Agregado a favoritos',
      duration: 2500
    }).then(function(){
       //console.log("The loading indicator is now displayed");
    });
  };

  $scope.cerrarSesion = function() {
    confirmar('¿Desea realmente cerrar su sesión?',function() {
      $localStorage.growify = default_app_;
      $localStorage.growifyCfg = { tienda: 'fisica', entrega: '', despacho: '', comuna: '' };
      $state.go("login");
    });
  };

  $scope.gotoLogin = function() {
    $scope.closeDrawer();
    $localStorage.growify = default_app_;
    $localStorage.growifyCfg = { tienda: 'fisica', entrega: '', despacho: '', comuna: '' };
    $state.go("login");
  };
  $scope.gotoPerfil = function() {
    //jQuery("#tabs_footer").find("li").removeClass("active");
    $scope.closeDrawer();
    $state.go("main.perfil");
  };
  /*
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
		$state.go("main.favoritos", {}, {reload:true});
	};
	$scope.gotoBuscar = function() {
		jQuery("#tabs_footer").find("li").removeClass("active");
		jQuery(jQuery("#tabs_footer>li").get(3)).addClass("active");
		$state.go("main.buscar");
	};
  */
})

.controller('PromocionesCtrl', function($rootScope, $scope, $state, $http, $ionicLoading, $ionicModal, $interval, $timeout, $location, $localStorage, $cordovaGeolocation, $ionicSlideBoxDelegate) {
	$scope.offers = [];
  $scope.isLoaded = false;
	$scope.getOffers = function() {
		$scope.showload();
    $http.get($localStorage.growify.rest+'/get_offers', {
    	headers: { 'x-access-token': $localStorage.growify.access_token }
    }).
    then(function (data, status, headers, config) {
      $scope.hideload();
      $scope.isLoaded = true;
      for (var i = 0; i < data.data.length;i++) {
      	var offer = data.data[i];
        $scope.offers.push(offer);
      }
      //console.log($scope.offers);
      //default_app.offersLoaded = 1;
    },
    function (data, status, headers, config) { 
      $scope.hideload();
      err(data.data.message);
    });
	};

	//if (default_app.offersLoaded == 0) { 
	$scope.getOffers();
	
})

.controller('FavoritosCtrl', function($rootScope, $scope, $state, $http, $ionicLoading, $ionicModal, $interval, $timeout, $location, $localStorage, $cordovaGeolocation, $ionicSlideBoxDelegate) {


  $scope.FavShowDivTienda = function() { 
    $(".tienda_tab_producto").removeClass("active");
    $(".tienda_tab_tienda").addClass("active");
    $(".fav-tab1").show();
    $(".fav-tab2").hide();
  };

  $scope.FavShowDivProductos = function() { 
    $(".tienda_tab_tienda").removeClass("active");
    $(".tienda_tab_producto").addClass("active");
    $(".fav-tab1").hide();
    $(".fav-tab2").show();
  };


  $scope.reloadFav = function() {

    $scope.isLoaded = false;
    $scope.tiendas = [];
    $scope.productos = [];
    $scope.totalFavoritos = 0;
    $scope.showload();

    $rootScope.db.executeQuery("SELECT * FROM FAV WHERE userEmail = ?", [$localStorage.growify.email]
    ).then(function(results) {

      for(i=0; i < results.rows.length; i++){
        var row = results.rows.item(i);
        //console.log(row);
        if (row.tipoElemento == 'tienda') {
          $scope.tiendas.push(row);  
        }
        if (row.tipoElemento == 'tiendaProducto') {
          $scope.productos.push(row);  
        }
      }
      $scope.totalFavoritosTiendas = $scope.tiendas.length;
      $scope.totalFavoritosProductos = $scope.productos.length;
      $scope.totalFavoritos = $scope.tiendas.length + $scope.productos.length;

      if ($scope.totalFavoritos == 0) {
        $scope.hideload();
      }
      else {
        p = [];
        $http.get($localStorage.growify.rest+'/get_stores', {
          headers: { 'x-access-token': $localStorage.growify.access_token }
        }).
        then(function (data, status, headers, config) {

          // Recorrer tiendas
          for (i2=0;i2<data.data.length;i2++) {
            myname = data.data[i2].name

            // Si tengo tiendas favoritas
            for (i=0;i<$scope.tiendas.length;i++) { 
              if ($scope.tiendas[i].id == data.data[i2]._id) {
                $scope.tiendas[i].avatar = data.data[i2].avatar;
                $scope.tiendas[i].name = data.data[i2].name;
                $scope.tiendas[i].address = data.data[i2].address;
              }
            }

            // Recorrer productos de la tienda
            var x = $http.get($localStorage.growify.rest+'/get_products/'+data.data[i2]._id, {
              headers: { 'x-access-token': $localStorage.growify.access_token }
            }).
            then(function (data2, status2, headers2, config2) {
              // Si tengo productos favoritos
              for (j = 0; j < $scope.productos.length; j++) {
                for (j2=0;j2<data2.data.length;j2++) {
                  //if (data2.data[j2].productId.images[0] != null) {
                    if ($scope.productos[j].subid == data2.data[j2].productId._id) { 
                      $scope.productos[j].avatar = data2.data[j2].productId.images[0];
                      $scope.productos[j].name = data2.data[j2].productId.name;
                      $scope.productos[j].local = myname;
                      $scope.productos[j].localdir = data2.data[j2].storeId.address;
                      break; // no recorrer mas productos ya la encontro.
                    }
                  //}
                }
              }
            });
            p.push(x);
          }
        });  

        $.when.apply(null, p).then(function() {
          setTimeout(function() { 
            $scope.hideload();
            $scope.isLoaded = true;
          },1000);
        });
      }
   
    });

  }


  $scope.$on( "$ionicView.beforeEnter", function( scopes, states ) {
    $scope.reloadFav();
  });

})

.controller('BuscarCtrl', function($rootScope, $scope, $state, $http, $ionicScrollDelegate, $ionicLoading, $ionicModal, $interval, $timeout, $location, $localStorage, $cordovaGeolocation, $ionicSlideBoxDelegate) {
  console.log($localStorage.growify);
  $scope.buscar = {
  	categ: '',
  	str: '',
  	marca: '',
  	store: '',
    subcateg: ''
  };

  /* Arbol de categorias */
  $scope.rootCategory = [];
  $scope.childCategorySelected = [];
  $scope.childCategory = {};

  for (var a=0;a<$localStorage.growify.productCategory.length;a++) {
    var here = $localStorage.growify.productCategory[a];
    if (here.parentCategory) {
      if (!$scope.childCategory[here.parentCategory]) {
        $scope.childCategory[here.parentCategory] = [];
      }
      $scope.childCategory[here.parentCategory].push(here);
    }
    else {
      $scope.rootCategory.push(here);
    }
  }


  $scope.resultados = [];
  $scope.isLoaded = false;
  $scope.mostrarFiltros = true;
  $scope.mostrarResultados = false;
  $scope.mostrarBuscar = true;
  $scope.mostrarBuscando = false;

  $scope.childChoose = function() {
    $scope.childCategorySelected = $scope.childCategory[$scope.buscar.categ];
  }

  $scope.scrollToResults = function() {
    $ionicScrollDelegate.scrollTo(0,400,true);
  };

  $scope.buscarAhora = function() {
		$scope.resultados = [];
    $scope.isLoaded = false;
		//$scope.mostrarFiltros = false;
	  $scope.mostrarResultados = true;
    $scope.mostrarBuscando = true;
    $scope.mostrarBuscar = false;
    var queryParams = [];
    if ($scope.buscar.str != '' && $scope.buscar.str != null) { queryParams.push("name="+$scope.buscar.str); }
    if ($scope.buscar.categ != '' && $scope.buscar.categ != null) { 
      if ($scope.buscar.subcateg != '' && $scope.buscar.subcateg != null) { 
        queryParams.push("categoryId="+$scope.buscar.subcateg); 
      }
      else {
       queryParams.push("categoryId="+$scope.buscar.categ);  
      }
    }

    //if ($scope.buscar.store != '') { queryParams.push("storeId="+$scope.buscar.store); }

    if ($scope.buscar.marca != '') { queryParams.push("productBrandId="+$scope.buscar.marca); }

    $http.get($localStorage.growify.rest+'/search' + (queryParams.length > 0 ? '?'+queryParams.join("&") : '' ), {
     headers: { 'x-access-token': $localStorage.growify.access_token }
    }).
    then(function (data, status, headers, config) {
     for (t = 0; t<data.data.length;t++) {
     	$scope.resultados.push(data.data[t]);
     }
     $scope.isLoaded = true;
     $scope.mostrarBuscar = true;
     $scope.mostrarBuscando = false;
     $scope.scrollToResults();
  	}, 
  	function() {
  	 $scope.mostrarBuscando = false;
  	 err("No fue posible cargar resultados. Intente más tarde");
  	});
  };
  /*
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
  */

})
.controller('VerTiendaProductoCtrl', function($rootScope, $scope, $state, $http, $stateParams, $ionicLoading, $ionicModal, $interval, $timeout, $location, $localStorage, $cordovaGeolocation, $ionicSlideBoxDelegate) {
  $scope.product = 0;
  $scope.isFavorito = 0;
  $scope.showload();

  $scope.range = function(min, max, step) {
      step = step || 1;
      var input = [];
      for (var i = min; i <= max; i += step) {
          input.push(i);
      }
      return input;
  };
  $scope.showpvote = function(n) { //
    var stars = "";
    for (i=0;i<parseInt(n);i++) {
      stars += "<i class='ion-ios-star'></i>";
    }
    $ionicLoading.show({
      template: stars+'<br />Gracias por votar'
    }).then(function(){
       $timeout(function() {
        $ionicLoading.hide().then(function(){
           $scope.productoCargar();
        });
       }, 2500);
    });
  };

  $scope.rateProduct = function(producto, num) {
    if ($localStorage.growify.id != 0) {
      var data = {'productId': producto, 'value': num };
      $http.post($localStorage.growify.rest+'/product-rate', data, {
        headers: { 'x-access-token': $localStorage.growify.access_token }
      }).
      then(function (data, status, headers, config) {
        if (data.data.value) {
          $scope.showpvote(parseInt(data.data.value));
        }
        else {
          err('Ya has votado este producto anteriormente');
        }
        
      },
      function (data, status, headers, config) { 
        err(data.data.message);
      });
    }
    else {
      err('Solo usuarios registrados pueden calificar tiendas');
    }
  };

  $scope.addFavorito = function(product,prodname) {
    /*if ($localStorage.growify.id == 0) {
      err('Solo usuarios registrados pueden agregar elementos a favoritos');
    }
    else {*/
      $scope.showfav();
      $rootScope.db.insert('FAV', {
       userEmail: $localStorage.growify.email,
       tipoElemento: 'tiendaProducto',
       id: $stateParams.id.replace("/",""),
       subid: $stateParams.pro.replace("/","")
      });
      $scope.isFavorito = 1;
    /*}*/
  };

  $scope.delFavorito = function(product,prodname) {

    /*if ($localStorage.growify.id == 0) {
      err('Solo usuarios registrados pueden manipular elementos favoritos');
    }
    else {*/
      $rootScope.db.executeQuery('DELETE FROM FAV WHERE userEmail = ? AND tipoElemento = ? AND id = ? AND subid = ?', [$localStorage.growify.email, 'tiendaProducto', $stateParams.id, $stateParams.pro]);
      $scope.isFavorito = 0;
    /*}*/
  };

  $scope.productoCargar = function() {
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
	          $scope.product.productId.rateAvg = Math.round($scope.product.productId.rateAvg);
	          break;
	        }
	      }
	      //console.log($localStorage.growify.productCategory);

	      for (i=0;i<$localStorage.growify.productCategory.length;i++) {
	        if ($localStorage.growify.productCategory[i]._id == $scope.product.productId.categoryId) {
	          $scope.categName = $localStorage.growify.productCategory[i].description;
	          break;
	        }
	      }

	      $rootScope.db.executeQuery("SELECT * FROM FAV WHERE userEmail = ? AND tipoElemento = ? AND id = ? AND subid = ?", 
	        [$localStorage.growify.email, 'tiendaProducto', $stateParams.id, $stateParams.pro]
	      ).then(function(results) {
	        $scope.isFavorito = results.rows.length;
	        $scope.hideload();
	      });

	      if ($localStorage.growify.id == 0) {
	        $http.post($localStorage.growify.rest+'/tracker', {
	          'type': 'product', 
	          'productStoreId': $stateParams.pro.replace('/',''),
	          'productId': $scope.product.productId,
	          'storeId': $stateParams.id.replace('/','')
	        }, { }).then(function (data) { },function (data) { });
	      }
	      else {
	        $http.post($localStorage.growify.rest+'/tracker', {
	          'type': 'product', 
	          'productStoreId': $stateParams.pro.replace('/',''),
	          'productId': $scope.product.productId,
	          'storeId': $stateParams.id.replace('/',''),
	          'userId': $localStorage.growify.id
	        }, { }).then(function (data) { },function (data) { }); 
	      }
	      
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
  }
  $scope.productoCargar();

})

.controller('VerTiendaCtrl', function($rootScope, $ionicScrollDelegate, $scope, $state, $http, $stateParams, $ionicLoading, $ionicModal, $interval, $timeout, $location, $localStorage, $cordovaGeolocation, $ionicSlideBoxDelegate) {

  $scope.range = function(min, max, step) {
      step = step || 1;
      var input = [];
      for (var i = min; i <= max; i += step) {
          input.push(i);
      }
      return input;
  };

  $scope.isiOS = true;
  $scope.isAndroid = false;
  if (!!window.cordova) {
    if (cordova.platformId == "android") { $scope.isAndroid = true; }
    if (cordova.platformId == "ios") { $scope.isiOS = true; }
  }

  $scope.isLoaded = false;
  $scope.filtrada = false;
  $scope.filtro = { categ: '', subcateg: '' };
  /* Arbol de categorias */
  $scope.rootCategory = [];
  $scope.childCategorySelected = [];
  $scope.childCategory = {};

  for (var a=0;a<$localStorage.growify.productCategory.length;a++) {
    var here = $localStorage.growify.productCategory[a];
    if (here.parentCategory) {
      if (!$scope.childCategory[here.parentCategory]) {
        $scope.childCategory[here.parentCategory] = [];
      }
      $scope.childCategory[here.parentCategory].push(here);
    }
    else {
      $scope.rootCategory.push(here);
    }
  }

  $scope.childChoose = function() {
    $scope.childCategorySelected = $scope.childCategory[$scope.filtro.categ];
  }

  $scope.addFavorito = function(product,prodname) {
    /*if ($localStorage.growify.id == 0) {
      err('Solo usuarios registrados pueden agregar elementos a favoritos');
    }
    else {*/
      $scope.showfav();
      $rootScope.db.insert('FAV', {
       userEmail: $localStorage.growify.email,
       tipoElemento: 'tienda',
       id: $stateParams.id.replace("/",""),
       subid: ''
      });
      $scope.isFavorito = 1;
    /*}*/
  };

  $scope.whatsapp = function(numero) {
    console.log(numero);
    cordova.plugins.Whatsapp.send(numero);
  };

  $scope.delFavorito = function(product,prodname) {
    /*if ($localStorage.growify.id == 0) {
      err('Solo usuarios registrados pueden manipular elementos favoritos');
    }
    else {*/
      $rootScope.db.executeQuery('DELETE FROM FAV WHERE userEmail = ? AND tipoElemento = ? AND id = ? AND subid = ?', [$localStorage.growify.email, 'tienda', $stateParams.id, '']);
      $scope.isFavorito = 0;
    /*}*/
  };



  $scope.showvote = function(n) { //
    var stars = "";
    for (i=0;i<parseInt(n);i++) {
      stars += "<i class='ion-ios-star'></i>";
    }
    $ionicLoading.show({
      template: stars+'<br />Gracias por votar'
    }).then(function(){
       $timeout(function() {
        $ionicLoading.hide().then(function(){
           $scope.tiendaCargar();
        });
       }, 2500);
    });
  };

  $scope.rateStore = function(store, num) {
    if ($localStorage.growify.id != 0) {
      var data = {'storeId': store, 'value': num };
      $http.post($localStorage.growify.rest+'/store-rate', data, {
        headers: { 'x-access-token': $localStorage.growify.access_token }
      }).
      then(function (data, status, headers, config) {
        //alert(JSON.stringify(data.data));
        if (data.data.value) {
          $scope.showvote(parseInt(data.data.value));
        }
        else {
          err('Ya has votado esta tienda anteriormente');
        }
        
      },
      function (data, status, headers, config) { 
        err(data.data.message);
      });
    }
    else {
      err('Solo usuarios registrados pueden calificar tiendas');
    }
  };

  $scope.scrollToResults = function() {
    $ionicScrollDelegate.scrollTo(0,610,true);
  };

  $scope.filtrar = function() { 
    $scope.filtrada = true; 
    $scope.tiendaCargar();
  }

  $scope.tiendaCargar = function() {
    $scope.products = [];
    $scope.isLoaded = false;
    $scope.showload();
    $http.get($localStorage.growify.rest+'/stores/'+$stateParams.id, {
      headers: { 'x-access-token': $localStorage.growify.access_token }
    }).
    then(function (data, status, headers, config) {

      $http.get($localStorage.growify.rest+'/get_products/'+$stateParams.id, {
        headers: { 'x-access-token': $localStorage.growify.access_token }
      }).
      then(function (data2, status2, headers2, config2) {
        $scope.store = data.data;
        $scope.store.mobilefix = data.data.mobile.replace(/ /g,'');
        $scope.store.phonefix = data.data.phone.replace(/ /g,'');
        $scope.isLoaded = true;

        if ($scope.filtro.categ != '' && $scope.filtro.categ != null) {
          for (var x=0;x < data2.data.length;x++) {
            if ($scope.filtro.subcateg != '' && $scope.filtro.subcateg != null) {
              if ($scope.filtro.subcateg == data2.data[x].productId.categoryId) {
                $scope.products.push(data2.data[x]);
              }
            }
            else if ($scope.filtro.categ == data2.data[x].productId.categoryId) {
              $scope.products.push(data2.data[x]);
            }
          }
        }
        else {
          $scope.products = data2.data;
        }

        $rootScope.db.executeQuery("SELECT * FROM FAV WHERE userEmail = ? AND tipoElemento = ? AND id = ? AND subid = ?", 
          [$localStorage.growify.email, 'tienda', $stateParams.id, '']
        ).then(function(results) {
          $scope.isFavorito = results.rows.length;
          $scope.hideload();
          if ($scope.filtrada) {
            $scope.scrollToResults();
          }
        });

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

  $scope.isFavorito = 0;
  $scope.tiendaCargar();

  $http.post($localStorage.growify.rest+'/tracker', {'type': 'store', 'storeId': $stateParams.id.replace('/','') }, { }).then(function (data) { },function (data) { });

})
.controller('HomeCtrl', function($scope, $http, $ionicModal, $timeout, $state, $location, $localStorage, $cordovaGeolocation) {
	$scope.mylat = 0;
	$scope.mylng = 0;
  $scope.isLoaded = false;
  $scope.showload();

  $scope.$on('updateTiendas', function(e) {
      for (var i = 0 ; i < marker.length;i++) {
        marker[i].setMap(null);
      }

      $scope.getStores();
  });

	var scl = new google.maps.LatLng(-33.447487,-70.673676);

	var mapStyle = [
	   {
	     featureType: "poi",
	     elementType: "labels", 
	     stylers: [
	      { visibility: "off" }
	     ]   
	    }
	];

    var mapOptions = {
      center: scl,
      zoom: 12,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: mapStyle
    };
    var myLatLng = null;
  var marker = [];
  $scope.stores = [];
	$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    /* Mapa OK - Cargar sucursales y obtener mis coordenadas */ 
    google.maps.event.addListenerOnce($scope.map, 'idle', function(){

		var posOptions = {timeout: 10000, enableHighAccuracy: false};
		$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
			myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  			$scope.followMe();
			$scope.mylat = position.coords.latitude;
			$scope.mylng = position.coords.longitude;
	        me = new google.maps.Marker({
	          map: $scope.map,
	          animation: google.maps.Animation.DROP,
	          position: myLatLng,
	          icon: 'img/icon.me.png'
	        });
			//if (default_app.storeLoaded == 0) {
				$scope.getStores();
			//}
		});
	});
    
	$scope.followMe = function() {
		$scope.map.setCenter(myLatLng);
	};

	$scope.getStores = function() {
    $scope.showload();
    $scope.stores = [];
    $http.get($localStorage.growify.rest+'/get_stores', {
    	headers: { 'x-access-token': $localStorage.growify.access_token }
    }).
    then(function (data, status, headers, config) {
      $scope.hideload();
      $scope.isLoaded = true;
      for (var i = 0; i < data.data.length;i++) {
      	var store = data.data[i];

        // validar filtros
        var okStore = false;
        if (store.storeTypes.includes($localStorage.growifyCfg.tienda)) { // tipo de tienda

          if ($localStorage.growifyCfg.tienda == "virtual") {
            okStore = false;
          }
          else { // tiendas fisicas no tienen mas filtros
            okStore = true;
          }
        }
        
        if (okStore) {
        var storeGeo = new google.maps.LatLng(store.geolocation.lat, store.geolocation.long);
        if ($scope.mylng != 0 && $scope.mylat != 0) { 
          store.miDistancia = (Math.round(distance($scope.mylat, $scope.mylng, store.geolocation.lat, store.geolocation.long) * 100) / 100) + " KM";
        }
        else {
          store.miDistancia = "(??) KM";  
        }
        store.distancia = (Math.round(distance($scope.mylat, $scope.mylng, store.geolocation.lat, store.geolocation.long) * 100) / 100);
        store.rateAvg = Math.round(store.rateAvg);

        var contentString = '<div class="boxLinker">'+
            '<div class="siteLinker">'+
            '<a class="tiendaLinker" href="#/main/vertienda/'+store._id+'/">'+store.name+' &raquo;</a>'+
            '<div class="bodyLinker">'+
            '<p><b>Dirección:</b> '+store.address+'</b></p>'+
            '<p>A <b>'+store.miDistancia+'</b> de tí</p><p>';
        for (var d=1;d<=5;d++) {
          if (d > store.rateAvg) {
            contentString += '<img src="img/stars.off.png" />';
          }
          else {
            contentString += '<img src="img/stars.on.png" />';  
          }
          
        }
        contentString += '</p>'+
                   '</div>'+
                   '</div>'+
                   '</div>';

        infowindow[i] = new google.maps.InfoWindow({
          content: contentString
        });

        marker[i] = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          position: storeGeo,
          icon: 'img/icon.grow.png',
          url: '#/main/vertienda/'+store._id+'/',
          i: i
        });

        google.maps.event.addListener(marker[i], 'click', function() {
          if (infowindowOpened != 666) {
            infowindow[infowindowOpened].close();
          }
          infowindow[this.i].open($scope.map, marker[this.i]);
          var markerlatLng = marker[this.i].getPosition(); 
          $scope.map.setCenter(markerlatLng);
          infowindowOpened = this.i;
        });

        $scope.stores.push(store); 
        }
      }


      function compare(a,b) {
        if (a.distancia < b.distancia)
          return -1;
        if (a.distancia > b.distancia)
          return 1;
        return 0;
      }

      $scope.storesOrdered = $scope.stores.sort(compare);
      //default_app.storeLoaded = 1;
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
})
.directive('showTabs', function(ngIfDirective) {
  var ngIf = ngIfDirective[0];

  return {
    transclude: ngIf.transclude,
    priority: ngIf.priority,
    terminal: ngIf.terminal,
    restrict: ngIf.restrict,
    link: function($scope, $element, $attr) {
      var value = $attr['showTabs'];
      var yourCustomValue = $scope.$eval(value);
      var tabs = document.querySelector(".tabs");
      console.log(tabs);
      console.log(yourCustomValue);

      $attr.ngIf = function() {
        return yourCustomValue;
      };
      
      ngIf.link.apply(ngIf, arguments);
    }
  };
});;