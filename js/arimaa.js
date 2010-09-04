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
  
  var steps_in_move = 4;

	var left = [-1, 0];
	var right = [1, 0];
	var north = [0, -1];
	var south = [0, 1];

	function get_x(direction) { return direction[0]; }
	function get_y(direction) { return direction[1]; }
	
	var directions = [left, right, north, south];
	
	function is_rabbit(piece) { return piece.type === 'rabbit'; }
  
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
  
  function move_piece(gamestate, board, piece_coordinate, new_coordinate) {
  	 var new_board = copy_board(board);
  	 var piece = new_board[piece_coordinate.row][piece_coordinate.col];
  	 new_board[piece_coordinate.row][piece_coordinate.col] = {}; // takes piece away from old place
  	 new_board[new_coordinate.row][new_coordinate.col] = piece;
  	 
  	 var laststep = {
  	 	 'piece': piece,
  	 	 'from': piece_coordinate,
  	 	 'to': new_coordinate  	 	 
  	 }
  	 
  	 return {
  	 	 'board': new_board,
  	 	 'gamestate': gamestate_after_move(gamestate, laststep)
  	 }
  }
  
  function gamestate_after_move(gamestate, laststep) {
  	var copy = GENERIC.shallowCopyObject(gamestate);
  	
  	if(gamestate.steps > 1) {
  		copy.steps = gamestate.steps - 1;
    	copy.laststep = laststep;
  	} else {
  	  copy.steps = steps_in_move;
  	  copy.turn = gamestate.turn === gold ? silver : gold;
  	  copy.laststep = undefined;
  	}  		
  	
 		return copy;
  }
  
  function is_empty_square(square) { return square.type === undefined; }
  
  function is_stronger(piece1, piece2) {
  	return piece1.strongness > piece2.strongness;
  }
  
  function is_friendly(piece1, piece2) { return piece1.side === piece2.side; }
  
  function get_piece(coordinate, board) { return board[coordinate.row][coordinate.col]; }
  
  function is_in_board(coordinate) { return coordinate.row >= 0 && coordinate.row < board_height && coordinate.col >= 0 && coordinate.col < board_width; }

  function get_neighbour_coordinate(coordinate, direction, board) {
		var neighbour_coordinate = { 
			'col': coordinate.col + get_x(direction),
			'row': coordinate.row + get_y(direction)
		}
		
		if(!is_in_board(neighbour_coordinate)) return false;
		else return neighbour_coordinate;
  }
  
  function get_neighbour(coordinate, direction, board) {
  	var coord = get_neighbour_coordinate(coordinate, direction, board);
  	if(!coord) return false;
		else return get_piece(coord, board);
  }
  
  function is_frozen(coordinate, board) {
    var piece = get_piece(coordinate, board);
    
    var friendly_neighbour_exists = GENERIC.exists(directions, function(direction) {
    		var neighbour = get_neighbour(coordinate, direction, board);
    		return !!neighbour && is_friendly(piece, neighbour);
    });
    
    if(friendly_neighbour_exists) return false;
    // check if there's opponent neighbour that is stronger
    else return GENERIC.exists(directions, function(direction) {
    	var neighbour = get_neighbour(coordinate, direction, board);
    	return !!neighbour && is_stronger(neighbour, piece) && !is_friendly(piece, neighbour);
    });
  }

  function is_gameover(gamestate) { return !!gamestate.gameover; }
  
  function current_player_piece(coordinate, board, gamestate) {
  	return get_piece(coordinate, board).side === gamestate.turn;
  }
  
  // assumption: piece in coordinate is opponents and steps >= 2
  // in push moves, opponent is moves first always
  function push_moves(gamestate, board, coordinate) {
  	// there is an empty square next to this coordinate where a neighbour opponent can push or pull me
  	return [];
  }
  
  function pull_moves(gamestate, board, coordinate) {
  	if(!gamestate.laststep) return []; // no last step in this side
  	if(!is_stronger(gamestate.laststep.piece, get_piece(coordinate, board))) return [];

    // check whether last move there was a move by current side that can be considered pull in this step
  	var can_be_pulled = GENERIC.exists(directions, function(direction) {
  			var neighbour_coord = get_neighbour_coordinate(coordinate, direction, board);
  			if(neighbour_coord.col === gamestate.laststep.from.col && neighbour_coord.row === gamestate.laststep.from.row) return true;
  	});
  	
  	if(can_be_pulled) {
  		return [gamestate.laststep.from];
  	} else return []; 	
  }
  
  function is_legal_rabbit_move(direction, gamestate) {
  	return (gamestate.turn === gold && get_y(direction) <= 0) || (gamestate.turn === silver && get_y(direction) >= 0);
  }

  function legal_moves(gamestate, board, coordinate) {
  	if(is_gameover(gamestate)) return [];
  	if(board[coordinate.row][coordinate.col].type === undefined) return [];
  	
  	var is_piece_current_players = current_player_piece(coordinate, board, gamestate);
  	if(is_piece_current_players && is_frozen(coordinate, board)) return [];
  	
  	if(!is_piece_current_players) {
     	var pull_result = pull_moves(gamestate, board, coordinate);
  		
  		if(gamestate.steps >= 2) {
  		  return pull_result.concat( push_moves(gamestate, board, coordinate) );
  		} else return pull_result;
  	}
  	
  	function can_move_to(direction) {
  	  if(is_rabbit(get_piece(coordinate, board)) && !is_legal_rabbit_move(direction, gamestate)) { return false; }
  
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
  	'steps_in_move': steps_in_move,
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