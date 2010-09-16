var TRANSLATOR = TRANSLATOR || function() {

	function convert_to_gametree(notated_game) {
		var tokens = notated_game.split(" ");
		var moves = divide_into_moves(tokens);
		//GENERIC.for_each(moves, function(move) { GENERIC.log(move.steps); });
		//GENERIC.log(GENERIC.map(moves, function(move) { return move.steps}));
		return moves;
	}
	
	function throw_unsupported(info) {
		throw "Unsupported notation: " + info;
	}
	
	function get_moveid(token) {
		function get_side_shorthand(side) {
			if(side === 'w' || side === 'g') return 'g';
			if(side === 'b' || side === 's') return 's';
			throw_unsupported("side: " + side);
		}
		
		if(token === undefined || token.length === 0) return false;
		var value = parseInt(token.slice(0, 1));
		if(!isNaN(value)) {
			var move_number = token.slice(0, token.length - 1); // all but last is part of move number
			var side = token.slice(token.length - 1); // last is side (g or s)
			return move_number + get_side_shorthand(side);
		} else return false;
	}
	
	var pass_step = "pass";

	function create_move(steps, moveid) {
		return {
			'steps': steps,
			'id': moveid
		}
	}
				
	
	function divide_into_moves(tokens) {
		var result = [];
		
		for(var i = 0; i < tokens.length; ++i) {
			
			var moveid = get_moveid(tokens[i]);
			
			if(!!moveid) {
				var steps = get_steps(tokens.slice(i+1));
				
				if(steps.length < ARIMAA.steps_in_move) {
					steps.push(pass_step);
					var move = create_move(steps, moveid);
					result.push(move);
				} else {
					result.push(create_move(steps, moveid));
				}
			}
		}
		
		return result;
	}
	
	function get_step_from_token(token) {
		return token !== undefined && token !== "" ? token : false; 
	}
	
	function get_steps(tokens) {
		var result = [];
		
		for(var i = 0; i < tokens.length; ++i) {
			if(!!get_moveid(tokens[i])) return result;
			else {
				var step = get_step_from_token(tokens[i]);
				if(!!step) {
				  result.push(step);
				}
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
	
	function is_resign_step(step) { return step === "resigns"; }
	function is_pass_step(step) { return step === "pass"; }
	
	function convert_notated_step_to_coordinates(step) {
		if(is_board_setting_step(step)) {
			return board_setting_step(step);
		} else if(piece_is_removed(step)) {
			return piece_removal_step(step);
		} else if(is_resign_step(step)) {
			return {
				'type': 'resign'
			}
		} else if(is_pass_step(step)) {
			return {
				'type': 'pass'
			}
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
	
	
	/** Position markings to FAN */
	function get_markings(node, gametree) {
		var marking_symbol = "@";
		
		function coordinate_encoded(marking) {
			var coordinate_symbol = "x";
			return 	coordinate_symbol + 
							String.fromCharCode(parseInt(marking.col)+97) + // column 0 = 'a' 
							marking.row + "=" + marking.marking;			
		}
		
		var markings = gametree.get_markings(node.id);
		var result = GENERIC.reduce("", markings, function(acc, marking) {
				return acc + " " + marking_symbol + coordinate_encoded(marking); 
		});
		
		return $.trim(result);
	}
	
	/**
	  Move (and position if node !== undefined) to FAN.
	*/
	function move_as_notated(move, gametree, node) {
		function get_comment(object) {
			if(!!object && !!object.comment) {
				function withoutHyphen(value) { return value.replace("\"", ""); }
				return "\"" + withoutHyphen(object.comment) + "\"";
			} else return "";
		}
		var markings = [];
		var comment = [];
		
		var prefix = move.id + " " + get_comment(node);
		if(!!node) {
			prefix += get_markings(node, gametree);
		}
		
		var steps_content = GENERIC.reduce("", move.steps, function(result, step) {
				return result + (step.notated !== undefined ? " " + step.notated : "");
		});
		
		var postfix = get_comment(move); 
		
		return $.trim(prefix + " " + steps_content + " " + postfix);
	}
	
	/**
	  Traverses the gametree recursively, outer iteration is over main moves,
	  the inner one goes over variations, adding variations from whole subtree
	  before adding variant info at the same level.
	  
	  FIXME: if big tree, could blow up the stack since not tail-recursive
	  (and javascript doesn't support tail call elimination AFAIK)
	*/
	function convert_from_gametree(gametree) {
		function convert_from_node(node) {
			if(node === undefined) return "";

			var branches = node.moves_from_node.length;
			if(branches === 0) return "";

			var result = "";

			var main_line_move = node.moves_from_node[0];
			result += move_as_notated(main_line_move, gametree, node);
			
			for(var i = 1; i < node.moves_from_node.length; ++i) {
				var move = node.moves_from_node[i];
				
				result += " [ " + move_as_notated(move);
				
			  result += convert_from_node(move.nodehandle_after_move) + " ] ";										
			}
			
		  result += " " + convert_from_node(main_line_move.nodehandle_after_move);	
				
			return result;
		}

		var first = gametree.get_initial_nodehandle();
		return convert_from_node(first).replace("  ", " ");
	}
	
	function read_position(tokens) {
		//var turn_id = read_turn_id(
	}
	
	function read_body(tokens) {
		var rest = tokens;
		
		while(true) {
			var result = read_position(rest);
			var position = result.position;
			rest = result.result;
		}
	}
	
	/**
	  Converts textual FAN to objects that have gametree-like structure
	*/
	function convert_from_FAN_to_gametree(text) {
		var tokens = notated_game.split(" ");
 
		//FIXME: header
		var body = read_body(tokens);
	}
	
	return {
		'convert_from_gametree': convert_from_gametree,
	  'convert_to_gametree': convert_to_gametree,
	  'convert_notated_step_to_coordinates': convert_notated_step_to_coordinates
	};
}();
