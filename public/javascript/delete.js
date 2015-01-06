$(function(){
  $('a.delete').wrap(function(){
    var action = $(this).attr('href');
    return "<form action='" + action + "' method='post' class='delete'></form>";
  });

  $('a.delete').click(function(){
    $(this).parent().submit();
    return false;
  });
});