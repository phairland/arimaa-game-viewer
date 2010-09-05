function create_import_game(moves) {
	var currentmove = 0;
	var currentstep = 0;
	
	function get_next_step() {
		if(currentmove >= moves.length || currentstep >= moves[currentmove].steps.length) {
			return false;
		} else {
			var nextstep = moves[currentmove].steps[currentstep];

			currentstep++;
			
			if(currentstep >= moves[currentmove].steps.length) {
				currentstep = 0;
				currentmove++;
			}
			
			console.log(nextstep);
			
			var step = TRANSLATOR.convert_notated_step_to_coordinates(nextstep);
			
			console.log(step);
			
			return step;
		}
	}
	
	function get_steps_in_next_move() {
		return [];
	}
	
	return {
		'get_next_step': get_next_step,
		'get_steps_in_next_move': get_steps_in_next_move
	}
}
