var TRANSLATOR = TRANSLATOR || function() {

	function convert_to_gametree(notated_game) {
		var tokens = notated_game.split(" ");
		var moves = divide_into_moves(tokens);
		GENERIC.for_each(moves, function(move) { console.log(move); });
		//console.log(GENERIC.map(moves, function(move) { return move.id}));
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

	var dir = ARIMAA.directions;
	var direction_translator = {
		"w": dir.west, "<": dir.west,
		"e:": dir.east, ">": dir.east,
		"n": dir.north, "^": dir.north,
		"s": dir.south, "v": dir.south
	}
	
	function convert_notated_step_to_coordinates(step) {
		// example: cd7e means silver cat from d7 (row: 6, col: 3) to east (row: 6, col: 4)
		var piece = step.slice(0, 1); // can be ignored
		var coordinate_from_col = column_translator[step.slice(1, 2)];
		var coordinate_from_row = parseInt(step.slice(2, 3));
		var coordinate_direction = direction_translator[step.slice(3, 4)];
	}
	
	return {
	  'convert_to_gametree': convert_to_gametree,
	  'convert_notated_step_to_coordinates': convert_notated_step_to_coordinates
	};
}();
