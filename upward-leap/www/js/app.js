// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var mainApp = angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'ionic-timepicker', 'ionic-datepicker'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        if(ionic.Platform.isWebView() && device.platform === "iOS") {
            window.plugin.notification.local.promptForPermission();
        }

    });
})

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

    .state('app.reminders', {
        cache: false,
        url: '/reminders',
        views: {
            'menuContent': {
                templateUrl: 'templates/reminders.html'
            }
        }
    })
    .state('app.welcome', {
        url: '/welcome',
        views: {
            'menuContent': {
                templateUrl: 'templates/welcome.html',
                controller: 'WelcomeCtrl'
            }
        }
    })

    .state('app.newReminder', {
        url: '/newReminder',
        views: {
            'menuContent': {
                templateUrl: 'templates/newReminder.html',
            }
        }
    })
    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/welcome');
})

.config(function (ionicTimePickerProvider) {
    var timePickerObj = {
        inputTime: (((new Date()).getHours()*60*60) + ((new Date()).getMinutes()*60)),
        format: 12,
        step: 15,
        setLabel: 'Set',
        closeLabel: 'Close'
    };
    ionicTimePickerProvider.configTimePicker(timePickerObj);
});


angular.module('starter').factory('ReminderService', ['$q', ReminderService]);

function ReminderService($q) {
    var _db;

    var _reminders;

    return {
        initDB: initDB,
        getAllReminders: getAllReminders,
        addReminder: addReminder,
        deleteAllReminders: deleteAllReminders
    };

    function initDB() {
        // Creates the database or opens if it already exists
        console.log("creating db")
        _db = new PouchDB('reminders');
    };

    function addReminder(reminder) {
        console.log("adding reminder: " + JSON.stringify(reminder));

        return $q.when(_db.post(reminder));

    };

    function updateReminder(reminder) {
        return $q.when(_db.put(reminder));
    };

    function deleteAllReminders() {
        console.log("destroying database")
        // return $q.when(_db.destroy());

        _db.destroy().then(function (response) {
          console.log("successfully dropped")
          return $q.when(_db.put({"test":1}));
        }).catch(function (err) {
          console.log(err);
          return $q.when(_db.put({"test":1}));
        });
    };

    function getAllReminders() {
        console.log("getting all reminders");
        if (!_reminders) {
            return $q.when(_db.allDocs({ include_docs: true}))
            .then(function(docs) {
                console.log("inside first one")
                // Each row has a .doc object and we just want to send an
                // array of reminder objects back to the calling controller,
                // so let's map the array to contain just the .doc objects.
                _reminders = docs.rows.map(function(row) {
                    // Dates are not automatically converted from a string.
                    return row.doc;
                });

                // Listen for changes on the database.
                _db.changes({ live: true, since: 'now', include_docs: true})
                .on('change', onDatabaseChange);
                return _reminders;
            });
        } else {
            // Return cached data as a promise
            return $q.when(_reminders);
        }
    };

    function onDatabaseChange(change) {
        var index = findIndex(_reminders, change.id);
        var reminder = _reminders[index];

        if (change.deleted) {
            if (reminder) {
                _reminders.splice(index, 1); // delete
            }
        } else {
            if (reminder && reminder._id === change.id) {
                _reminders[index] = change.doc; // update
            } else {
                _reminders.splice(index, 0, change.doc) // insert
            }
        }
    };

    // Binary search, the array is by default sorted by _id.
    function findIndex(array, id) {
        var low = 0, high = array.length, mid;
        while (low < high) {
            mid = (low + high) >>> 1;
            array[mid]._id < id ? low = mid + 1 : high = mid
        }
        return low;
    };
}
