/* This little module make easier the selection of a date (day, month, hour). */
$(function(){
  var months = {
    "janvier": {nbDays: 31, index: 1},
    "février": {nbDays: 28, index: 2},
    "mars": {nbDays: 31, index: 3},
    "avril": {nbDays: 30, index: 4},
    "mai": {nbDays: 31, index: 5},
    "juin": {nbDays: 30, index: 6},
    "juillet": {nbDays: 31, index: 7},
    "août": {nbDays: 31, index: 8},
    "septembre": {nbDays: 30, index: 9},
    "octobre": {nbDays: 31, index: 10},
    "novembre": {nbDays: 30, index: 11},
    "décembre": {nbDays: 31, index: 12}
  }

  function updateDays(month, elem, defaultDay){
    var previouslySelected = elem.children(':selected').text();

    elem.find('option').remove().end();
    for(var day = 1; day <= months[month].nbDays; day++) {
      day = (day <= 9 ? "0" : "") + day
      elem.append("<option value='" + day +"' " + (+defaultDay == +day ? "selected=true" : "") + ">" + day + "</option>");
    }

    /* Remettre l'élément précécemment sélectionné s'il y a lieu */
    if(previouslySelected != "" && +previouslySelected <= months[month].nbDays){
      elem.val(previouslySelected);
    }
  }

  /* Année Bissextile - Meilleure invention de l'humanité. */
  if ((new Date()).getFullYear() % 4 == 0) {
    months["fevrier"].nbDays++;
  }

  /* Création des selects initiaux */
  /* Récupération des valeurs par défaut, s'il y a lieu */
  $('.monthDate').each(function(){
    var dayElem = $(this).parent().children('.dayDate');
    var hourElem = $(this).parent().children('.hourDate');
    var defaultMonth = $(this).val();
    var defaultDay = dayElem.val();
    var defaultHour = hourElem.val();
    
    console.log(defaultDay);
    console.log(defaultMonth);
    console.log(defaultHour);

    $(this).find('option').remove().end();
    for(var month in months){
      defaultMonth = (+months[month].index == +defaultMonth ? month : defaultMonth);
      $(this).append("<option value='" + months[month].index + "' " + (defaultMonth == month ? "selected=true" : "") + ">" + month + "</option>");
    }
    $(hourElem).find('option').remove().end();
    for(var hour = 0;  hour < 24; hour++){
      hour = (hour <= 9 ? "0" : "") + hour;
      hourElem.append("<option value='" + hour + "' " + (+defaultHour == +hour ? "selected=true" : "") + ">" + hour + ":00h</option>");
    }
    defaultMonth = defaultMonth || "janvier";
    updateDays(defaultMonth, dayElem, defaultDay);

  });
  
  /* Réagir au changement de mois */
  $('.monthDate').change(function(){
    updateDays($(this).children(':selected').text(), $(this).parent().children('.dayDate'));
  });
});