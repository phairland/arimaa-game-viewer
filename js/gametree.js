function create_gametree() {
	var ids = 0;
	var first_id = 1;
	var nodes = [];

	function get_unique_id() { ids++; return ids; }
	
	function make_steps(gamestate_prev, board_prev, steps) {
		var state = gamestate_prev;
		var board = board_prev;

		for(var i = 0; i < steps.length; ++i) {
			var step = steps[i];
			
			if(step.type === 'setting') {
				result = ARIMAA.add_piece(step.piece, step.to, board, state);
				state = result.gamestate;
				board = result.board;
			} else {
				var result = ARIMAA.move_piece(state, board, step.from, step.to);
				state = result.gamestate;
				board = result.board;
			}
		}
		
		return {
			'gamestate': state,
			'board': board
		}
	}
	
	var initial_nodehandle = (function() {
		var gamestate = ARIMAA.get_initial_gamestate();
		var board = empty_board();
		var id = get_unique_id();
		
		var initial_handle = {
			'id': id,
			'board': board,
			'gamestate': gamestate,
			'moves_from_node': [],
			'previous_nodehandle': undefined
		}
		
		nodes[id] = initial_handle;
		return initial_handle;
	})();
	
	function get_initial_nodehandle() { return initial_nodehandle; }
	
	// TODO: think whether it would be better to link with ids instead of object references
	function link_nodes(move, nodehandle_from, nodehandle_to) {
		move.nodehandle_after_move = nodehandle_to;
		nodehandle_from.moves_from_node.push(move);

		// is this necessary?
	  //nodehandle_to.move = move, // move that lead to this position
	}
	
	function make_move(move, nodehandle) {
		//console.log(move);
		//console.log(nodehandle.gamestate.steps);
		//var gamestate_prev = !!nodehandle ? nodehandle.gamestate : ARIMAA.get_initial_gamestate();
		//var board_prev = !!nodehandle ? nodehandle.board : empty_board();
		var gamestate_prev = nodehandle.gamestate;
		var board_prev = nodehandle.board;

		//FIXME: making move to gametree should be behind common interface with getting new board
		var result = make_steps(gamestate_prev, board_prev, move.steps);
		
		//console.log(result.gamestate.turn);
		
		var id = get_unique_id();
		
		var new_nodehandle = {
			'id': id,
		  'board': result.board,
		  'gamestate': result.gamestate,
		  'previous_nodehandle': nodehandle,
		  'moves_from_node': []
		}

		link_nodes(move, nodehandle, new_nodehandle);
		
		nodes[id] = new_nodehandle;
		
		return new_nodehandle;
	}
	
	function next_moveid(prev_node_id) {
		if(prev_node_id === undefined) return first_id;
		else if(prev_node_id >= ids) ids;
		else return prev_node_id + 1;
	}
	
	function previous_moveid(prev_node_id) {
		if(prev_node_id === undefined) return first_id;
		else if(prev_node_id <= first_id) first_id;
		else return prev_node_id - 1;
	}
	
	function previous_move() {
	}
	
	function select_move(id) {
		return nodes[id];
	}
	
	function get_nodehandles() {
		var result = [];
		
		for(var i = first_id; i <= ids; ++i) {
			result.push(nodes[i]);
		}
		
		return result;
	}
	
  return {
  	'get_initial_nodehandle': get_initial_nodehandle,
    'make_move': make_move,
    'next_moveid': next_moveid,
    'previous_moveid': previous_moveid,
    'select_move': select_move,
    'get_nodehandles': get_nodehandles
  }
}
