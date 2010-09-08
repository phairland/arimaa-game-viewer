
var ARIMAA_MAIN = ARIMAA_MAIN || function() {
	var domtree;
	var gametree;
	var viewer;
	var current_move_index = 0;
	var current_domtree_node = undefined;
	
	var stepbuffer = [];
	
	var showing_slowly = false; // when moves are showed slowly, controls are locked
	
	var selected = undefined; // what square is selected currently

	function get_current_node() { return gametree.select_node(viewer.current_id()); }
	
	function opposite_turn(turn) { return turn === ARIMAA.gold ? ARIMAA.silver : ARIMAA.gold }
	function singleton_after_opposite(turn) {
		return opposite_turn(turn).side.slice(0, 1) + "singleton_after";
	}
	function singleton_before_opposite(turn) {
		return opposite_turn(turn).side.slice(0, 1) + "singleton_before";
	}
	
	function make_step_to_gametree(step) {
		// step = { 'from': selected, 'to': new_coordinate, 'piece': piece }
		stepbuffer.push(step);
	}	

	// where there's no move for current nodehandle, it's a "direct continuation" 
	function make_continuation_to_variation(current_nodehandle) {
		console.log("continuation");
		var variation_name = "-";
		
		var move = {
			'id': variation_name, 
			'steps': stepbuffer
		}
		
		var result = gametree.make_move(move, current_nodehandle);
		var nodehandle = result.nodehandle;
		var move_index = result.move_index;

		var id = nodehandle.id + "_0";
		
		// id and name for treenode
		var js = {
			'attr': {'id': id },
			'data': variation_name.toString()
		}

		// if first move in this line of play, put it as a sibling, otherwise it's a variation (of maybe a variation)
		//var where_to = "#" + current_gametree_id;
		var where_to = domtree.jstree('get_selected');
		
		
		var nodetype = nodehandle.gamestate.turn.side.slice(0, 1) + 'singleton_after';
		
		// create variation
		domtree.jstree("create", where_to, "after", js, false, true);
		domtree.jstree('set_type', nodetype, '#' + id);
			
		// if node that precedes was a singleton, it must be changed to normal
		var nodetype_preceding = 
			current_nodehandle.previous_nodehandle.gamestate.turn.side.slice(0, 1) + 'move_before';		
		domtree.jstree('set_type', nodetype_preceding, where_to);
		 
	}
	
	function make_move_to_gametree() {
		var current_nodehandle = gametree.select_node(viewer.current_id());

		// node where there's no moves yet
		if(current_nodehandle.moves_from_node.length === 0) {
			make_continuation_to_variation(current_nodehandle);
			return;
		}
		
		console.log("variation");
		
		// FIXME: something smarter for the name 
		var variation_name = (function(){
			if(current_nodehandle.moves_from_node.length > 0) {
				return current_nodehandle.moves_from_node[0].id + "&nbsp;<strong>[" + current_nodehandle.moves_from_node.length + "]</strong>";
			} else return current_nodehandle.id;
		})();

		var move = {
			'id': variation_name, 
			'steps': stepbuffer
		}
		
		stepbuffer = [];
		
		var result = gametree.make_move(move, current_nodehandle);
		var nodehandle = result.nodehandle;
		var move_index = result.move_index;

		var id = current_nodehandle.id + "_" + move_index;
		
		// id and name for treenode
		var js = {
			'attr': {'id': id, 'move_index': move_index.toString() },
			'data': variation_name.toString()
		}

		var id2 = nodehandle.id + "_0"; // no moves there yet

		var js2 = {
			'attr': {'id': id2 },
			'data': "-"
		}
		
		// if first move in this line of play, put it as a sibling, otherwise it's a variation (of maybe a variation)
		var node_position_in_tree = current_nodehandle.moves_from_node.length === 1 ? "last" : "inside";
		
		//var where_to = "#" + current_gametree_id;
		var where_to = domtree.jstree('get_selected');

		// this must be before creating the node, since deselecting trigger event that changes the singletontype
		//domtree.jstree('deselect_all');
		
		// create variation
		domtree.jstree("create", where_to, node_position_in_tree, js, false, true);
		var nodetype = nodehandle.gamestate.turn.side.slice(0, 1) + 'singleton_after';
		domtree.jstree('set_type', nodetype, '#' + id);
		
		current_domtree_node = $('#' + id);
		var treenodeid = '#' + id;
  	//domtree.jstree('select_node', treenodeid);

		//refresh_domtree();
		update_selected_nodehandle_view();

		// create after variation
		//$('.gametree').jstree("create", "#" + id /* after just created node */, "after", js2, false, true);
	}

	function bind_select_piece() {
		$('.square').live('click', function() {
			$(this).toggleClass('selected');
		});
	}

	function bind_select_piece() {
		$('.square').live('mouseover', function() {
			selected = coordinate_for_element($(this));
			show_arrows($(this));
		});
	}

	function coordinate_for_element(elem) {
		return {
			'row': row_index(elem),
			'col': col_index(elem)
		}		
	}
	
	function coordinates_from_arrow(arrow) {
		return {
			'row': parseInt(arrow.attr('row')),
			'col': parseInt(arrow.attr('col'))
		}
	}
	
	function bind_move_piece() {
		$('.arrow').click(function() {
			var new_coordinate = coordinates_from_arrow($(this));
			make_step_for_piece(selected, new_coordinate);
		});
	}
	
	// this is for making a new move
	function make_step_for_piece(selected, new_coordinate) {
		if(selected === undefined) return;

		var piece = board[selected.row][selected.col];
		var step = { 'from': selected, 'to': new_coordinate, 'piece': piece } 
		//FIXME: making move to gametree should be behind common interface with getting new board
		result = ARIMAA.move_piece(gamestate, board, selected, new_coordinate);
		
		make_step_to_gametree(step);
		// if turn changed, commit the steps into gametree as a move
		if(result.gamestate.turn !== gamestate.turn) make_move_to_gametree();
		
		board = result.board;
		gamestate = result.gamestate;
		show_board(board);
		clear_arrows();
	}

	// this is for showing already made moves
	function show_make_step_for_piece(selected, new_coordinate) {
		var piece = board[selected.row][selected.col];
		var move = { 'from': selected, 'to': new_coordinate, 'piece': piece } 
		//FIXME: making move to gametree should be behind common interface with getting new board
		result = ARIMAA.move_piece(gamestate, board, selected, new_coordinate);
		
		board = result.board;
		gamestate = result.gamestate;
		show_board(board);
		clear_arrows();
	}
	
	function clear_arrows() {	$('.arrow').hide();	}
	
	function show_arrows(elem) {
		$('.arrow').hide();
		
		var coordinate = {
		 'row': row_index(elem),
		 'col': col_index(elem)
		}
		
		selected = coordinate;
		
		var possible_moves = ARIMAA.legal_moves(viewer.gamestate(), viewer.board(), coordinate);

		//console.log(possible_moves);
		
		GENERIC.for_each(possible_moves, function(move) {
				var x_change = move.col - coordinate.col;
				var y_change = move.row - coordinate.row;
				var piece_center = {
					'x': elem.position().left + elem.width() / 2,
					'y': elem.position().top + elem.height() / 2
				}
				show_arrow_for_move(coordinate, piece_center, x_change, y_change);
		});
	}
	
	function get_arrow_elem(x_change, y_change) {
		return x_change < 0 ? "left" : x_change > 0 ? "right" : y_change < 0 ? "up" : "down"; 
	}
	
	function show_arrow_for_move(coordinate, piece_center, x_change, y_change) {
		var center_x = piece_center.x - $('.arrow').width() / 2;
    var center_y = piece_center.y - $('.arrow').height() / 2;

    var arrow_dir = get_arrow_elem(x_change, y_change);
    
    var arrow_elem = $('#arrow' + "_" + arrow_dir);
    
    arrow_elem
      .attr('row', coordinate.row + y_change)
      .attr('col', coordinate.col + x_change)
      .css('left', center_x + (x_change !== 0 ? x_change * arrow_elem.width() * 0.9 : 0))
      .css('top', center_y + (y_change !== 0 ? y_change * arrow_elem.height() * 0.9: 0))
      .show();
	}
		
	function row_index(elem) {
		return parseInt($('.row').index(elem.closest('.row')));
	}
	
	function col_index(elem) {
		var row = elem.closest('.row');
		var elems_in_row = row.find('.square');
		return parseInt(elems_in_row.index(elem));
	}

	function show_step(step) {
		if(step.type === 'setting') {
			result = ARIMAA.add_piece(step.piece, step.to, board, gamestate);
			board = result.board;
			gamestate = result.gamestate;
			show_board(board);
		} else if(step.type === 'removal') {
			throw "removal step should not be handled here, the game logic should take care of it";			
			// this can be skipped, since the effect is already done in previous step
			
			//board = ARIMAA.remove_piece(step.coordinate, board);
			//show_board(board);
			
		} else {
			show_make_step_for_piece(step.from, step.to);
		}
	}

	function show_steps_slowly(steps) {
		if(steps.length === 0) {
			var cur_node = gametree.next_nodeid(viewer.current_id(), current_move_index);
			viewer.gametree_goto(cur_node);
			current_move_index = 0; // FIXME: doesn't prolly work in general
			showing_slowly = false;

      update_selected_nodehandle_view();
			return;
		}

		show_step(steps[0]);
		setTimeout(function() {
				if(showing_slowly) show_steps_slowly(steps.slice(1)); 
			}, 300);				
	}
	
	function show_next_move_slowly() {
		var node = gametree.select_node(viewer.current_id());

		if(node.moves_from_node.length > 0) {
			var move_index = current_move_index;
			var steps = node.moves_from_node[move_index].steps;
			show_steps_slowly(steps);
		}
	}

	function show_next() {
		show_variation(current_move_index);
	}

	function show_variation(move_index) {
		var cur_node = gametree.select_node(viewer.current_id());
		if(move_index >= cur_node.moves_from_node.length) {
			return;
		}
		
		//GENERIC.log(gametree.select_node(current_gametree_id).moves_from_node[move_index]);
		
		var nextid = gametree.next_nodeid(viewer.current_id(), move_index);
		current_move_index = 0;
		
		if(!nextid) return;
		
		viewer.gametree_goto(nextid);
		show_board(viewer.board(), viewer.gamestate());
		
		// NOTE! current_gametree_id has been updated by gametree_goto
		var node_now = gametree.select_node(viewer.current_id());
		if(node_now.moves_from_node.length === 0) {
			var treenode_id = "#" + cur_node.id + "_" + move_index;
			
//			domtree.jstree('set_type', singleton_after_opposite(node_now.gamestate.turn), treenode_id);
			var prefix = node_now.gamestate.turn.side.slice(0, 1); 
			domtree.jstree('set_type', prefix + 'singleton_after', treenode_id);
			current_domtree_node = $(treenode_id);
			//refresh_domtree();			

			//domtree.jstree('select_node', treenode_id);
			update_selected_nodehandle_view();
			//current_move_index = move_index;
			//current_gametree_id = 			
		} else {
			current_domtree_node = $('#' + nextid + '_' + current_move_index);
			update_selected_nodehandle_view();
		}
	}

	function show_previous() {
		var move_index = current_move_index;
		var previd = gametree.previous_nodeid(viewer.current_id(), move_index);
		current_domtree_node = $('#' + previd + '_' + move_index);
		//var previd = gametree.previous_nodeid(current_gametree_id);
		if(!!previd) {
			viewer.gametree_goto(previd);
			show_board(viewer.board(), viewer.gamestate());
			update_selected_nodehandle_view();
		}		
	}

	function getKeyCode(event) { return event.keycode || event.which;	}
	function is_right_arrow_key(code) { return code === 39; }
	
	function bind_control_move() {
		$('.next').click(function() { show_next(); });
		$('.prev').click(function() { show_previous(); });
		
    $(window).keydown(function(event) {
      var code = getKeyCode(event);
      if(is_right_arrow_key(code)) {
      	showing_slowly = false;
      	show_next();
      }
      if(code === 37) {
      	showing_slowly = false;
      	show_previous();
      }

      //console.log(code);
      //if(code === 38) import_game(); // for debugging purposes quick importing
      
      if(code === 40) { // down key
      	if(showing_slowly) return;
				showing_slowly = true;
				show_next_move_slowly();
      }
      
      if(code >= 96 && code <= 105) {
      	show_variation(code - 96);
      }
    });
  }

  function update_selected_nodehandle_view() {

  	var nodeid = viewer.current_id() + "_" + current_move_index;
//  	var jqueryNode = $('#' + nodeid);
		var jqueryNode = current_domtree_node;

  	if(jqueryNode.length > 0) {
  	  console.log("updating");
  		var last_selected = domtree.jstree('get_selected');
  		domtree.jstree('deselect_node', last_selected);
			//domtree.jstree('deselect_all');
			domtree.jstree('select_node', jqueryNode); //FIXME: should work on variations too, 0 = main game line
			$('.scrollabletree').scrollTo(jqueryNode, {offset: -100});
		} else {
			console.log("node does not exist");
		}
  }

	function create_tree_and_viewer(domtree) {
  	gametree = create_gametree();
  	viewer = create_viewer(gametree, domtree);
	}
	
  function refresh_domtree() {
  	//return;
  	console.log("refreshing");
		domtree.jstree('refresh');
  }  
  
	function import_game() {
		var notated_game = $('#imported_game').val();
		
		// default
		if(notated_game === "") {	notated_game = example_game; }
		
		var structured_moves = TRANSLATOR.convert_to_gametree(notated_game);
		var moves = generate_moves(structured_moves);

  	create_tree_and_viewer(domtree);
		viewer.setBoard(empty_board());
		gametree.get_initial_nodehandle().id;

		build_move_tree(moves);

		show_board(viewer.board(), viewer.gamestate());
	}
	
	function build_move_tree(moves) {
  	var nodehandle = gametree.get_initial_nodehandle();

		//FIXME: can be recursive with variations
  	GENERIC.for_each(moves, function(move) {
			var result = gametree.make_move(move, nodehandle);
			var new_nodehandle = result.nodehandle;
  			
			nodehandle = new_nodehandle;
			//console.log(nodehandle.gamestate.steps);
		});

		build_dom_tree(gametree, domtree);
	}

	function bind_import_game() {
		$('#import_game').click(import_game);
	}
	
	$(function() {
		domtree = $('.gametree');

		create_tree_and_viewer(domtree);
				
		bind_import_game();

		bind_control_move();

		bind_select_piece();
		bind_move_piece();
		
		$('.arrownormal').mouseover(function() {
			$(this).hide();
			$(this).closest('.arrow').find('.arrowhover').show();		
		});
		
		$('.arrowhover').mouseout(function() {
			$(this).hide();
			$(this).closest('.arrow').find('.arrownormal').show();		
		});
		
		$('.show').click(function() {
				if(showing_slowly) return;
				showing_slowly = true;
				show_next_move_slowly();
		});
		
		$('.comments_for_node').focusout(function() {
				var comment = $(this).val();

				gametree.comment_node(comment, viewer.current_id());
		});		

		$('.gametree li a').live('click', function() {
			var elem = $(this).closest('li');
			current_domtree_node = elem;
			var id = get_nodehandle_id_from_tree_elem(elem);
			current_move_index = get_move_index_from_tree_elem(elem); 
			showing_slowly = false;
			viewer.gametree_goto(id);
			show_board(viewer.board(), viewer.gamestate());
			update_selected_nodehandle_view(); // should this be done here?
		});
		
	  import_game();		
	});
		
	
}();