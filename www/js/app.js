/* Configuracion */
var default_app = {
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
    searchLoaded: 0
};
infowindow = [];
infowindowOpened = 666;

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
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  })
  .state('main.promociones', {
    url: '/promociones',
    views: {
      'menuContent': {
        templateUrl: 'templates/promociones.html',
        controller: 'PromocionesCtrl'
      }
    }
  })
  .state('main.favoritos', {
    url: '/favoritos',
    views: {
      'menuContent': {
        templateUrl: 'templates/favoritos.html',
        controller: 'FavoritosCtrl'
      }
    }
  })
  .state('main.perfil', {
    url: '/perfil',
    views: {
      'menuContent': {
        templateUrl: 'templates/perfil.html',
        controller: 'PerfilCtrl'
      }
    }
  })
  .state('main.vertiendaproducto', {
    url: '/vertiendaproducto/{id:/?.*}/{pro:/?.*}',
    views: {
      'menuContent': {
        templateUrl: 'templates/verproducto.html',
        controller: 'VerTiendaProductoCtrl'
      }
    }
  })
  .state('main.vertienda', {
    url: '/vertienda/{id:/?.*}',
    views: {
      'menuContent': {
        templateUrl: 'templates/vertienda.html',
        controller: 'VerTiendaCtrl'
      }
    }
  })

  .state('main.buscar', {
    url: '/buscar',
    views: {
      'menuContent': {
        templateUrl: 'templates/buscar.html',
        controller: 'BuscarCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  //abstract: true,
  $urlRouterProvider.otherwise('/login');
});