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

  var traps = [[2, 2], [2, 5], [5, 2], [5, 5]];
  
	var left = [-1, 0];
	var right = [1, 0];
	var north = [0, -1];
	var south = [0, 1];

	function get_x(direction) { return direction[0]; }
	function get_y(direction) { return direction[1]; }
	
	var directions = [left, right, north, south];
	
	function is_rabbit(piece) { return piece.type === 'rabbit'; }
  
  function create_piece(type, strength) {
  	return {
  		'type': type,
  		'strength': strength
  	}
  }
  
  /** Copies the board structure (immutability guarantees less problems) */
  function copy_board(old) {
  	return GENERIC.map(old, function(row) {
  		return GENERIC.map(row, function(elem) { return elem; });
  	});
  }
  
  function is_in_trap(coordinate) {
  	return GENERIC.exists(traps, function(trap) {
  			return coordinate['row'] === trap[0] && coordinate['col'] === trap[1];
  	});
  }
  
  function is_captured_piece(coordinate, board) {
  	if(!is_in_trap(coordinate)) return false;
  	
  	var piece = get_piece(coordinate, board);
  	var exists_friendly_neighbour = GENERIC.exists(neighbours(coordinate, board), function(neighbour) {
  			return is_friendly(piece, neighbour);
    });

		return !exists_friendly_neighbour;  
  }
  
  function move_piece(gamestate, board, piece_coordinate, new_coordinate) {
  	 var new_board = copy_board(board);
  	 var piece = new_board[piece_coordinate.row][piece_coordinate.col];
  	 new_board[piece_coordinate.row][piece_coordinate.col] = {}; // takes piece away from old place
  	 new_board[new_coordinate.row][new_coordinate.col] = piece;
  	 
  	 if(is_captured_piece(new_coordinate, new_board)) {
  	 	 new_board[new_coordinate.row][new_coordinate.col] = {} // captures piece
  	 }
  	 
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
  
  function same_coordinates(a, b) {
  	return a.row === b.row && a.col === b.col;
  }

  function neighbours(coordinate, board) {
  	var neighbour_candidates =GENERIC.map(neighbour_coordinates(coordinate), function(neighbour_coordinate) {
  			return get_piece(neighbour_coordinate, board);
  	});

  	return GENERIC.filter(neighbour_candidates, function(candidate) { return !!candidate; });
  }
  
  function neighbour_coordinates(coordinate) {
  	return GENERIC.filter(
  					GENERIC.map(directions, function(direction) { return get_neighbour_coordinate(coordinate, direction); }),
  					function(elem) { return !!elem; });
  }
  
  function gamestate_after_move(gamestate, laststep) {
  	var copy = GENERIC.shallowCopyObject(gamestate);
  	
  	if(!!gamestate.expectedmove) copy.expectedmove = undefined; // clear expectations for thise turn
  		
  	if(gamestate.steps > 1) {
  		copy.steps = gamestate.steps - 1;
    	copy.laststep = laststep;
    	// if it's the case of pushing, we must set expectations for next turn to it be completed
    	if(laststep !== undefined && laststep.piece.side !== gamestate.turn && 
    		(gamestate.laststep === undefined || !same_coordinates(gamestate.laststep.from, laststep.to))) { // the case where pulling was completed must be checked
    		copy.expectedmove = {
    			'side': gamestate.turn,
    			'strength': laststep.piece.strength,
    			'from_array': neighbour_coordinates(laststep.from),
    			'to': gamestate.laststep.from
    		}     		
    	}
  	} else {
  	  copy.steps = steps_in_move;
  	  copy.turn = gamestate.turn === gold ? silver : gold;
  	  copy.laststep = undefined;
  	}  		
  	
 		return copy;
  }
  
  function is_empty_square(square) { return square.type === undefined; }
  
  function is_stronger(piece1, piece2) {
  	return piece1.strength > piece2.strength;
  }
  
  function is_friendly(piece1, piece2) { return piece1.side === piece2.side; }
  
  function get_piece(coordinate, board) { 
  	var square = board[coordinate.row][coordinate.col];
  	return is_empty_square(square) ? false : square; 
  }
  
  function is_in_board(coordinate) { return coordinate.row >= 0 && coordinate.row < board_height && coordinate.col >= 0 && coordinate.col < board_width; }

  function get_neighbour_coordinate(coordinate, direction) {
		var neighbour_coordinate = { 
			'col': coordinate.col + get_x(direction),
			'row': coordinate.row + get_y(direction)
		}
		
		if(!is_in_board(neighbour_coordinate)) return false;
		else return neighbour_coordinate;
  }
  
  function get_neighbour(coordinate, direction, board) {
  	var coord = get_neighbour_coordinate(coordinate, direction);
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
  	var neighbour_coords = neighbour_coordinates(coordinate);
  	var empty_squares = GENERIC.filter(neighbour_coords, function(neighbour_coordinate) {
  			return is_empty_square(neighbour_coordinate);
  	});
  	/*
  	var empty_squares = GENERIC.filter(directions, function(direction) {
  		var neighbour_coord = get_neighbour_coordinate(coordinate, direction);
  		return !!neighbour_coord && is_empty_square(neighbour_coord, board);
  	});
  	*/
  	
  	if(empty_squares.length === 0) return [];

  	var piece = get_piece(coordinate, board);
  	
  	/*
  	var exists_stronger_neighbour = GENERIC.exists(directions, function(direction) {
  			var neighbour = get_neighbour(coordinate, direction, board);
  			return !!neighbour && !is_friendly(piece, neighbour) && is_stronger(neighbour, piece) && !is_frozen(neighbour); 
  	});
  	*/
  	
  	/*
  	var exists_stronger_neighbour = GENERIC.exists(neighbours(coordinate, board), function(neighbour) {
  			return !is_friendly(piece, neighbour) && is_stronger(neighbour, piece) && !is_frozen(neighbour);
  	});
  	*/
  	
  	var exists_stronger_neighbour = GENERIC.exists(neighbour_coords, function(neighbour_coord) {
  			var neighbour = get_piece(neighbour_coord, board);
  			return !is_friendly(piece, neighbour) && is_stronger(neighbour, piece) && !is_frozen(neighbour_coord, board);
  	});  	
  	
  	return exists_stronger_neighbour ? empty_squares : [];
  }
  
  function pull_moves(gamestate, board, coordinate) {
  	if(!gamestate.laststep) return []; // no last step in this side
  	if(!is_stronger(gamestate.laststep.piece, get_piece(coordinate, board))) return [];

    // check whether last move there was a move by current side that can be considered pull in this step
  	var can_be_pulled = GENERIC.exists(directions, function(direction) {
  			var neighbour_coord = get_neighbour_coordinate(coordinate, direction);
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

  	// expected move means that one must complete push
  	/*
  	if(!!gamestate.expectedmove) {
  	  if(gamestate.turn !== gamestate.expectedmove.turn) return [];
  	  if(get_piece(coordinate, board).strength <= gamestate.expectedmove.strength) return [];
  	  var is_from_neighbour = GENERIC.exists(gamestate.expectedmove.from_array, function(from) {
  	  		return same_coordinate(from, coordinate);
  	  });
  	  if(is_from_neighbour) return [gamestate.expectedmove.from];
  	  else return [];
    }
    */
    			
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
  	'traps': traps,
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