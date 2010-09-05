var GAMETREE = GAMETREE || function() {
	
	var moves = [];
	var current_movehandle = [];
	
	function make_move(move) {
		moves.push(move);
		return {
		  'id': moves.length
		}
	}
	
	function next_move() {
	}
	
	function previous_move() {
	}
	
	function select_move(movehandle) {
	}
	
	function get_movehandles() {
		return [
			{'id': "1a"}
		];
	}
	
  return {
    'make_move': make_move,
    'next_move': next_move,
    'previous_move': previous_move,
    'select_move': select_move,
    'get_movehandles': get_movehandles
  }
}();
