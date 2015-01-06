$(function(){
  /* This will handle optionnal input. An input is associated with a checkbox. 
  Whether or not it is checked, the input is making available or not.
  */
  var update = function(){
    /* Toggle the input */
    var inputSelector = '[trigger-name="' + $(this).attr('trigger-target') + '"]';
    var isChecked = $(this).is(':checked');
    $(this).parent().children(inputSelector).each(function(){
      $(this).prop('disabled', !isChecked);
    });
  }

  /* Call It once for each elem at the loading */
  $('.triggerInput').each(update);

  /* Call it whenever the checkbox is checked/unchecked */
  $('.triggerInput').change(update);
});