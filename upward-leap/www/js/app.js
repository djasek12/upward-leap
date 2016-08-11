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
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
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
                controller: 'AlertCtrl'
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


angular.module('starter').factory('BirthdayService', ['$q', BirthdayService]);

function BirthdayService($q) {
    var _db;

    // We'll need this later.
    var _birthdays;

    return {
        initDB: initDB,

        // We'll add these later.
        getAllBirthdays: getAllBirthdays,
        addBirthday: addBirthday,
        updateBirthday: updateBirthday,
        deleteBirthday: deleteBirthday
    };

    function initDB() {
        // Creates the database or opens if it already exists
        console.log("creating db")
        _db = new PouchDB('test7');
    };

    function addBirthday(birthday) {
        console.log("adding birthday: " + birthday);

        var doc = {
            "_id": "mittens2",
            "name": "Mittens",
            "occupation": "kitten",
            "age": 3,
            "hobbies": [
                "playing with balls of yarn",
                "chasing laser pointers",
            ]
        };

    };

    function updateBirthday(birthday) {
        return $q.when(_db.put(birthday));
    };

    function deleteBirthday(birthday) {
        return $q.when(_db.remove(birthday));
    };

    function getAllBirthdays() {
        console.log("getting all birthdays");
        if (!_birthdays) {
            return $q.when(_db.allDocs({ include_docs: true}))
            .then(function(docs) {
                console.log("inside first one")
                // Each row has a .doc object and we just want to send an
                // array of birthday objects back to the calling controller,
                // so let's map the array to contain just the .doc objects.
                _birthdays = docs.rows.map(function(row) {
                    // Dates are not automatically converted from a string.
                    return row.doc;
                });

                // Listen for changes on the database.
                _db.changes({ live: true, since: 'now', include_docs: true})
                .on('change', onDatabaseChange);
                return _birthdays;
            });
        } else {
            // Return cached data as a promise
            return $q.when(_birthdays);
        }
    };

    function onDatabaseChange(change) {
        var index = findIndex(_birthdays, change.id);
        var birthday = _birthdays[index];

        if (change.deleted) {
            if (birthday) {
                _birthdays.splice(index, 1); // delete
            }
        } else {
            if (birthday && birthday._id === change.id) {
                _birthdays[index] = change.doc; // update
            } else {
                _birthdays.splice(index, 0, change.doc) // insert
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
