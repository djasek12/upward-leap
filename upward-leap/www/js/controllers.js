angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});
})

.controller('WelcomeCtrl', function($scope) {
})

.controller('AlertCtrl', function($scope, $cordovaLocalNotification, $ionicPlatform, ionicTimePicker, ionicDatePicker, $state, ReminderService) {

    $scope.navToNewReminder = function () {
      console.log("navToNewReminder clicked");
      $state.go('app.newReminder');
    }

    $ionicPlatform.ready(function() {
        // ReminderService.initDB();
        // ReminderService.addReminder("test");
        //
        // // // Get all Reminder records from the database.
        // ReminderService.getAllReminders().then(function(Reminders) {
        //     $scope.reminders = JSON.stringify(Reminders);
        //     console.log("all Reminders: " + $scope.reminders);
        // });

        if(ionic.Platform.isWebView() && device.platform === "iOS") {
            window.plugin.notification.local.promptForPermission();
        }
    });

    $scope.$watch('counter', function(newValue, oldValue) {
        if (newValue !== oldValue) {
            console.log("updating value");
            window.localStorage.setItem("counter", $scope.counter);
        }
    });


    $scope.$on('$stateChangeSuccess', function () {

        $scope.counter = localStorage.getItem("counter");

        $scope.readyToScheduleNotification = false;

        var now = new Date();
        $scope.year = now.getFullYear();
        $scope.month = ("0" + (now.getMonth())).slice(-2);
        $scope.day = ("0" + now.getDate()).slice(-2);
        $scope.hours = now.getHours();
        $scope.minutes = ("0" + now.getMinutes()).slice(-2);

        // console.log($scope.year);
        // console.log($scope.month);
        // console.log($scope.day);
        // console.log($scope.hours);
        // console.log($scope.minutes);
        // console.log(now);
    });

    var dateObj = {
        callback: function (val) {
            var date = new Date(val);
            $scope.date = date;

            $scope.year = date.getFullYear();
            $scope.month = ("0" + (date.getMonth())).slice(-2);
            $scope.day = ("0" + date.getDate()).slice(-2);


            $scope.timePickerOpened = true;

            // console.log("new year: " + $scope.year);
            // console.log("new month: " + $scope.month);
            // console.log("new day: " + $scope.day);
        },
        from: new Date(),
        inputDate: new Date(),
        disableWeekdays: [0],
        closeOnSelect: false,
        templateType: 'popup'
    };

    $scope.timeObj = {
        callback: function (val) {      //Mandatory
            if (typeof (val) === 'undefined') {
                console.log('Time not selected');
            } else {
                time = new Date(val*1000);

                $scope.hours = time.getUTCHours();
                $scope.minutes = time.getUTCMinutes();

                // console.log("hours updated: " + $scope.hours);
                // console.log("minutes: " + $scope.minutes);

                $scope.readyToScheduleNotification = true;
            }
        },
        inputTime: 25200,   //Optional
        format: 12,         //Optional
        step: 5,           //Optional
        setLabel: 'Set'    //Optional
    };

    $scope.openDatePicker = function(){
        ionicDatePicker.openDatePicker(dateObj);
    };

    $scope.openTimePicker = function(){
        console.log("timepicker opened");
        ionicTimePicker.openTimePicker($scope.timeObj);
    };

    $scope.setReminderText = function() {

        switch($scope.reminderType)
        {
            case "prayer":
            $scope.reminderText = "Remember to pray ";
            switch($scope.prayerType)
            {
                case "ourFather":
                $scope.reminderText += "an Our Father";
                break;
                case "hailMary":
                $scope.reminderText += "a Hail Mary";
                break;
                case "gloryBe":
                $scope.reminderText += "a Glory Be";
                break;
            }
        }
    }

    $scope.scheduleReminder = function() {

        $scope.setReminderText();

        //console.log("about to set date: " + $scope.year+ $scope.month+ $scope.day+ $scope.hours+ $scope.minutes);
        $scope.date = new Date($scope.year, $scope.month, $scope.day, $scope.hours, $scope.minutes);

        console.log("reminderType: " + $scope.reminderType);
        console.log("reminderText: " + $scope.reminderText);
        console.log("frequency: " + $scope.frequency);
        console.log("new date: " + $scope.date);
        console.log("current date: " + new Date());

        $scope.reminder = {
          id: 10,
          title: $scope.reminderType,
          text: $scope.reminderText,
          every: $scope.frequency,
          autoClear: false,
          at: $scope.date
        }

        //ReminderService.addReminder($scope.reminder);

        console.log("reminder object: " + $scope.reminder);

        document.addEventListener('deviceready', function () {
          console.log("device ready");
          // cordova.plugins.notification.local.registerPermission(function(str) {
          //   console.log('Push Permissions:'+str);
            cordova.plugins.notification.local.schedule({
              id: 10,
              title: $scope.reminderType,
              text: $scope.reminderText,
              every: $scope.frequency,
              autoClear: false,
              at: $scope.date
            });
          });
        // });

    };

    $scope.openPickers = function() {
        console.log("openPickers")
        if($scope.frequency == 'day' || $scope.frequency == 'hour')
            $scope.openTimePicker()
        else {
            $scope.openTimePicker()
            $scope.openDatePicker()
        }
    }

    $scope.$watch('readyToScheduleNotification', function(newValue, oldValue) {
        if ($scope.readyToScheduleNotification == true) {
            $scope.readyToScheduleNotification = false;
            $scope.scheduleReminder();
        }
    });

    // add extra permissions needed for iOS

    document.addEventListener('deviceready', function () {
        // window.plugin.notification.local is now available

        $scope.cancelAllNotifications = function () {
            // cancel all scheduled notifications
            cordova.plugins.notification.local.cancelAll(
                function () {
                    alert('ok, all canceled');
                }
            )
        };

        $scope.displayNotifications = function () {
            cordova.plugins.notification.local.getScheduledIds(
                function (scheduledIds) {
                    alert(scheduledIds.join(', '));
                }
            )
        };

    }, false);

});

//.controller('PlaylistCtrl', function($scope, $stateParams) {
//});
