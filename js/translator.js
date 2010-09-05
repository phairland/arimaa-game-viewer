var TRANSLATOR = TRANSLATOR || function() {

	function convert_to_gametree(notated_game) {
		var tokens = notated_game.split(" ");
		var moves = divide_into_moves(tokens);
		//GENERIC.for_each(moves, function(move) { console.log(move); });
		//console.log(GENERIC.map(moves, function(move) { return move.id}));
		return moves;
	}
	
	function get_moveid(token) {
		if(token.length === 0) return false;
		var value = parseInt(token.slice(0, 1));
		if(!isNaN(value)) {
			return token;
		} else return false;
	}
	
	function divide_into_moves(tokens) {
		var result = [];
		
		for(var i = 0; i < tokens.length; ++i) {
			var moveid = get_moveid(tokens[i]);
			
			if(!!moveid) {
				var steps = get_steps(tokens.slice(i+1));
				var move = {
					'steps': steps,
					'id': moveid
				}
				
				result.push(move);
			}
		}
		
		return result;
	}
	
	function get_step_from_token(token) {
		return token;
	}
	
	function get_steps(tokens) {
		var result = [];
		
		for(var i = 0; i < tokens.length; ++i) {
			if(!!get_moveid(tokens[i])) return result;
			else {
				var step = get_step_from_token(tokens[i]);
				result.push(step);
			}
		}
		
		return result;
	}	

 // yes, this can be simplified with ASCII translation, but who cares?
	
 var column_translator = { 
		"a": 0,
		"b": 1,
		"c": 2,
		"d": 3,
		"e": 4,
		"f": 5,
		"g": 6,
		"h": 7
	}
	
	var piece_translator = {
		"e": ARIMAA.elephant,
		"m": ARIMAA.camel,
		"h": ARIMAA.horse,
		"d": ARIMAA.dog,
		"c": ARIMAA.cat,
		"r": ARIMAA.rabbit
	}

	var dir = ARIMAA.directions;
	var direction_translator = {
		"w": dir.west, "<": dir.west,
		"e": dir.east, ">": dir.east,
		"n": dir.north, "^": dir.north,
		"s": dir.south, "v": dir.south
	}

	function piece_is_removed(step) {
		return step.slice(3, 4).toLowerCase() === "x";
	}
	
	function is_gold_piece(character) {
		return character.toUpperCase() === character;
	}
	
	function get_piece(character) {
		var piece = piece_translator[character.toLowerCase()];
		return ARIMAA.get_piece_with_side(piece, is_gold_piece(character) ? ARIMAA.gold : ARIMAA.silver);
	}
	
	function parse_row_from_setting_step(step) {
		return ARIMAA.board_height - parseInt(step.slice(2, 3));
	}
	
	function board_setting_step(step) {
		var piece = get_piece(step.slice(0, 1));
		var coordinate = {
			'col': column_translator[step.slice(1, 2)],
			'row': parse_row_from_setting_step(step)
		}
		
		return {
			'type': 'setting',
			'piece': piece,
			'to': coordinate
		}
	}
	
	function is_board_setting_step(step) {
		return step.length === 3; // a bit ugly way to test, sure
	}
	
	function parse_row_from_normal_step(step) {
		return parse_row_from_setting_step(step); // incidentally it's read in same way
	}
	
	function piece_removal_step(step) {
		var coordinate = {
			'col': column_translator[step.slice(1, 2)],
			'row': parse_row_from_normal_step(step)
		}
		
		return {
			'type': 'removal',
			'coordinate': coordinate
		}
	}
	
	function convert_notated_step_to_coordinates(step) {
		if(is_board_setting_step(step)) {
			return board_setting_step(step);
		} else if(piece_is_removed(step)) {
			return piece_removal_step(step);
		}
		// otherwise it's normal move
		//FIXME: resignation move, what others?
		
		// example: cd7e means silver cat from d7 (row: 6, col: 3) to east (row: 6, col: 4)
		var piece = step.slice(0, 1); // piece can be ignored
		var coordinate_from = {
			'col': column_translator[step.slice(1, 2)],
			'row': parse_row_from_normal_step(step)
		}
		var direction = direction_translator[step.slice(3, 4)];
		var coordinate_to = ARIMAA.get_new_coordinate(coordinate_from, direction);
		
		return {
			'type': 'normal',
			'from': coordinate_from,
			'to': coordinate_to
		}
	}
	
	return {
	  'convert_to_gametree': convert_to_gametree,
	  'convert_notated_step_to_coordinates': convert_notated_step_to_coordinates
	};
}();
