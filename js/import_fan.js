/** ast = abstract syntax tree */

function import_fan_ast(ast, gametree, domtree, comment_handler) {
	function p(value) { 
		//console.log(value); 
	}
	
	p(ast.value);

	var nodehandle = add_setup(gametree.get_initial_nodehandle(), ast.value.setup_gold);
	nodehandle = add_setup(nodehandle, ast.value.setup_silver);
	
	//TODO: setup variations
	
	add_normal_moves(nodehandle, ast.value.normal_body, true /* main line */);
	
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

	function add_normal_moves(nodehandle, positions, main_line) {
		GENERIC.for_each(positions, function(pos) {
			//debug_board();
		
			var position = pos.value;
			var move = create_normal_move(position.move_content.steps_with_info, position.turn_id);

			if(!!main_line) {
			  nodehandle.main_line = true; // main line positions have special attribute
			}
			
			nodehandle.comment = position.position_comment != undefined ? position.position_comment.comment : undefined;
			comment_handler.comment_node(nodehandle.comment, nodehandle.id);
			
			add_markings(position.markings, nodehandle);
			
			var result = gametree.make_move(move, nodehandle);
			
			// move comment must be after gametree.make_move
			add_move_comment(position.move_content.move_comment, nodehandle, 0 /* main line move */);
			add_variations(position.variations, nodehandle);
			nodehandle = result.nodehandle;
		});
	}	
	
	function add_move_comment(comment, nodehandle, index) {
		if(!comment || nodehandle.moves_from_node.length === 0) return;		
		nodehandle.moves_from_node[index].comment = comment.comment;
		comment_handler.comment_move(comment.comment, nodehandle.id, index);
	}
	
	function add_markings(markings, nodehandle) {
		GENERIC.for_each(markings, function(marking) {
			var mark = marking.value.marking;
			if(mark.slice(0, 1) === "x") {
				var col = mark.slice(1, 2).toString();
				col = GENERIC.charToInt(col) - GENERIC.charToInt('a');
				var row = parseInt(mark.slice(2, 3));
				var value = mark.split("=")[1].toString();
				gametree.toggle_marking(nodehandle.id, {col: col, row: row}, value);
			}
		});
	}
	
	function add_variations(variations, nodehandle) {		
		if(variations.length === 0) return;
		
		var move_index = 1; // variations start at 1

		GENERIC.for_each(variations, function(variat) {
			var variation = variat.value;
			var move = create_normal_move(variation.move.move_content.steps_with_info, variation.move.turn_id);
			var result = gametree.make_move(move, nodehandle);

			add_move_comment(variation.move.move_content.move_comment, nodehandle, move_index);
			
			add_normal_moves(result.nodehandle, variation.body, false /* not mainline move */);			

			++move_index;
		});
		
	}
	
	function add_setup(nodehandle, setup) {
		var move = create_setup_move(setup.setup_steps, setup.turn_id);

		nodehandle.main_line = true; // main line positions have special attribute
		var result = gametree.make_move(move, nodehandle);
		return result.nodehandle;
	}

	function create_normal_move(steps, turn_id) {
		var move = {
			id: turn_id.turn_id,
			steps: []
		}
		
		GENERIC.for_each(steps, function(step) {
			var normal_step = create_normal_step(step.value.step.step);
			if(!!normal_step) {	move.steps.push(normal_step); }
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
		if(step.type === 'removal') { return false; }
		else return {
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
