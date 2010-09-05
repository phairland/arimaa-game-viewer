function create_gametree() {
	var first_id = 1;
	var ids = 0;
	var moves = [];
	var current_movehandle = [];

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
	
	function make_move(move, movehandler) {
		var gamestate_prev = !!movehandler ? movehandler.gamestate :  ARIMAA.get_initial_gamestate();
		var board_prev = !!movehandler ? movehandler.board : empty_board();

		//FIXME: making move to gametree should be behind common interface with getting new board
		var result = make_steps(gamestate_prev, board_prev, move.steps);
		
		var id = get_unique_id();

		var new_movehandler = {
		  'id': id,
		  'board': result.board,
		  'gamestate': result.gamestate,
		  'move': move // move that lead to this position
		}
		
		moves[id] = new_movehandler;
		return new_movehandler;
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
    'make_move': make_move,
    'next_moveid': next_moveid,
    'previous_moveid': previous_moveid,
    'select_move': select_move,
    'get_movehandles': get_movehandles
  }
}
