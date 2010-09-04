var ARIMAA = ARIMAA || function() {

  var	silver = { 'side': 'silver' }
  var gold = { 'side': 'gold' }
  
  var rabbit = create_piece('rabbit');
  var cat = create_piece('cat');
  var dog = create_piece('dog');
  var horse = create_piece('horse');
  var camel = create_piece('camel');
  var elephant = create_piece('elephant');
  
  function create_piece(type) {
  	return {
  		'type': type
  	}
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