var ARIMAA = ARIMAA || function() {

	var board_width = 8;
	var board_height = 8;
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
  
  /** Copies the board structure (immutability guarantees less problems) */
  function copy_board(old) {
  	return GENERIC.map(old, function(row) {
  		return GENERIC.map(row, function(elem) { return elem; });
  	});
  }
  
  function move_piece(board, piece_coordinate, new_coordinate) {
  	 var new_board = copy_board(board);
  	 var piece = new_board[piece_coordinate.row][piece_coordinate.col];
  	 new_board[piece_coordinate.row][piece_coordinate.col] = {}; // takes piece away from old place
  	 new_board[new_coordinate.row][new_coordinate.col] = piece;
  	 console.log(piece_coordinate);
  	 console.log(new_coordinate);
  	 return new_board;
  }
  
  function is_empty_square(square) { return square.type === undefined; }
  function legal_moves(board, coordinate) {
  	if(board[coordinate.row][coordinate.col].type === undefined) return false;
		function get_x(direction) { return direction[0]; }
		function get_y(direction) { return direction[1]; }

  	var left = [-1, 0];
  	var right = [1, 0];
  	var north = [0, -1];
  	var south = [0, 1];
  	
  	function can_move_to(direction) {
  		var x = coordinate.col + get_x(direction);
  		var y = coordinate.row + get_y(direction);
  		
  		if(x < 0 || y < 0 || x >= board_width || y >= board_height) return false;
  		return is_empty_square(board[y][x]); //FIXME: also pushing and pulling should be considered
  	}
  	
  	var legal_directions = GENERIC.filter([left, right, north, south], can_move_to);
  	return GENERIC.map(legal_directions, function(direction) { 
  			return {
  				'row': coordinate.row + get_y(direction),
  				'col': coordinate.col + get_x(direction)
  			}
  	});
  }
  
  return {
  	'board_width': board_width,
  	'board_height': board_height,
  	'silver': silver,
  	'gold': gold,
  	'rabbit': rabbit,
  	'cat': cat,
  	'dog': dog,
  	'horse': horse,
  	'camel': camel,
  	'elephant': elephant,
  	'legal_moves': legal_moves,
  	'move_piece': move_piece
  }
  
}();