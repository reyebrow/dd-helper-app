// call this from the developer console and you can control both instances
$(document).ready( function() {

  $(this).foundation('abide', {
    patterns: {
    password: /^(?=.*\d).{4,8}$/, 
    }
  });

  $(this).foundation();
});

