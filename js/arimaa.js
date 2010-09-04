var ARIMAA = ARIMAA || function() {

	var board_width = 8;
	var board_height = 8;
  var	silver = { 'side': 'silver' }
  var gold = { 'side': 'gold' }
  
  var rabbit = create_piece('rabbit', 1);
  var cat = create_piece('cat', 2);
  var dog = create_piece('dog', 3);
  var horse = create_piece('horse', 4);
  var camel = create_piece('camel', 5);
  var elephant = create_piece('elephant', 6);

	var left = [-1, 0];
	var right = [1, 0];
	var north = [0, -1];
	var south = [0, 1];
	
	var directions = [left, right, north, south];
  
  function create_piece(type, strongness) {
  	return {
  		'type': type,
  		'strongness': strongness
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
  	 return new_board;
  }
  
  function is_empty_square(square) { return square.type === undefined; }
  
  function is_stronger(piece1, piece2) {
  	return piece1.strongness > piece2.strongness;
  }
  
  function is_friendly(piece1, piece2) { return piece1.side === piece2.side; }
  
  function get_piece(coordinate, board) { return board[coordinate.row][coordinate.col]; }
  
  function is_in_board(coordinate) { return coordinate.row >= 0 && coordinate.row < board_height && coordinate.col >= 0 && coordinate.col < board.width; }
  
  function get_neighbour(coordinate, direction, board) {
		var neighbour_coordinate = { 
			'col': coordinate.col + direction.x,
			'row': coordinate.row + direction.y
		}
		
		if(!is_in_board(neighbour_coordinate)) return false;
		else return get_piece(neighbour_coordinate, board);
  }
  
  function is_frozen(coordinate, board) {
    var piece = get_piece(coordinate, board);
    
    var friendly_neighbour_exists = GENERIC.exists(directions, function(direction) {
    		var neighbour = get_neighbour(coordinate, direction, board);
    		if(neighbour === false) return false;
    		else return is_friendly(neighbour);
    });
    
    if(friendly_neighbour_exists) return false;
    // check if there's opponent neighbour that is stronger
    else return GENERIC.exists(directions, function(direction) {
    	var neighbour = get_neighbour(coordinate, direction, board);
    	return is_stronger(neighbour) && !is_friendly(neighbour);
    });
  }

  
  function legal_moves(board, coordinate) {
  	if(board[coordinate.row][coordinate.col].type === undefined) return [];
  	
  	if(is_frozen(coordinate, board)) return [];
  	
		function get_x(direction) { return direction[0]; }
		function get_y(direction) { return direction[1]; }

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