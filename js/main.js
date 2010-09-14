
var ARIMAA_MAIN = ARIMAA_MAIN || function() {
	var all_markers = GENERIC.map(["A", "B", "C"], function(elem) { return "marker_" + elem; })
	
	var marker = "";
	var show_step_delay = 400; // milliseconds between steps
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
		return opposite_turn(turn).side.slice(0, 1) + "singletonafter";
	}
	function singleton_before_opposite(turn) {
		return opposite_turn(turn).side.slice(0, 1) + "singletonbefore";
	}
	
	function make_step_to_gametree(step) {
		GENERIC.log("pushing to stepbuffer");
		// step = { 'from': selected, 'to': new_coordinate, 'piece': piece }
		stepbuffer.push(step);
	}	

	// where there's no move for current nodehandle, it's a "direct continuation" 
	function make_continuation_to_variation(current_nodehandle) {
		GENERIC.log("continuation");
		
		var variation_name = current_nodehandle.gamestate.turn.side.slice(0, 1) + "...";
		
		var move = {
			'id': variation_name, 
			'steps': stepbuffer
		}

		stepbuffer = [];
		
		var result = gametree.make_move(move, current_nodehandle);
		var nodehandle = result.nodehandle;
		var move_index = result.move_index;

		var id = current_nodehandle.id + "_0";
		
		// id and name for treenode
		var js = {
			'attr': {'id': id, 'after': nodehandle.id },
			'data': variation_name.toString()
		}

		// if first move in this line of play, put it as a sibling, otherwise it's a variation (of maybe a variation)
		//var where_to = "#" + current_gametree_id;

		//		var where_to = domtree.jstree('get_selected');
		//FIXME: THIS COULD BE TOTALLY WRONG?!
		//var where_to = domtree.find("li[after='" + current_nodehandle.id + "']"); // FIXME: ugly, shouldn't depend on dom nodes
		var where_to = $('#' + current_nodehandle.previous_nodehandle.id + "_" + current_nodehandle.move_index_from_previous); //FIXME ugly
		//var where_to = '#' + current_nodehandle.id + "_" + current_move_index ; // the "parent" node
		GENERIC.log("where_to", where_to);		
		
		var nodetype = current_nodehandle.gamestate.turn.side.slice(0, 1) + 'singletonafter';
		
		// create variation
		domtree.jstree("create", where_to, "after", js, false, true);
		domtree.jstree('set_type', nodetype, '#' + id);
			
		// if node that precedes was a singleton, it must be changed to normal
		var nodetype_preceding = 
			current_nodehandle.previous_nodehandle.gamestate.turn.side.slice(0, 1) + 'movebefore';

			var preceding_type = where_to.attr('rel');			
			if(preceding_type.indexOf("singleton") >= 0) {
				GENERIC.log("preceding IS singleton");
		    domtree.jstree('set_type', nodetype_preceding, where_to);
		  } else GENERIC.log("preceding not singleton");

 		current_move_index = move_index;
		current_domtree_node = $('#' + id);
		viewer.gametree_goto(nodehandle.id);
		update_selected_nodehandle_view();
	}
	
	function make_move_to_gametree() {
		var current_nodehandle = get_current_node();
		GENERIC.log("current_nodehandle", current_nodehandle);

		// node where there's no moves yet
		if(current_nodehandle.moves_from_node.length === 0) {
			make_continuation_to_variation(current_nodehandle);
			return;
		}
		
		GENERIC.log("variation");
		
		// FIXME: something smarter for the name 
		var variation_name =
			current_nodehandle.moves_from_node[0].id +
				"&nbsp;<strong>[" + current_nodehandle.moves_from_node.length + "]</strong>";

		var move = {
			'id': variation_name, 
			'steps': stepbuffer
		}
		
		stepbuffer = [];
		
		var result = gametree.make_move(move, current_nodehandle);
		var nodehandle = result.nodehandle;
		var move_index = result.move_index;

		var id = current_nodehandle.id + "_" + move_index;
		GENERIC.log("id", id);
		
		// id and name for treenode
		var js = {
			'attr': {'id': id, 'move_index': move_index.toString(), 'after': nodehandle.id },
			'data': variation_name.toString()
		}

		// if first move in this line of play, put it as a sibling, otherwise it's a variation (of maybe a variation)
		var node_position_in_tree = current_nodehandle.moves_from_node.length === 1 ? "last" : "inside";
		GENERIC.log(node_position_in_tree);
		
		//var where_to = "#" + current_gametree_id;
		//var where_to = domtree.jstree('get_selected');
		var where_to = '#' + current_nodehandle.id + "_0"; // the "parent" node
		GENERIC.log("whereto", where_to);
		
		// this must be before creating the node, since deselecting trigger event that changes the singletontype
		//domtree.jstree('deselect_all');
		
		// create variation
		domtree.jstree("create", where_to, node_position_in_tree, js, false, true);
		var nodetype = nodehandle.gamestate.turn.side.slice(0, 1) + 'singletonafter';
		domtree.jstree('set_type', nodetype, '#' + id);
		
		current_domtree_node = $('#' + id);
		//var treenodeid = '#' + id;
  	//domtree.jstree('select_node', treenodeid);

  	viewer.gametree_goto(nodehandle.id);
		//refresh_domtree();
		update_selected_nodehandle_view();
	}

	function clear_markers_from_node() {
		gametree.clear_markings(viewer.current_id());
	}
	
	function clear_markers_from_dom_board() {
		var squares = $('.square');
		GENERIC.for_each(all_markers, function(marker) {
			squares.removeClass(marker);
		});
	}

	function show_markers() {
		// it's possible that new board hasn't been constructed (for a reason)
		// so old markers must be wiped out
		clear_markers_from_dom_board();
		
		var markings = gametree.get_markings(viewer.current_id());
		GENERIC.log(markings);
		GENERIC.for_each(markings, function(marking) {
			GENERIC.log("markings");
			GENERIC.log(marking.row, marking.col, marking.marking);
			$('.row').eq(marking.row).find('.square').eq(marking.col).addClass("marker_" + marking.marking);
		});
	}
	
	function toggle_marker(elem) {
		GENERIC.log("toggle");
		if(marker === "") return;
		
		var clazz = 'marker_' + marker;
		var coordinate = coordinate_for_element(elem);
		gametree.toggle_marking(viewer.current_id(), coordinate, marker);
		GENERIC.log("toggle");
		elem.toggleClass(clazz);
	}


	function hover_marker(elem) {
		if(marker === undefined) return;

		var clazz = 'hovermarker_' + marker;
		elem.addClass(clazz);
	}

	function unhover_marker(elem) {
		if(marker === undefined) return;

		var clazz = 'hovermarker_' + marker;
		elem.removeClass(clazz);
	}
	
	function show_pass_if_legal() {
		if(showing_slowly) return false;
		if(ARIMAA.is_passing_legal(viewer.gamestate(), viewer.board())) {
			$('.pass').removeAttr('disabled');
		} else {
			$('.pass').attr('disabled', 'disabled');
		}
	}
	
	function bind_select_piece() {
		$('.square').live('mouseenter', function() {
			if(showing_slowly) return;
			if(marker !== "") {
				hover_marker($(this));
				return;
			}
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
		GENERIC.log("making step");
		if(selected === undefined) return;
		GENERIC.log(selected, new_coordinate);

		var piece = viewer.board()[selected.row][selected.col];
		var step = { 'from': selected, 'to': new_coordinate, 'piece': piece } 
		//FIXME: making move to gametree should be behind common interface with getting new board
		result = ARIMAA.move_piece(viewer.gamestate(), viewer.board(), selected, new_coordinate);
		
		make_step_to_gametree(step);
		// if turn changed, commit the steps into gametree as a move
		if(result.gamestate.turn !== viewer.gamestate().turn) {
			GENERIC.log("make move to gametree");
			make_move_to_gametree();
		} else {
			GENERIC.log("not gametree move");
		}
		
		/*
		board = result.board;
		gamestate = result.gamestate;
		*/
		viewer.setBoard(result.board);
		viewer.setGamestate(result.gamestate);
		show_board();
		clear_arrows();
	}

	// this is for showing already made moves
	function show_make_step_for_piece(selected, new_coordinate) {
		// if this function is called with not showing_slowly, the moving slowly has been interrupted
		if(!showing_slowly) return;

		//FIXME: making move to gametree should be behind common interface with getting new board
		// í.e. this should be done to a gametree
		result = ARIMAA.move_piece(viewer.gamestate(), viewer.board(), selected, new_coordinate);
		
		viewer.setBoard(result.board);
		viewer.setGamestate(result.gamestate);

		var piece = viewer.board()[selected.row][selected.col];
		var move = { 'from': selected, 'to': new_coordinate, 'piece': piece }

		/*
		board = result.board;
		gamestate = result.gamestate;
		*/
		
		/****
		 Animation for step
		 FIXME: create seperate function
		 anyways this is a bit dirty way to animate
		 though eventually the current dom based thing might change to use of absolute positions and maybe canvas
		***/
		
		var pieceElem = $('.row').eq(selected.row).find('.square').eq(selected.col).find('img');
		var toElem = $('.row').eq(new_coordinate.row).find('.square').eq(new_coordinate.col).find('img');

		var x_change = (new_coordinate.col - selected.col) * pieceElem.width();
		var y_change = (new_coordinate.row - selected.row) * pieceElem.height();

		if(!pieceElem.offset()) {
			after_animation();
			return;
		}

		var x = pieceElem.offset().left + x_change;
		var y = pieceElem.offset().top + y_change;

		var clone = pieceElem.clone().hide();
		
		clone
			.css('position', 'absolute')
			.css('left', pieceElem.offset().left)
			.css('top', pieceElem.offset().top)
			.css('width', pieceElem.width())

		pieceElem.hide();
		clone.show();
			
		function after_animation() {
			// if this function is called with not showing_slowly, the moving slowly has been interrupted
			if(!clone || !showing_slowly) return;
			
			clone.remove();
			
		  show_board();
		  clear_arrows();
		}
		
		$('.board').append(clone);
			clone.animate({
				'left': '+='+x_change,
				'top': '+='+y_change
		}, show_step_delay - 50, after_animation);
	}
	
	function clear_arrows() {	$('.arrow').hide();	}
	
	function moves_from(node) { return node.moves_from_node.length; }

	// whether new move can be made:
  // either singleton or only followup is singleton
 function can_make_move() {
 	 return true; //FIXME
		var cur_node = get_current_node();
		
		if(moves_from(cur_node) === 0) return true; // singleton
		
 		var followup = gametree.select_node(gametree.next_nodeid(viewer.current_id(), current_move_index));
		var follow_ups_moves = moves_from(followup);
		
		return follow_ups_moves !== 0; 
	}
	
	function show_arrows(elem) {
		// this prevent's making same board to appear in different level in the tree
		// i.e. variation A can have variation B and C but variation A that has variation B cannot have C
		// only if B has a continuation, then it can be varied in subtrees
		if(!can_make_move()) return;
		
		$('.arrow').hide();
		
		var coordinate = {
		 'row': row_index(elem),
		 'col': col_index(elem)
		}
		
		selected = coordinate;
		
		var possible_moves = ARIMAA.legal_moves(viewer.gamestate(), viewer.board(), coordinate);

		//GENERIC.log(possible_moves);
		
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
		// if this function is called with not showing_slowly, the moving slowly has been interrupted
		if(!showing_slowly) return;
		
		if(step.type === 'setting') {
			var result = ARIMAA.add_piece(step.piece, step.to, viewer.board(), viewer.gamestate());
			viewer.setBoard(result.board);
			viewer.setGamestate(result.gamestate);
			show_board();
		} else if (step.type === 'pass') {
			var result = ARIMAA.pass(viewer.board(), viewer.gamestate());
			viewer.setBoard(result.board);
			viewer.setGamestate(result.gamestate);
		  show_board();
		  clear_arrows();
		} else if(step.type === 'removal') {
			throw "removal step should not be handled here, the game logic should take care of it";			
			// this can be skipped, since the effect is already done in previous step
			
			//board = ARIMAA.remove_piece(step.coordinate, board);
			//show_board(board);
		} else {
			show_make_step_for_piece(step.from, step.to);
		}
	}

	function show_steps_slowly(steps, nodeid, move_index) {
		// if this function is called with not showing_slowly, the moving slowly has been interrupted
		if(!showing_slowly) return;
		
		GENERIC.log("show_steps_slowly");
		GENERIC.log(nodeid);
		GENERIC.log(move_index);
		if(steps.length === 0) {

			var cur_node = gametree.next_nodeid(nodeid, move_index);
			
			var node = gametree.select_node(cur_node);
			
			GENERIC.log("cur_node", cur_node);
			GENERIC.log("node", node);
			
			var moves_from_current = node.moves_from_node;
			GENERIC.log(moves_from_current);
			GENERIC.log(moves_from_current.length);

			current_move_index = move_index;
			
			if(moves_from_current.length === 0) {
				/*
				var treenode_id = "#" + cur_node.id + "_" + move_index;
				
	//			domtree.jstree('set_type', singleton_after_opposite(node_now.gamestate.turn), treenode_id);
				var prefix = node_now.gamestate.turn.side.slice(0, 1); 
				domtree.jstree('set_type', prefix + 'singleton_after', treenode_id);
				//refresh_domtree();			
	
				//domtree.jstree('select_node', treenode_id);
				*/
				GENERIC.log("zeroooooooo");

				//var node_this = 
				var elem = $('#' + nodeid + "_" + move_index);
				GENERIC.log(elem);
				current_domtree_node = elem;

				if(elem.attr('rel').indexOf("singletonbefore") >= 0) {
					var prefix = node.gamestate.turn.side.slice(0, 1); 
					domtree.jstree('set_type', prefix + 'singletonafter', elem);
				}
				
				showing_slowly = false;
				viewer.gametree_goto(cur_node);
				update_selected_nodehandle_view();
				return;
			}	else if(moves_from_current.length === 1) { // this is singleton 'before' position

				var followups_moves = moves_from_current[0].nodehandle_after_move.moves_from_node;
				GENERIC.log("follow", followups_moves);
				GENERIC.log(followups_moves);
				
				if(followups_moves.length === 0) {
					GENERIC.log("yoyoyoy");

					var elem = $('#' + gametree.next_nodeid(nodeid, move_index) + "_0");
					GENERIC.log(elem);
					current_domtree_node = elem;
					current_move_index = 0;

					/*
					//current_move_index = 0; // FIXME: is this ok?
					var elem = $('#' + cur_node + "_0");
					current_domtree_node = $('#' + cur_node + "_0");
					*/
					
					if(elem.attr('rel').indexOf("singletonafter") >= 0) {
						var prefix = node.gamestate.turn.side.slice(0, 1); 
						domtree.jstree('set_type', prefix + 'singletonbefore', elem);
					}
					
					showing_slowly = false;
					viewer.gametree_goto(cur_node);
					update_selected_nodehandle_view();
					return;
				}
			}
			

// just added end of			
			GENERIC.log("defaultiiiiiii");
			
			viewer.gametree_goto(cur_node);
			current_move_index = 0; // FIXME: how about variation of variation?
			current_domtree_node = $('#' + cur_node + "_0");
			
			showing_slowly = false;

      update_selected_nodehandle_view();
			return;
		}

		show_step(steps[0]);
		setTimeout(function() {
				if(showing_slowly) show_steps_slowly(steps.slice(1), nodeid, move_index); 
			}, show_step_delay);				
	}
	
	function show_next_move_slowly() {
		show_move_slowly(viewer.current_id(), current_move_index);
		/*
		undo_all_steps();
		var node = get_current_node();

		if(node.moves_from_node.length > 0) {
			var move_index = current_move_index;
			var steps = node.moves_from_node[move_index].steps;
			showing_slowly = true;
			show_steps_slowly(steps);
		}
		*/
	}

	function show_move_slowly(nodeid, move_index) {
		if(showing_slowly) return;
		showing_slowly = true;
		
		var node = gametree.select_node(nodeid);
		GENERIC.log(" ");
		GENERIC.log("------------------------------------------");
		GENERIC.log("------------------------------------------");
		GENERIC.log(" ");
		GENERIC.log("show_slowly", nodeid, move_index);
		GENERIC.log("node", node);

		if(node.moves_from_node.length > 0) {
			function show_fun() {
				var steps = node.moves_from_node[move_index].steps;
				show_steps_slowly(steps, nodeid, move_index);
			}

			if(viewer.current_id() !== nodeid || stepbuffer.length > 0) {
				undo_all_steps();
				// set correct starting position first and have a delay
				viewer.gametree_goto(nodeid);
				show_board();
				setTimeout(show_fun, show_step_delay);
			} else {
				// does not need to undo stepbuffer, is empty
				show_fun();
			}
		} else {
			showing_slowly = false;
			GENERIC.log("no moves from current node");
		}		 
	}

	function show_next() {
		show_variation(current_move_index);
	}

	function show_variation(move_index) {
		showing_slowly = false;
		var cur_node = get_current_node();
		if(move_index >= cur_node.moves_from_node.length) {
			return;
		}
		
		//GENERIC.log(gametree.select_node(current_gametree_id).moves_from_node[move_index]);
		
		var nextid = gametree.next_nodeid(viewer.current_id(), move_index);
		
		if(!nextid) return;

		current_move_index = 0;

		undo_all_steps();
		
		viewer.gametree_goto(nextid);
		show_board();
		
		// NOTE! current_gametree_id has been updated by gametree_goto
		var node_now = get_current_node();
		if(node_now.moves_from_node.length === 0) {
			var treenode_id = "#" + cur_node.id + "_" + move_index;
			
//			domtree.jstree('set_type', singleton_after_opposite(node_now.gamestate.turn), treenode_id);
		  GENERIC.log(node_now);
			var prefix = node_now.gamestate.turn.side.slice(0, 1);
			var new_type = prefix + 'singletonafter';
			GENERIC.log("new_type", new_type);
			GENERIC.log("for", $(treenode_id));			
			domtree.jstree('set_type', new_type, treenode_id);
			//domtree.jstree('set_type', "gsingleton_after", treenode_id);

			current_domtree_node = $(treenode_id);
			//refresh_domtree();			

			//domtree.jstree('select_node', treenode_id);
			update_selected_nodehandle_view();
			//current_move_index = move_index;
			//current_gametree_id = 			
		} else {
			current_domtree_node = $('#' + nextid + '_' + current_move_index);
			GENERIC.log("new cur domtree node", current_domtree_node);
			update_selected_nodehandle_view();
		}
	}

	function show_previous() {
		showing_slowly = false;
		
		undo_all_steps();
		var previd = gametree.previous_nodeid(viewer.current_id(), current_move_index);
		GENERIC.log("current_id", viewer.current_id());
		GENERIC.log("current_move_index", current_move_index);
		GENERIC.log("previd initially", previd);
		
		//var previd = gametree.previous_nodeid(current_gametree_id);
		if(!!previd) {
			//var move_index = 0;
			var move_index_from_previous = 
				gametree.select_node(viewer.current_id()).move_index_from_previous;
			GENERIC.log("move_index_from_previous", move_index_from_previous);
			var move_index;
			// if we are inside variation just before main variant,
			// backup to the main variant, NOT move before main variant
			if(current_move_index > 0) {
				previd = viewer.current_id();
				move_index = 0;
			} else if(move_index_from_previous > 0) {
				move_index = move_index_from_previous;
			} else move_index = 0; // prev node's move_index in prev's previous
			
			GENERIC.log("new id", previd);
			GENERIC.log("move_index", move_index);
			var elem = $('#' + previd + '_' + move_index);
			current_domtree_node = elem;
			
			if(elem.attr('rel').indexOf("singletonafter") >= 0) {
				var prefix = opposite_turn(gametree.select_node(previd).gamestate.turn).side.slice(0, 1); 
				domtree.jstree('set_type', prefix + 'singletonbefore', elem);
			}
			
			current_move_index = move_index;

			GENERIC.log(previd);
			viewer.gametree_goto(previd);
			show_board();
			update_selected_nodehandle_view();
		}		
	}

	function getKeyCode(event) { return event.keycode || event.which;	}
	function is_right_arrow_key(code) { return code === 39; }
	
	function pass_if_legal() {
		if(showing_slowly) return;
		
		if(ARIMAA.is_passing_legal(viewer.gamestate(), viewer.board())) {
			stepbuffer.push({ 'type': 'pass' });
			make_move_to_gametree();
		}
	}
	
	function bind_control_move() {
		$('.pass').click(pass_if_legal);	
		$('.next').click(show_next);
		$('.prev').click(show_previous);
		
    $(window).keydown(function(event) {
      var code = getKeyCode(event);
      if(is_right_arrow_key(code)) {
      	show_next();
      }
      if(code === 37 /* left */ || code === 38 /* up */) {
      	show_previous();
      }

      //GENERIC.log(code);
      //if(code === 38) import_game(); // for debugging purposes quick importing
      
      if(code === 40 /* down */) {
      	if(showing_slowly) return;
				show_next_move_slowly();
      }
      
      if(code >= 96 && code <= 105) {
      	show_variation(code - 96);
      	set_singleton_to_before();
      }
      
      GENERIC.log(code);

      // home key
      if(code === 36) {
      	if(showing_slowly) return;
      	var first = gametree.get_initial_nodehandle().id;
      	viewer.gametree_goto(first);
      	current_domtree_node = $('#' + first + "_0");
      	show_board();
      	update_selected_nodehandle_view();      	
      }

      //FIXME: there's lots of duplication everywhere similar to this
      // end key
      if(code === 35) {
      	if(showing_slowly) return;
      	var last = gametree.get_lastid();
      	viewer.gametree_goto(last);
      	current_domtree_node = $('#' + last + "_0");
      	show_board();
      	update_selected_nodehandle_view();      	
      }
    });
  }
  
  function set_singleton_to_before() {
  	return;
  	GENERIC.log("set_singleton_to_before");
		var cur_node = gametree.next_nodeid(viewer.current_id(), current_move_index);
		var node = gametree.select_node(cur_node);
		var moves_from_current = node.moves_from_node;

  	GENERIC.log("node", node);
  	
		if(moves_from_current.length === 1) { // this is singleton 'before' position
			var followups_moves = moves_from_current[0].nodehandle_after_move.moves_from_node.length;
				if(followups_moves === 0) {
					if(elem.attr('rel').indexOf("singletonafter") >= 0) {
						var prefix = node.gamestate.turn.side.slice(0, 1); 
						domtree.jstree('set_type', prefix + 'singletonbefore', elem);
					}
				}
		}
  }

  function update_selected_nodehandle_view(scroll_viewer) {
  	show_pass_if_legal();
  	show_comments(get_current_node());
  	show_markers();
  	
  	var nodeid = viewer.current_id() + "_" + current_move_index;
//  	var jqueryNode = $('#' + nodeid);
		var jqueryNode = current_domtree_node;

  	if(jqueryNode.length > 0) {
  	  //GENERIC.log("updating");
  		var last_selected = domtree.jstree('get_selected');
  		domtree.jstree('deselect_node', last_selected);
			//domtree.jstree('deselect_all');
			domtree.jstree('select_node', jqueryNode); //FIXME: should work on variations too, 0 = main game line
			
			if(scroll_viewer === undefined || scroll_viewer) {
			  $('.scrollabletree').scrollTo(jqueryNode, {offset: -100});
			}
		} else {
			GENERIC.log(jqueryNode);
			GENERIC.log("node does not exist");
		}
  }

	function create_tree_and_viewer(domtree) {
  	gametree = create_gametree();
  	viewer = create_viewer(gametree, domtree);
	}
	
  function refresh_domtree() {
  	//return;
  	GENERIC.log("refreshing");
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

		show_board();
	}
	
	function build_move_tree(moves) {
  	var nodehandle = gametree.get_initial_nodehandle();

		//FIXME: can be recursive with variations
  	GENERIC.for_each(moves, function(move) {
			var result = gametree.make_move(move, nodehandle);
			var new_nodehandle = result.nodehandle;
  			
			nodehandle = new_nodehandle;
			//GENERIC.log(nodehandle.gamestate.steps);
		});

		build_dom_tree(gametree, domtree);
	}

	function show_board() {
		show_current_position_info(viewer.gamestate(), get_current_node());
		show_dom_board(viewer.board(), viewer.gamestate());
		show_markers();
		show_pass_if_legal();
	}
	
	function bind_import_game() {
		$('#import_game').click(import_game);
	}

	function undo_all_steps() {
		stepbuffer = [];
	}
	
	function save_comment() {
		var comment = $('.comments_for_node').val();
		gametree.comment_node(comment, viewer.current_id());		
	}
	
	$(function() {
		domtree = $('.gametree');

		create_tree_and_viewer(domtree);
				
		bind_import_game();

		bind_control_move();

		bind_select_piece();
		bind_move_piece();

		// clears the arrows when mouse leaves the board		
		$('.board').live('mouseleave', function(event) {
				var x = event.pageX + $(this).offset().left;
				var y = event.pageY + $(this).offset().top;
				GENERIC.log(x, y);
				GENERIC.log(event);
				GENERIC.log($(this));
				
				// for some reason, the event is triggered when subelement is leaved, so
				// we need to check current coordinate that it's out of bounds
				if(x < 0 || y < 0 || x >= $(this).width() || y >= $(this).height()) {
				  //$('.arrow').hide();
				}
		});
		
		$('.arrownormal').mouseenter(function() {
			$(this).hide();
			$(this).closest('.arrow').find('.arrowhover').show();		
		});
		
		$('.arrowhover').mouseleave(function() {
			$(this).hide();
			$(this).closest('.arrow').find('.arrownormal').show();		
		});

		$('.show').click(function() {
				show_next_move_slowly();
		});

		$('.square').live('mouseleave', function() {
			if(marker !== "") unhover_marker($(this));
		});
		
		$('.clear_markers_control').click(function() {
				clear_markers_from_dom_board();
				clear_markers_from_node();
		});
		
		$('.comments_for_node').keyup(function() {
				save_comment();
		});		

		$('.gametree li a').live('click', function() {
			//if(showing_slowly) return false;
			showing_slowly = false;
			undo_all_steps();
			var elem = $(this).closest('li');
			current_domtree_node = elem;
			var id = get_nodehandle_id_from_tree_elem(elem);
			current_move_index = get_move_index_from_tree_elem(elem); 
			showing_slowly = false;

			if(elem.attr('rel').indexOf("singletonafter") >= 0) {
				var prefix = gametree.select_node(id).gamestate.turn.side.slice(0, 1); 
				domtree.jstree('set_type', prefix + 'singletonbefore', elem);
			}
			
			viewer.gametree_goto(id);
			show_board();
			update_selected_nodehandle_view(false /* don't move scrollbar*/); // should this be done here?
		});
		
		$('.jstree-icon').live('click', function() {
				if(showing_slowly) return false;

				GENERIC.log("icon-click");
				/*F
				var elem = $(this).closest('li');
				
				current_move_index = get_move_index_from_tree_elem(elem);
				var id = get_nodehandle_id_from_tree_elem(elem);
				
				var to_node_id = gametree.next_nodeid(id, current_move_index);
				current_domtree_node = $('#' + to_node_id + "_0");				 
				
				showing_slowly = false;
				viewer.gametree_goto(to_node_id);
				show_board();
				
				if(elem.attr('rel').indexOf("singleton_before") >= 0) {
				  var prefix = gametree.select_node(id).gamestate.turn.side.slice(0, 1); 
				  domtree.jstree('set_type', prefix + 'singleton_after', elem);
				}
				
				domtree.jstree('select_node', current_domtree_node);
				update_selected_nodehandle_view(); // should this be done here?
				*/

				//FIXME: UGLY hack to differentiate move icons from others (such as collapse tree icon) 
				var imagesrc = $(this).css('background-image');
				if(imagesrc.indexOf("/pics/") === -1) return;
				
				var elem = $(this).closest('li');
				
				var move_index = get_move_index_from_tree_elem(elem);
				var id = get_nodehandle_id_from_tree_elem(elem);
				
				if(elem.attr('rel').indexOf("singletonbefore") >= 0) {
				  var prefix = opposite_turn(gametree.select_node(id).gamestate.turn).side.slice(0, 1); 
				  domtree.jstree('set_type', prefix + 'singletonafter', elem);
				}
				
				show_move_slowly(id, move_index);				
			
				return false; // don't let event buble
		});
		
		$('.marker').click(function() {
				var marker_down = 'marker_pressed';
				if($(this).hasClass(marker_down)) {
					$(this).removeClass(marker_down);
					marker = "";					
				} else {
					marker = $(this).text();
					$('.marker').removeClass(marker_down);
					$(this).addClass(marker_down);
				}
		});

		$('.square').live('click', function() {
			if(marker !== "") {
				toggle_marker($(this));
			}
		});

		
		/*
	  domtree.bind("deselect_node.jstree", function(event, data) {
	  	var node = data.rslt.obj;
	  	var type = node.attr('rel');
	  	
	  	if(type.indexOf("singletonafter") >= 0) {
	  		var new_type = type.replace("singletonafter", "singletonbefore");
	  		domtree.jstree("set_type", new_type, node);
	  		//update_selected_nodehandle_view();
	  	}
	  });
	  */
	  
	  import_game();		
	});
		
	
}();