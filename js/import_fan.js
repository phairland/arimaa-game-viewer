/** ast = abstract syntax tree */

function import_fan_ast(ast, gametree, domtree) {
	function p(value) { console.log(value); }
	
	var cur_nodehandle = gametree.get_initial_nodehandle();
	
	p(ast.value);

	add_setup(ast.value.setup_gold);
	add_setup(ast.value.setup_silver);
	
	//TODO: setup variations
	
	add_normal_moves(ast.value.normal_body);
	
	function add_normal_moves(positions) {
		console.log("positions", positions);
		GENERIC.for_each(positions, function(pos) {
			var position = pos.value;
			console.log(position);
			var move = create_normal_move(position.move_content.steps_with_info, position.turn_id);
		});
	}	
	
	function add_setup(setup) {
		var move = create_setup_move(setup.setup_steps, setup.turn_id);

		cur_nodehandle.main_line = true; // main line positions have special attribute
		var result = gametree.make_move(move, cur_nodehandle);
		cur_nodehandle = result.nodehandle;
	}

	function create_normal_move(steps, turn_id) {
		var move = {
			id: turn_id,
			steps: []
		}
		
		GENERIC.for_each(steps, function(step) {
			move.steps.push(create_normal_step(step.value));
		});

		return move;		
	}
	
	function create_setup_move(steps, turn_id) {
		var move = {
			id: turn_id,
			steps: []
		}
		
		GENERIC.for_each(steps, function(step) {
			move.steps.push(create_setup_step(step.value));
		});

		return move;		
	}

	function create_coordinate(row, col) {
		return { 'row': row, 'col': col }
	}

	function create_normal_step(step) {
		return {
			'type': 'normal',
			'from': step.from,
			'to': step.to
		}
	}
	
	function create_setup_step(step) {
		return {
			'type': 'setting',
			'piece': TRANSLATOR.get_piece(step.piece_id),
			'to': create_coordinate(step.row, step.col)
		}
	}
}
