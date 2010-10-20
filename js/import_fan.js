/** ast = abstract syntax tree */

function import_fan_ast(ast, gametree, domtree) {
	function p(value) { console.log(value); }
	
	var cur_nodehandle = gametree.get_initial_nodehandle();
	
	p(ast.value);

	add_setup(ast.value.setup_gold);
	add_setup(ast.value.setup_silver);		
	
	function add_setup(setup) {
		p(setup);

		var move = create_move(setup.setup_steps);
		console.log("move", move);

		cur_nodehandle.main_line = true; // main line positions have special attribute
		var result = gametree.make_move(move, cur_nodehandle);
		cur_nodehandle = result.nodehandle;
	}
	
	function create_move(steps) {
		var move = {}
		move.steps = [];
		
		GENERIC.for_each(steps, function(step) {
			move.steps.push(create_setup_step(step.value));
		});

		return move;		
	}

	function create_coordinate(row, col) {
		return { 'row': row, 'col': col }
	}
	
	function create_setup_step(step) {
		return {
			'type': 'setting',
			'piece': TRANSLATOR.get_piece(step.piece_id),
			'to': create_coordinate(step.row, step.col)
		}
	}
}
