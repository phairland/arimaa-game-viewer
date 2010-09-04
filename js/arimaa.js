var ARIMAA = ARIMAA || function() {

  var	silver = { 'side': 'silver' }
  var gold = { 'side': 'gold' }
  
  var rabbit = piece('rabbit');
  var cat = piece('cat');
  var dog = piece('dog');
  var horse = piece('horse');
  var camel = piece('camel');
  var elephant = piece('elephant');
  
  function create_piece(type) = {
  	return {
  		'type': type
  	};
  }
  
  return {
  	'silver': silver,
  	'gold': gold,
  	'rabbit': rabbit,
  	'cat': cat,
  	'dog': dog,
  	'horse': horse,
  	'camel': camel,
  	'elephant': elephant
  }
  
}();