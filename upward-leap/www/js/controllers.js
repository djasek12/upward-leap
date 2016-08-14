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

.controller('NewReminderCtrl', function($scope, $cordovaLocalNotification, $ionicPlatform, ionicTimePicker, ionicDatePicker, $state, ReminderService) {

    $scope.updateReminders = function() {
        console.log("calling update function");
        //$scope.reminders = ReminderService._reminders;
        ReminderService.getAllReminders().then(function(Reminders) {
            $scope.reminders = JSON.stringify(Reminders);
            console.log("all Reminders: " + $scope.reminders);
        });
    }

    $scope.$on('$stateChangeSuccess', function () {

        $scope.readyToScheduleNotification = false;

        var now = new Date();
        $scope.year = now.getFullYear();
        $scope.month = ("0" + (now.getMonth())).slice(-2);
        $scope.day = ("0" + now.getDate()).slice(-2);
        $scope.hours = now.getHours();
        $scope.minutes = ("0" + now.getMinutes()).slice(-2);
    });

    var dateObj = {
        callback: function (val) {
            var date = new Date(val);
            $scope.date = date;

            $scope.year = date.getFullYear();
            $scope.month = ("0" + (date.getMonth())).slice(-2);
            $scope.day = ("0" + date.getDate()).slice(-2);


            $scope.timePickerOpened = true;
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

        $scope.date = new Date($scope.year, $scope.month, $scope.day, $scope.hours, $scope.minutes);

        $scope.reminder = {
          id: new Date().getTime(),
          title: $scope.reminderType,
          text: $scope.reminderText,
          every: $scope.frequency,
          at: $scope.date
        }

        ReminderService.addReminder($scope.reminder);

        console.log("reminder object: " + $scope.reminder);

        document.addEventListener('deviceready', function () {
            console.log("device ready");
            cordova.plugins.notification.local.schedule($scope.reminder);
        });

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
})

.controller('RemindersCtrl', function($scope, $ionicPlatform, $state, ReminderService) {

    $scope.navToNewReminder = function () {
      console.log("navToNewReminder clicked");
      $state.go('app.newReminder');
    }

    $scope.updateReminders = function() {
        console.log("calling update function");
        //$scope.reminders = ReminderService._reminders;
        ReminderService.getAllReminders().then(function(Reminders) {
            $scope.reminders = JSON.stringify(Reminders);
            console.log("all Reminders: " + $scope.reminders);
        });
    }



    $ionicPlatform.ready(function() {
        ReminderService.initDB();

        $scope.updateReminders();

        if(ionic.Platform.isWebView() && device.platform === "iOS") {
            console.log("prompting for permission");
            window.plugin.notification.local.registerPermission();
        }
    });

    $scope.cancelAllNotifications = function () {
        ReminderService.deleteAllReminders().then(function() {
            console.log("test");
            ReminderService.initDB();
            $scope.updateReminders();
            $state.go('app.reminders');
        });

        if(ionic.Platform.isWebView()) {
            cordova.plugins.notification.local.cancelAll(
                function () {
                    ReminderService.deleteAllReminders();
                    alert('ok, all canceled');
                }
            )
        }
    };

});

//.controller('PlaylistCtrl', function($scope, $stateParams) {
//});
