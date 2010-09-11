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

		// since in one move there can be strictly either setting or normal moves,
		// we can infer that if the ARIMAA.steps_in_move amount of steps isn't made, the last one is a pass
	  if(steps.length === 0 || steps[0].type !== 'setting') {
	  	if(steps.length < ARIMAA.steps_in_move) {
	  		result = ARIMAA.pass(state, board);
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
			'comment': ''
		}
		
		nodes[id] = initial_handle;
		return initial_handle;
	})();
	
	function get_initial_nodehandle() { return initial_nodehandle; }
	
	// TODO: think whether it would be better to link with ids instead of object references
	// return move index in nodehandle_from
	function link_nodes(move, nodehandle_from, nodehandle_to) {
		move.nodehandle_after_move = nodehandle_to;
		nodehandle_from.moves_from_node.push(move);
	  nodehandle_to.move_index_from_previous = nodehandle_from.moves_from_node.length - 1; 
	  nodehandle_to.previous_nodehandle = nodehandle_from;
		return nodehandle_from.moves_from_node.length - 1;
	}
	
	function make_move(move, nodehandle) {
		var gamestate_prev = nodehandle.gamestate;
		var board_prev = nodehandle.board;

		var result = make_steps(gamestate_prev, board_prev, move.steps);
		
		var id = get_unique_id();
		
		var new_nodehandle = {
			'id': id,
		  'board': result.board,
		  'gamestate': result.gamestate,
		  'moves_from_node': [],
		  'comment': ''
		}

		var move_index = link_nodes(move, nodehandle, new_nodehandle);
		
		nodes[id] = new_nodehandle;
		
		return {
			'nodehandle': new_nodehandle,
			'move_index': move_index
		}
	}
	
	function next_nodeid(prev_node_id, move_index) {
		if(prev_node_id === undefined) throw "undefined prev_node_id";
		else if(prev_node_id > ids) throw "prev_node is too big: " + prev_node;
		var node = select_node(prev_node_id);
		if(node === undefined) throw "node is undefined";
		
		var prev_node_moves = select_node(prev_node_id).moves_from_node;
		
		if(prev_node_moves === undefined) {
			console.log(prev_node_moves);
			throw "prev_node_moves is undefined";
		}
		
		var move = prev_node_moves[move_index !== undefined ? move_index : 0]
		
		GENERIC.log("prev_nodes_move", move);
		return move.nodehandle_after_move !== undefined ?
					 move.nodehandle_after_move.id : prev_node_id; 
//	else return prev_node_id + 1; //FIXME: this is ugly hack
	}
	
	function previous_nodeid(prev_node_id) {
		if(prev_node_id === undefined) return first_id;
		else if(prev_node_id <= first_id) first_id;
		else return	select_node(prev_node_id).previous_nodehandle.id;
//			
		//else return prev_node_id - 1;
	}
	
	function previous_move() {
	}
	
	function select_node(id) {
		return nodes[id];
	}
	
	function get_nodehandles() {
		var result = [];
		
		for(var i = first_id; i <= ids; ++i) {
			result.push(nodes[i]);
		}
		
		return result;
	}
	
	function comment_node(text, id) {
		select_node(id).comment = text;
	}
	
	function toggle_marking(nodeid, coordinate, marker){
		
		var node = select_node(nodeid);
		if(node.markings === undefined) {
			node.markings = {};
		}
		
		var old = node.markings[coordinate.row];
		
		if(old === undefined) node.markings[coordinate.row] = {}
		old = node.markings[coordinate.row][coordinate.col];
		
		if(old === undefined) {
			node.markings[coordinate.row][coordinate.col] = []
			old = node.markings[coordinate.row][coordinate.col];
		}
		
	  var index =	old.indexOf(marker);
	  if(index === -1) {
	  	old.push(marker);
	  	console.log(old);
	  	
	  } else {
	  	old.splice(index, index+1);
	  }
	}
	
	function get_markings(id) {
		var node = select_node(id);
		if(node.markings === undefined) return [];
		
		var result = [];

		//FIXME: quite horrible
		for(var row = 0; row < 8; ++row) {
			var r = node.markings[row];
			if(r === undefined) continue;
			
			for(var col = 0; col < 8; ++col) {
				 if(r[col] !== undefined) {
				 	var all = r[col];
				 	for(var i = 0; i < all.length; ++i) {
						result.push({
							'col': parseInt(col),
							'row': parseInt(row),
							'marking': all[i]
						});
					}
				}
			}
		}
    
    return result;
	}
	
	function clear_markings(id) {
		var node = select_node(id);
		node.markings = undefined;
	}
	
  return {
  	'get_initial_nodehandle': get_initial_nodehandle,
    'make_move': make_move,
    'next_nodeid': next_nodeid,
    'previous_nodeid': previous_nodeid,
    'select_node': select_node,
    'get_nodehandles': get_nodehandles,
    'comment_node': comment_node,
    'toggle_marking': toggle_marking,
 		'get_markings': get_markings,
 		'clear_markings': clear_markings
  }
}
