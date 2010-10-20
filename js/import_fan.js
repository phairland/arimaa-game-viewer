/** ast = abstract syntax tree */

function import_fan_ast(ast, gametree, domtree) {
	function p(value) { console.log(value); }
	
	var cur_nodehandle = gametree.get_initial_nodehandle();
	
	p(ast.value);

	add_setup(ast.value.setup_gold);
	add_setup(ast.value.setup_silver);
	
	//TODO: setup variations
	
	add_normal_moves(ast.value.normal_body);
	
	function debug_board() {
		var board = cur_nodehandle.board;
		console.log("....................................");
		for(var j = 0; j < ARIMAA.board_height; ++j) {
			var row = "";
			for(var i = 0; i < ARIMAA.board_width; ++i) {
				row += (board[j][i].type || "_" ).slice(0, 1) + " ";
			}
			console.log(row);
		}
		console.log("________________");
	}

	function add_normal_moves(positions) {
		GENERIC.for_each(positions, function(pos) {
			//debug_board();
		
			var position = pos.value;
			var move = create_normal_move(position.move_content.steps_with_info, position.turn_id);

			cur_nodehandle.main_line = true; // main line positions have special attribute
			cur_nodehandle.comment = position.position_comment != undefined ? position.position_comment.comment : undefined;
			add_markings(position.markings, cur_nodehandle);
			var result = gametree.make_move(move, cur_nodehandle);
			add_variations(position);
			cur_nodehandle = result.nodehandle;
		});
	}	
	
	function add_markings(markings, nodehandle) {
		GENERIC.for_each(markings, function(marking) {
			var mark = marking.value.marking;
			if(mark.slice(0, 1) === "x") {
				var col = mark.slice(1, 2).toString();
				col = GENERIC.charToInt(col) - GENERIC.charToInt('a');
				var row = ARIMAA.board_height - parseInt(mark.slice(2, 3));
				var value = mark.split("=")[1].toString();
				gametree.toggle_marking(nodehandle.id, {col: col, row: row}, value);
			}
		});
	}
	
	function add_variations(position) {
		console.log("pos", position);
	}
	
	function add_setup(setup) {
		var move = create_setup_move(setup.setup_steps, setup.turn_id);

		cur_nodehandle.main_line = true; // main line positions have special attribute
		var result = gametree.make_move(move, cur_nodehandle);
		cur_nodehandle = result.nodehandle;
	}

	function create_normal_move(steps, turn_id) {
		var move = {
			id: turn_id.turn_id,
			steps: []
		}
		
		GENERIC.for_each(steps, function(step) {
			move.steps.push(create_normal_step(step.value.step.step));
		});

		return move;		
	}
	
	function create_setup_move(steps, turn_id) {
		var move = {
			id: turn_id.turn_id,
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
			'to': step.to,
			'notated': step.notated
		}
	}
	
	function create_setup_step(step) {
		var step = {
			'type': 'setting',
			'piece': TRANSLATOR.get_piece(step.piece_id),
			'to': create_coordinate(step.row, step.col)
		}
		
		step.notated = TRANSLATOR.get_step_as_notated(step);
		
		return step;
	}
}
