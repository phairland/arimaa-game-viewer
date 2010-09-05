function create_gametree() {
	var ids = 0;
	var first_id = 1;
	var moves = [];

	function get_unique_id() { ids++; return ids; }
	
	function make_steps(gamestate_prev, board_prev, steps) {
		var state = gamestate_prev;
		var board = board_prev;

		
		for(var i = 0; i < steps.length; ++i) {
			var step = steps[i];
			
			if(step.type === 'setting') {
				board = ARIMAA.add_piece(step.piece, step.to, board);
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
	
	function get_initial_movehandle() {
		var gamestate = ARIMAA.get_initial_gamestate();
		var board = empty_board();
		var id = first_id;
		
		var initial_handle = {
			'id': id,
			'board': board,
			'gamestate': gamestate,
			'move': undefined,
			'previous_movehandle': undefined
		}
		
		moves[id] = initial_handle;
		return initial_handle;
	}
	
	function make_move(move, movehandle) {
		var gamestate_prev = !!movehandle ? movehandle.gamestate : ARIMAA.get_initial_gamestate();
		var board_prev = !!movehandle ? movehandle.board : empty_board();

		//FIXME: making move to gametree should be behind common interface with getting new board
		var result = make_steps(gamestate_prev, board_prev, move.steps);
		
		var id = get_unique_id();
		
		var new_movehandle = {
			'id': id,
		  'board': result.board,
		  'gamestate': result.gamestate,
		  'move': move, // move that lead to this position
		  'previous_movehandle': movehandle
		}
		
		moves[id] = new_movehandle;
		return new_movehandle;
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
		return moves[id];
	}
	
	function get_movehandles() {
		return [];
	}
	
  return {
  	'get_initial_movehandle': get_initial_movehandle,
    'make_move': make_move,
    'next_moveid': next_moveid,
    'previous_moveid': previous_moveid,
    'select_move': select_move,
    'get_movehandles': get_movehandles
  }
}
