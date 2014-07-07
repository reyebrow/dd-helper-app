// call this from the developer console and you can control both instances
$(document).ready( function() {
  // assuming you've got the appropriate language files,
  // clndr will respect whatever moment's language is set to.
  // moment.lang('ru');
  var calendars = {};

  // here's some magic to make sure the dates are happening this month.
  var thisMonth = moment().format('YYYY-MM');

  var eventArray = [];

  projNum = 0;

  for (var i in projects){

    projNum++;
    for (var j in projects[i].issues ) {
      
      var myevent  = projects[i].issues[j];

      eventArray.push({
        startDate: myevent.moment_duedate,
        endDate: myevent.moment_duedate,
        title: myevent.title,
        rendered: '<a class="tiny radius button proj-num-' + projNum + '" target="_blank" href="' + myevent.url + '" >' + myevent.title + '</a>',
        project: myevent.project.name
      });

    }
  }

  // console.log(issues);
  console.log(eventArray);

  var redoFoundation = function(){
    // For data-equalizer to work:
    $(document).foundation();
  }

  calendars.clndr1 = $('.calendar').clndr({

    template: $('#clndr-template').html(),

    events: eventArray,

    clickEvents: {
      click: function(target) {
      },
      nextMonth: function() { },
      previousMonth: function() { },
      onMonthChange: function() {
        redoFoundation();
      }
    },
    multiDayEvents: {
      startDate: 'startDate',
      endDate: 'endDate'
    },
    showAdjacentMonths: true,
    adjacentDaysChangeMonth: false
  });

  // bind both clndrs to the left and right arrow keys
  $(this).keydown( function(e) {
    if(e.keyCode == 37) {
      // left arrow
      calendars.clndr1.back();
    }
    if(e.keyCode == 39) {
      // right arrow
      calendars.clndr1.forward();
    }
  });


  redoFoundation();


});





