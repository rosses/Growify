/* Configuracion */
var default_app_ = {
    modo:"prod", 
    rest:"http://104.131.133.69:3002",
    cdn: "http://104.131.133.69:3000",
    auth: 0,
    username: '',
    email: '',
    password: '',
    id: '',
    access_token: '',
    storeLoaded: 0,
    offersLoaded: 0,
    searchLoaded: 0,
    facebookId: 0,
    googleId: 0,
    firstName: ''
};
var default_app = default_app_;
infowindow = [];
infowindowOpened = 666;
isCordovaApp = !!window.cordova;

angular.module('growify', ['ngCordova', 'angular-websql', 'ionic', 'growify.controllers', 'ngStorage', 'slickCarousel', 'ionic.contrib.drawer'])

.run(function($rootScope,$ionicPlatform,$ionicSideMenuDelegate,$localStorage,$cordovaGeolocation,$webSql, $cordovaSplashscreen) {
  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
    
  });
  $ionicPlatform.registerBackButtonAction(function(e){
    //do your stuff
    e.preventDefault();
    return false;
  },101); // prioridad 100 android, 101 lo pisa

  $rootScope.db = $webSql.openDatabase("growify", "1.1", "Aplicacion Growify", 5 * 1024 * 1024);
  $rootScope.default = default_app;
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  .state('registro', {
    url: '/registro',
    templateUrl: 'templates/registro.html',
    controller: 'RegistroCtrl'
  })
  .state('terms', {
    url: '/terms',
    templateUrl: 'templates/terms.html',
    controller: 'termsCtrl'
  })
  .state('recover', {
    url: '/recover',
    templateUrl: 'templates/recover.html',
    controller: 'recoverCtrl'
  })
  .state('main', {
    url: '/main',
    abstract: true,
    templateUrl: 'templates/main.html',
    controller: 'MainCtrl'
  })

  .state('main.home', {
    url: '/home',
    views: {
      'home-tab': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  })
  .state('main.promociones', {
    url: '/promociones',
    views: {
      'promociones-tab': {
        templateUrl: 'templates/promociones.html',
        controller: 'PromocionesCtrl'
      }
    }
  })
  .state('main.favoritos', {
    url: '/favoritos',
    views: {
      'favoritos-tab': {
        templateUrl: 'templates/favoritos.html',
        controller: 'FavoritosCtrl'
      }
    }
  })
  .state('main.perfil', {
    url: '/perfil',
    views: {
      'home-tab': {
        templateUrl: 'templates/perfil.html',
        controller: 'PerfilCtrl'
      }
    }
  })
  .state('main.vertiendaproducto', {
    url: '/vertiendaproducto/{id:/?.*}/{pro:/?.*}',
    views: {
      'home-tab': {
        templateUrl: 'templates/verproducto.html',
        controller: 'VerTiendaProductoCtrl'
      }
    }
  })
  .state('main.vertiendaproducto_fav', {
    url: '/vertiendaproducto_fav/{id:/?.*}/{pro:/?.*}',
    views: {
      'favoritos-tab': {
        templateUrl: 'templates/verproducto.html',
        controller: 'VerTiendaProductoCtrl'
      }
    }
  })
  .state('main.vertiendaproducto_buscar', {
    url: '/vertiendaproducto_buscar/{id:/?.*}/{pro:/?.*}',
    views: {
      'buscar-tab': {
        templateUrl: 'templates/verproducto.html',
        controller: 'VerTiendaProductoCtrl'
      }
    }
  })
  .state('main.vertienda_fav', {
    url: '/vertienda_fav/{id:/?.*}',
    views: {
      'favoritos-tab': {
        templateUrl: 'templates/vertienda.html',
        controller: 'VerTiendaCtrl'
      }
    }
  })
  .state('main.vertienda', {
    url: '/vertienda/{id:/?.*}',
    views: {
      'home-tab': {
        templateUrl: 'templates/vertienda.html',
        controller: 'VerTiendaCtrl'
      }
    }
  })

  .state('main.buscar', {
    url: '/buscar',
    views: {
      'buscar-tab': {
        templateUrl: 'templates/buscar.html',
        controller: 'BuscarCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  //abstract: true,
  $urlRouterProvider.otherwise('/login');
});