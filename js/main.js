
var ARIMAA_MAIN = ARIMAA_MAIN || function() {
	var shadow_on = true; // whether show next move as shadow
	var show_step_delay = 400; // milliseconds between steps
	var domtree, gametree, viewer, gametree_utils;
	var marking_handler, arrow_handler;
	var current_move_index = 0;
	var current_step = {}
	var current_domtree_node = undefined;
	var comment_handler = create_comment_handler();
	var current_game_storage_id;
	
	var stepbuffer = [];
	
	var viewer_mode = undefined;
	
	var showing_slowly = false; // when moves are showed slowly, controls are locked
	
	var selected = undefined; // what square is selected currently

	function get_current_node() { return gametree.select_node(viewer.current_id()); }

	function make_step_to_gametree(step) {
		GENERIC.log("pushing to stepbuffer");
		// step = { 'from': selected, 'to': new_coordinate, 'piece': piece }
		step.notated = TRANSLATOR.get_step_as_notated(step);
		stepbuffer.push(step);
		hide_shadow_pieces();
	}	

	function get_stepbuffer_as_notated() {
		var notated = GENERIC.reduce("", stepbuffer, function(result, step) {			
			return result + " " + TRANSLATOR.get_step_as_notated(step);
		});
		
		return $.trim(notated);
	}

	// where there's no move for current nodehandle, it's a "direct continuation" 
	function make_continuation_to_variation(current_nodehandle) {
		GENERIC.log("continuation");

		var steps_as_notated = get_stepbuffer_as_notated();

		var prev_move_prefix = current_nodehandle.previous_nodehandle.moves_from_node[current_nodehandle.move_index_from_previous].id.split(" ")[0];		
		var movenum = prev_move_prefix.slice(0, prev_move_prefix.length - 1);
		
		if(current_nodehandle.gamestate.turn === ARIMAA.gold) {
			movenum = parseInt(movenum) + 1;
		}
		
		var variation_id = 
			movenum + turn_prefix_from_node(current_nodehandle);
			
		var move = {
			'id': variation_id, 
			'steps': stepbuffer
		}

		stepbuffer = [];
		
		var result = gametree.make_move(move, current_nodehandle);
		var nodehandle = result.nodehandle;
		var move_index = result.move_index;

		// id and name for treenode
		var js = {
			'attr': {'after': nodehandle.id, 'nodeid': current_nodehandle.id, 'move_index': move_index },
			'data': " | " + steps_as_notated
		}

		var where_to = getNode(current_nodehandle.previous_nodehandle.id, current_nodehandle.move_index_from_previous);
		GENERIC.log("where_to", where_to);		
		
		var nodetype = turn_prefix_from_node(current_nodehandle) + 'singletonafter';

		var selector = getSelectorForNode(current_nodehandle.id, move_index);
		
		// create variation
		domtree.jstree("create", where_to, "after", js, false, true);
		domtree.jstree('set_type', nodetype, selector);
			
		// if node that precedes was a singleton, it must be changed to normal
		var nodetype_preceding = 
			turn_prefix_from_node(current_nodehandle.previous_nodehandle) + 'movebefore';

			var preceding_type = where_to.attr('rel');			
			if(preceding_type.indexOf("singleton") >= 0) {
				GENERIC.log("preceding IS singleton");
		    domtree.jstree('set_type', nodetype_preceding, where_to);
		  } else GENERIC.log("preceding not singleton");

 		current_move_index = move_index;
		current_domtree_node = $(selector);
		goto_node_and_update_treeview(nodehandle.id);
	}
	
	function make_move_to_gametree() {
		current_step = {};
		var current_nodehandle = get_current_node();
		GENERIC.log("current_nodehandle", current_nodehandle);

		// node where there's no moves yet
		if(current_nodehandle.moves_from_node.length === 0) {
			make_continuation_to_variation(current_nodehandle);
			return;
		}
		
		GENERIC.log("variation");
		
		var variation_name =
			current_nodehandle.moves_from_node[0].id +
			" " +
			//"[" + current_nodehandle.moves_from_node.length + "] " +
				get_stepbuffer_as_notated();
				

		var move = {
			'id': current_nodehandle.moves_from_node[0].id, 
			'steps': stepbuffer
		}		
		
		stepbuffer = [];
		
		var result = gametree.make_move(move, current_nodehandle);
		var nodehandle = result.nodehandle;
		var move_index = result.move_index;

		var selector = getSelectorForNode(current_nodehandle.id, move_index);
		//GENERIC.log("id", id);
		
		// singleton node (means that when move is made, stays at the same node since its the last)
		// id and name for treenode
		var js = {
			'attr': {'nodeid': current_nodehandle.id, 'move_index': move_index.toString(), 'after': nodehandle.id },
			'data': variation_name.toString()
		}

		var node_position_in_tree = "last";
		GENERIC.log(node_position_in_tree);
		
		var where_to = getSelectorForNode(current_nodehandle.id, 0);
		GENERIC.log("whereto", where_to);
		
		// create variation
		domtree.jstree("create", where_to, node_position_in_tree, js, false, true);
		var nodetype = turn_prefix_from_node(nodehandle) + 'singletonafter';
		domtree.jstree('set_type', nodetype, selector);
		
		current_domtree_node = $(selector);
		current_move_index = 0; // there is no move to be made

		goto_node_and_update_treeview(nodehandle.id);		
	}

	function show_pass_if_legal() {
		if(showing_slowly) return false;
		if(ARIMAA.is_passing_legal(viewer.gamestate(), viewer.board())) {
			$('.pass').removeAttr('disabled');
		} else {
			$('.pass').attr('disabled', 'disabled');
		}
	}

	function show_captured(gamestate) {
		if(!gamestate.captured) return;
		var result = "";
		
		var sorted_captured = [].concat(gamestate.captured);
		function compare_strength(a, b) { return a.strength > b.strength ? -1 : 1; }
		sorted_captured.sort(function(a, b) { return a.side === b.side ? compare_strength(a, b) : a.side === ARIMAA.silver ? - 1: 1; });
		
		GENERIC.for_each(sorted_captured, function(piece) {
			var name = "pics/" + piece.side.side.slice(0, 1) + piece.type + ".png";
			var capture = "<img class='captured_piece' src='" + name + "' />"; 
			result += capture;
		});

		$('.captured_pieces').html('').append(result);
	}

	function make_setup_variation() {
		// important: get the board for retrieving the pieces
		// we cannot use viewer.board() since it changes during the algorithm (make_move_to_gametree affects it)
		var board = viewer.board();
		
		function push_to_stepbuffer(row, col) {
			var step = {
				'piece': board[row][col],
				'to': { 'row': row, 'col': col },
				'type': "setting"
			}
			
			step.notated = TRANSLATOR.get_step_as_notated(step);
			
			stepbuffer.push(step);
		}

		function next_nodeid(node_id) {
			return gametree.next_nodeid(node_id, 0);
		}
		
		// to make a variation move, we goto to the root
		viewer.gametree_goto(gametree.get_initial_nodehandle().id);
		
		// gold
		for(var j = 0; j < 2; ++j) {
			for(var i = 0; i < ARIMAA.board_width; ++i) {
				push_to_stepbuffer(ARIMAA.board_height - 1 - j, i);
			}
		}

		make_move_to_gametree();
		
		// silver 
		for(var j = 0; j < 2; ++j) {
			for(var i = 0; i < ARIMAA.board_width; ++i) {
				push_to_stepbuffer(j, i);
			}
		}

		make_move_to_gametree();
	}
	
	function bind_settings_swap_piece() {
		$('.setup').click(function() {
			function next_nodeid(node_id) {
				return gametree.next_nodeid(node_id, 0);
			}

			if(viewer_mode === "setting") {
				make_setup_variation();
				viewer_mode = undefined;
				$('.settings_swap_piece').removeClass('settings_swap_piece');
				$('.control').removeAttr('disabled');
				$('.scrollabletree').show();
				show_board();
				$(this).text('Setup variation');
			} else {
				$('.control').not('.setup').attr('disabled', 'disabled');
				$(this).text('End setup');
				viewer_mode = "setting";
				$('.scrollabletree').hide();
				// we show the board situation where setup has been made
				var id = next_nodeid(next_nodeid(gametree.get_initial_nodehandle().id));
				viewer.gametree_goto(id);
				show_setting_board();				
			}
		});
		
		$('.square').live('click', function() {
			if(viewer_mode !== "setting") { return; }

			var coord = coordinate_for_element($(this));
			//TODO check that swapping is legal
			
			var old = $('.settings_swap_piece');
			
			if($(this).hasClass('settings_swap_piece')) {
				$('.settings_swap_piece').removeClass('settings_swap_piece'); // old and this					
			} else {
				if(old.length === 0) {
					$(this).addClass('settings_swap_piece');
				} else {
					// swap the images
					var coord_a = coordinate_for_element(old);
					var coord_b = coordinate_for_element($(this));
					
					var new_board = ARIMAA.swap_pieces_in_setting(coord_a, coord_b, viewer.board())
					
					if(!!new_board) {
						viewer.setBoard(new_board);
					}
					
					show_setting_board();
				}						
			}
		});
	}
	
	function bind_select_piece() {
		$('.square').live('mouseenter', function() {
			if(showing_slowly) return;
			if(marking_handler.is_marker_selected()) {
				marking_handler.hover_marker($(this));
				return;
			}

			selected = coordinate_for_element($(this));
			
			if(viewer.gamestate().type !== 'setting' && viewer_mode !== "setting") {
				arrow_handler.show_arrows($(this));
			}
			
		});
	}

	function bind_move_piece() {
		$('.arrow').click(function() {
			var new_coordinate = arrow_handler.coordinates_from_arrow($(this));
			make_step_for_piece(selected, new_coordinate);
		});
	}
	
	// this is for making a new move
	function make_step_for_piece(selected, new_coordinate) {
		GENERIC.log("making step");
		if(selected === undefined) return;

		play_step_sound();
		
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
		
		viewer.setBoard(result.board);
		viewer.setGamestate(result.gamestate);
		show_board();
		arrow_handler.clear_arrows();
	}

	// this is for showing already made moves
	function show_make_step_for_piece(selected, new_coordinate, show_shadows, after_callback) {
		// if this function is called with not showing_slowly, the moving slowly has been interrupted
		if(!showing_slowly) {
			$('.clone_animation_piece').remove();
			return;
		}

		//FIXME: making move to gametree should be behind common interface with getting new board
		// í.e. this should be done to a gametree
		var result = ARIMAA.move_piece(viewer.gamestate(), viewer.board(), selected, new_coordinate);
		
		viewer.setBoard(result.board);
		viewer.setGamestate(result.gamestate);

		/****
		 Animation for step
		 FIXME: create seperate function
		 anyways this is a bit dirty way to animate
		 though eventually the current dom based thing might change to use of absolute positions and maybe canvas
		***/
		
		var pieceElem = $('.row').eq(ARIMAA.board_height - selected.row - 1).find('.square').eq(selected.col).find('img');
		var toElem = $('.row').eq(ARIMAA.board_height - new_coordinate.row - 1).find('.square').eq(new_coordinate.col);

		var x_change = (new_coordinate.col - selected.col) * (toElem.outerWidth());
		var y_change = -1*(new_coordinate.row - selected.row) * (toElem.outerHeight());

		if(!pieceElem.offset()) {
			after_animation();
			return;
		}

		// animation clones that are still being animated must be fast-forwarded
		$('.clone_animation_piece').stop(true, true);
		
		var x = pieceElem.offset().left + x_change;
		var y = pieceElem.offset().top + y_change;

		var clone = pieceElem.clone().hide();
		clone.addClass('clone_animation_piece');
		
		clone
			.css('position', 'absolute')
			.css('left', pieceElem.position().left)
			.css('top', pieceElem.position().top)
			.css('width', pieceElem.outerWidth())
			.css('height', pieceElem.outerHeight())

		pieceElem.hide();
		clone.show();
			
		function after_animation() {
			// if this function is called with not showing_slowly, the moving slowly has been interrupted
			if(!showing_slowly) {
				if(!!clone)	clone.remove();
				return;
			} else if(!clone) {
				return;
			}

			clone.remove();
			
		  show_board(show_shadows);
		  arrow_handler.clear_arrows();
		  if(!!after_callback) { after_callback(); }
		}
		
		$('.boardwrapper').append(clone);
			clone.animate({
				'left': '+='+x_change,
				'top': '+='+y_change
		}, show_step_delay - 50, after_animation);
	}
	
	function moves_from(node) { return node.moves_from_node.length; }

	function show_step(step) {
		// if this function is called with not showing_slowly, the moving slowly has been interrupted
		if(!showing_slowly) return;
		
		play_step_sound();
		
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
		  arrow_handler.clear_arrows();
		} else if(step.type === 'removal') {
			throw "removal step should not be handled here, the game logic should take care of it";			
			// this can be skipped, since the effect is already done in previous step
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

			current_move_index = 0;
			
			if(moves_from_current.length === 0) {
				GENERIC.log("zeroooooooo");

				//var node_this = 
				var elem = getNode(nodeid, move_index);
				current_domtree_node = elem;

				if(elem.attr('rel').indexOf("singletonbefore") >= 0) {
					var prefix = turn_prefix_from_node(node); 
					domtree.jstree('set_type', prefix + 'singletonafter', elem);
				}
				
				showing_slowly = false;
				goto_node_and_update_treeview(cur_node);
				return;
			}	else if(moves_from_current.length === 1) { // this is singleton 'before' position

				var followups_moves = moves_from_current[0].nodehandle_after_move.moves_from_node;
				GENERIC.log("follow", followups_moves);
				GENERIC.log(followups_moves);
				
				if(followups_moves.length === 0) {
					GENERIC.log("yoyoyoy");

					var elem = getNode(gametree.next_nodeid(nodeid, move_index), 0);
					GENERIC.log(elem);
					current_domtree_node = elem;
					current_move_index = 0;

					if(elem.attr('rel').indexOf("singletonafter") >= 0) {
						var prefix = turn_prefix_from_node(node); 
						domtree.jstree('set_type', prefix + 'singletonbefore', elem);
					}
					
					showing_slowly = false;
					goto_node_and_update_treeview(cur_node);
					return;
				}
			}
			
			GENERIC.log("defaultiiiiiii");
			
			current_move_index = 0; // FIXME: how about variation of variation?
			current_domtree_node = getNode(cur_node, 0);
			
			showing_slowly = false;

			goto_node_and_update_treeview(cur_node);
			show_board();
			return;
		}

		//if(steps[1] !== undefined) show_shadow_piece_at(steps[1].notated, steps[1].to.row, steps[1].to.col);
		show_step(steps[0]);
		setTimeout(function() {
				if(showing_slowly) show_steps_slowly(steps.slice(1), nodeid, move_index); 
			}, show_step_delay);				
	}
	
	function show_next_move_slowly() {
		current_step = {}
		show_move_slowly(viewer.current_id(), current_move_index);
	}

	function show_move_slowly(nodeid, move_index) {
		if(showing_slowly) return;
		showing_slowly = true; // only at this point if we want to show_board which contains show_shadow

		hide_shadow_pieces();
		
		var node = gametree.select_node(nodeid);

		if(node.moves_from_node.length > 0) {
			function show_fun() {
				var steps = node.moves_from_node[move_index].steps;
				if(current_step.node_id === nodeid && move_index === current_move_index) {
					show_steps_slowly(steps.slice(current_step.step+1, steps.length), nodeid, move_index);
					current_step = {}
				} else {
					show_steps_slowly(steps, nodeid, move_index);
				}				
			}

			undo_all_steps();
			// set correct starting position first and have a delay
			goto_node_and_update_treeview(nodeid);
			show_board();
			setTimeout(show_fun, show_step_delay);
		} else {
			GENERIC.log("no moves from current node");
		}		 
	}

	function show_next() {
		show_variation(current_move_index);
	}

	function show_variation(move_index) {
		hide_shadow_pieces();
		showing_slowly = false;
		var cur_node = get_current_node();
		if(move_index >= cur_node.moves_from_node.length) {
			return;
		}

		var nextid = gametree.next_nodeid(viewer.current_id(), move_index);
		if(!nextid) return;
		
		current_move_index = 0;

		undo_all_steps();
		
		goto_node_and_update_treeview(nextid);
		
		// NOTE! current_gametree_id has been updated by gametree_goto
		var node_now = get_current_node();
		if(node_now.moves_from_node.length === 0) {
			var treenode = getNode(cur_node.id, move_index);
			
		  GENERIC.log(node_now);
			var prefix = turn_prefix_from_node(node_now);
			var new_type = prefix + 'singletonafter';
			domtree.jstree('set_type', new_type, treenode);

			current_domtree_node = treenode;

			update_selected_nodehandle_view();
		} else {
			current_domtree_node = getNode(nextid, current_move_index);
			GENERIC.log("new cur domtree node", current_domtree_node);
			update_selected_nodehandle_view();
		}
		
		show_board();
	}

	function goto_previous(dont_show_board_after_update) {
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
			var elem = getNode(previd, move_index);
			current_domtree_node = elem;
			
			if(elem.attr('rel').indexOf("singletonafter") >= 0) {
				var prefix = turn_prefix(ARIMAA.opposite_turn(gametree.select_node(previd).gamestate.turn)); 
				domtree.jstree('set_type', prefix + 'singletonbefore', elem);
			}
			
			current_move_index = move_index;

			GENERIC.log(previd);
			goto_node_and_update_treeview(previd);			
			if(!dont_show_board_after_update) { show_board(); }
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
		$('.pass').click(function() { pass_if_legal(); $(this).blur(); });
		
		// must have anonymous function that wraps, since the callee has parameter that
		// can be left out
		$('.next').click(function() { show_next(); });
		$('.prev').click(function() { goto_previous(); });
		
    $(document).keydown(function(event) {
    	if(viewer_mode === "setting") return false;
    	
    	var code = getKeyCode(event);
      //console.log(code);
    	
    	if(code === 39 /* right arrow */) {
 				if(!showing_slowly) {
 					show_next_step(); 
    		}
    	}
    		
      if(code === 37 /* left arrow */) { show_prev_step(); }
      
      if(code === 38 /* up */) { goto_previous(); }
      if(code === 40 /* down */) { show_next(); }
      
      if(code >= 96 && code <= 105) {
      	show_variation(code - 96);
      }
      
      //DEBUG
      //if(code === 80 /* p */) { toggleDebugInfo(); }
      //if(code === 79 /* o */) { showCurrentDebugInfo(); }
      
      // home key
      if(code === 36) {
      	if(showing_slowly) return;
      	var first = gametree.get_initial_nodehandle().id;
      	//current_domtree_node = $('#' + first + "_0");
      	current_domtree_node = getNode(first, 0);
      	goto_node_and_update_treeview(first);      	
      	show_board();
      }

      //FIXME: there's lots of duplication everywhere similar to this
      // end key
      if(code === 35) {
      	if(showing_slowly) return;
      	var last = gametree.get_lastid();
      	current_domtree_node = getNode(last, 0);
      	goto_node_and_update_treeview(last);      	
      	show_board();
      }

      // prevent moving of window when arrow keys are pressed
      if(code >= 37 && code <= 40) { return false; }
    });
  }

	function debug(value) {
		$('.debug').append(prettyPrint(value));
	}

	function toggleDebugInfo() {
		if(!ARIMAA_DEBUG_ON) return;

		$('.debug').toggleClass('shown');
		if($('.debug').hasClass('shown')) {
			$('body').css('margin-top', $('.debug').height());
		} else {
			$('body').css('margin-top', 0);
		}
	}
      
	function showCurrentDebugInfo() {
		if(!ARIMAA_DEBUG_ON) return;
		
		$('.debug').html('');
		debug({
				"current_id: ": viewer.current_id(),
				"current_move_index": current_move_index,
				"stepbuffer": stepbuffer
		});
		$('.debug').addClass('shown');
	}
      
  function update_selected_nodehandle_view(scroll_viewer) {
  	show_pass_if_legal();

  	var cur_node = get_current_node();
  	if(cur_node.moves_from_node.length > 0) {
  		$('.comments_for_move')
  			.removeAttr('disabled')
  			.show();
  	  var move = cur_node.moves_from_node[current_move_index];
  	  show_comments_for_move(move);
  	} else {
  		$('.comments_for_move')
  			.attr('disabled', 'disabled')
  			.hide();
  		show_comments_for_move();
  	}
  	
  	show_comments_for_node(get_current_node());
  	
  	marking_handler.show_markers();
  	
		var jqueryNode = current_domtree_node;

  	if(jqueryNode.length > 0) {
  		var last_selected = domtree.jstree('get_selected');
  		domtree.jstree('deselect_node', last_selected);
			domtree.jstree('select_node', jqueryNode);
			
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
  	gametree_utils = create_gametree_utils(gametree);
  	marking_handler = create_marking_handler(gametree, viewer);
  	arrow_handler = create_arrow_handler(gametree, viewer);
  	current_domtree_node = domtree.jstree('get_selected');
	}

	function import_game_from_notated(notated_game) {
		//var structured_moves = TRANSLATOR.convert_to_gametree(notated_game);
		//var moves = generate_moves(structured_moves);

  	create_tree_and_viewer(domtree);
		viewer.setBoard(empty_board());
		gametree.get_initial_nodehandle().id;

		//build_move_tree(moves);
		build_tree_from_fan(notated_game);

		show_board();
	}
	
	function import_game(game) {
		current_game_storage_id = undefined;
		var notated_game = $('.game_to_import').val();
		
		// default
		if(notated_game === "") {	notated_game = example_game; }
		
		import_game_from_notated(notated_game);
		/*
		var structured_moves = TRANSLATOR.convert_to_gametree(notated_game);
		var moves = generate_moves(structured_moves);

  	create_tree_and_viewer(domtree);
		viewer.setBoard(empty_board());
		gametree.get_initial_nodehandle().id;

		build_move_tree(moves);

		show_board();
		*/
	}
	
	function build_tree_from_fan(notated_game) {
		//console.log(notated_game);
		var ast = TRANSLATOR.convert_FAN_to_AST(notated_game);
		import_fan_ast(ast, gametree, domtree, comment_handler);

		build_dom_tree(gametree, domtree,
									/* callbacks */
									delete_position, move_variation_up, move_variation_down);
	}
	
	// old, for arimaa basic notation	
	function build_move_tree(moves) {
  	var nodehandle = gametree.get_initial_nodehandle();

		//FIXME: can be recursive with variations
  	GENERIC.for_each(moves, function(move) {
			nodehandle.main_line = true; // main line positions have special attribute
 			var result = gametree.make_move(move, nodehandle);
			var new_nodehandle = result.nodehandle;
			nodehandle = new_nodehandle;
			//GENERIC.log(nodehandle.gamestate.steps);
		});

		build_dom_tree(gametree, domtree,
									/* callbacks */
									delete_position, move_variation_up, move_variation_down);
	}

	function move_variation_up(node) {
		var id = nodeId(node);
		var move_index = moveIndex(node);

		// move_index 0 means that it's not variation but continuation
		// and index 1 means it's already the first variation
		if(move_index === 0 || move_index === 1) { return; } 

		/**
		  The following algorithm is a bit tricky. Should be refactored. 
		  Basic functionality is the same as in move_variation_down.
		  Conceptually we move node with node with move_index + 1 to move_index
		  but in actuality we move nodes from top to the bottom so that we can use
		  same kind of code as in move_variation_down. 
		  Basically, we swap the meaning of from as to when considering DOM nodes, except
		  that we have to change their indexes.		 
		*/		
		var to_node_after_node = gametree.next_nodeid(id, move_index);
		
		if(gametree.select_node(to_node_after_node).moves_from_node.length > 0) {
		  var last_node_id = gametree_utils.get_last_node_with_moves_in_line(to_node_after_node).id;
		  var last_node = getNode(last_node_id, 0);
		} else {
			var last_node_id = id; //to_node_after_node;
			var last_node = getNode(last_node_id, move_index); 			
		}

		var moved = gametree.move_variation_up(id, move_index);
		if(!moved) return;
		
		var to_node = getNode(id, move_index - 1);

		// change the move_indexes (their nodeid attribute is already same)
		node.attr('move_index', move_index - 1);
		to_node.attr('move_index', move_index);

		// id_counter goes through the "from" variation list
		// but notice that since the actual change in data structure has been done
		// we would have to reference to it with move_index - 1 BUT since we actually want
    // to swap the meaning of from and to for the algorithm, the move_index is the same		
		var id_counter = gametree.next_nodeid(id, move_index);
		var obj = to_node; // obj is the actual movable variation node
		
		var breakNextTime = false;
		do {
			// moves obj to the end of the "to" variation list
			domtree.jstree('move_node', obj, last_node, "after", 
									  false /* is copy */, false /* is prepared */, true /*skip check */);
			
			if(breakNextTime) break;
			var cur_node = gametree.select_node(id_counter);
			if(cur_node.moves_from_node.length === 0) { breakNextTime = true; }
			last_node = obj; //o obj is the new end of the variation
			obj = getNode(id_counter, 0 /* direct continuation */);
			var id_counter = gametree.next_nodeid(id_counter, 0); // 0 move_index since main line of variation
		} while(true)
		
		current_move_index = move_index - 1;
		current_domtree_node = getNode(id, move_index - 1);
		
		show_board();
		update_selected_nodehandle_view();
	}
	
	function move_variation_down(node) {
		GENERIC.log("move var down", node);
		var id = nodeId(node);
		var move_index = moveIndex(node);

		GENERIC.log("move var down", id, move_index);

		// move_index 0 means that it's not variation but continuation
		// do we need to check whether it's last or is it enough in gametree?
		if(move_index === 0) { return; } 

		var to_node_after_node = gametree.next_nodeid(id, move_index + 1);
		
		if(gametree.select_node(to_node_after_node).moves_from_node.length > 0) {
		  var last_node_id = gametree_utils.get_last_node_with_moves_in_line(to_node_after_node).id;
		  var last_node = getNode(last_node_id, 0);
		} else {
			var last_node_id = id; //to_node_after_node;
			var last_node = getNode(last_node_id, move_index + 1);			
		}

		var moved = gametree.move_variation_down(id, move_index);
		if(!moved) return;
		
		// TODO: we need to change move_index in the domnode id
		
		// ACTUALLY this should be changed to to_node's last direct continuation
		var to_node = getNode(id, move_index + 1);
		
		GENERIC.log("from and to", node, to_node);

		// change the move_indexes (their nodeid attribute is already same)
		node.attr('move_index', move_index + 1);
		to_node.attr('move_index', move_index);

		// id_counter goes through the "from" variation list
		// but notice that since the actual change in data structure has been done
		// we must reference to it with move_index + 1		
		var id_counter = gametree.next_nodeid(id, move_index + 1);
		var obj = node; // obj is the actual movable variation node
		
		var breakNextTime = false;
		do {
			// moves obj to the end of the "to" variation list
			domtree.jstree('move_node', obj, last_node, "after", 
									  false /* is copy */, false /* is prepared */, true /*skip check */);
			
			if(breakNextTime) break;
			var cur_node = gametree.select_node(id_counter);
			if(cur_node.moves_from_node.length === 0) { breakNextTime = true; }
			last_node = obj; //o obj is the new end of the variation
			obj = getNode(id_counter, 0 /* direct continuation */);
			var id_counter = gametree.next_nodeid(id_counter, 0); // 0 move_index since main line of variation
		} while(true)
		
		current_move_index = move_index + 1;
		current_domtree_node = getNode(id, move_index + 1);
		
		show_board();
		update_selected_nodehandle_view();
	}
	
	function show_shadow_piece(move, ignore_showing_slowly) {
		hide_shadow_pieces();
		
		if((!ignore_showing_slowly && showing_slowly) || stepbuffer.length > 0) return;

		if(!move) return;

		var start_step = current_step.node_id === viewer.current_id() && current_step.move_index === current_move_index ? current_step.step : -1;
		
		for(var i = start_step + 1; i < move.steps.length; ++i) {
			var step = move.steps[i];
			
			if(!!step.from) {
				show_shadow_notatedpiece_at(step.notated, step.from.row, step.from.col, step.to.row, step.to.col, i);
			}
		}
	}

	function hide_shadow_pieces() {
		$('.shadow_piece[cloned]').remove();
		$('.shadow_piece:visible').hide(); 
	}
	
	function show_shadow_notatedpiece_at(piece, from_row, from_col, row, col, i) {		
		var piece_name = TRANSLATOR.get_piece_from_notation(piece).type;
		show_shadow_piece_at(piece_name, from_row, from_col, row, col, i);
	}
	
	function show_shadow_piece_at(piece_name, from_row, from_col, row, col, i) {
		
		//hide_shadow_pieces();
		if(!shadow_on) return;
		
		var square = get_square(row, col);
		
		if(square.length === 0) return;
		
		var shadowPiece = $('#shadow_' + piece_name).clone(true).attr('cloned', true).removeAttr('id');

		var dir_y = row - from_row;
		var dir_x = col - from_col;
		var normalized_dir_y = dir_y / (Math.abs(dir_y)+0.1);		
		var normalized_dir_x = dir_x / (Math.abs(dir_x)+0.1);

		var direction_amount = 30;
		var start_size = 5;
		var size_increment = 5;
		
		shadowPiece
		  .css('left', square.offset().left + square.width()/2 - 15 + normalized_dir_x * -1*direction_amount + i*9)
		  .css('top', square.offset().top + square.height()/2 - 15  + normalized_dir_y * direction_amount + i*9)
		  .css('width', start_size+(4-i+1)*size_increment)
		  .show();
		  
		shadowPiece.appendTo('.boardwrapper');		
	}	
	
	function show_setting_board() {
		hide_shadow_pieces();
		show_dom_board(viewer.board(), viewer.gamestate());
	}
	
	function show_board(show_shadows) {
		var cur_move = get_current_node().moves_from_node[current_move_index];
		show_captured(viewer.gamestate());
		show_shadow_piece(cur_move, show_shadows);
		show_current_position_info(viewer.gamestate(), get_current_node(), cur_move);
		show_dom_board(viewer.board(), viewer.gamestate());
		marking_handler.show_markers();
		show_pass_if_legal();
	}
	
	function bind_import_game() {
		$('.show_import').click(function() { $('.import_list').show(); });
		$('.close_import').click(function() { $('.import_list').hide(); });
		$('.import').click(function() {
			import_game();
			$('.import_list').hide();
		});
	}

	function undo_all_steps() {
		stepbuffer = [];
	}
	
	function save_comment_for_position() {
		if(showing_slowly) return;
		
		var comment = $('.comments_for_node').val();
		gametree.comment_node(comment, viewer.current_id());
		comment_handler.comment_node(comment, viewer.current_id());		
	}
	
	function save_comment_for_move() {
		if(showing_slowly) return;
		
		if(get_current_node().moves_from_node.length > 0) {
			var comment = $('.comments_for_move').val();		
			gametree.comment_move(comment, get_current_node().moves_from_node[current_move_index]);
			comment_handler.comment_move(comment, get_current_node().id, current_move_index);
		}
	}

	/**
	  Deletes move from gametree and from domtree
	  Also continuations and variations are deleted
	  Cannot be applied to main line
	*/
	function delete_position(contextmenu_node) {
		if(showing_slowly) return;

		var id = nodeId(contextmenu_node);
		var move_index = moveIndex(contextmenu_node);

		GENERIC.log("clicked_node", id, move_index);

		var cur_node = gametree.select_node(id);

		if(move_index > 0) {
			// we're deleting a "root" subvariation (not continuation)
			var prev = id;
			var prev_move_index = 0; // same id, different move_index
			var prev_node = gametree.select_node(prev);

			/**
				Sibling variations after deleted node must have their move_index changed
			*/
			var before_deletion = function() {
				// start from sibling, ignore one that is deleted
				for(var i = move_index + 1; i < prev_node.moves_from_node.length; ++i) {
					$(getSelectorForNode(id, i)).attr('move_index', i - 1); 				
				}
			}
		} else {
			var before_deletion = function() { }
			var prev = gametree.previous_nodeid(id);
			var prev_node = gametree.select_node(prev);
			var prev_move_index = cur_node.move_index_from_previous;
		}

		var prev_dom_node = getNode(prev, prev_move_index);
		
		var deletable_id = id;
		var deletable_move_index = move_index;

		var breakNextRound = false;
		
		/**
		Go through all the continuation moves (starting with the deletable, though)
		and delete them one by one.
		*/
		while(true) {
		  var deletable_dom_node = getNode(deletable_id, deletable_move_index);

		  domtree.jstree('delete_node', deletable_dom_node);
		  if(breakNextRound) break;
		  deletable_id = gametree.next_nodeid(deletable_id, deletable_move_index);
		  var deletable_node = gametree.select_node(deletable_id);
		  if(deletable_node.moves_from_node.length === 0) breakNextRound = true;
		  deletable_move_index = 0; // after first round: 0 index, i.e. continuation
		}
		
		// additional DOM manipulation before changes to model
		before_deletion();

		// DELETE FROM MODEL ONLY AFTER DOM so we can use the old data from model for deleting in DOM		
		var deleted = gametree.delete_position(id, move_index);
		if(!deleted) throw "problem: model didn't delete data";

		// if the new selection becomes singleton node after deletion, set it so		
		if(is_node_singleton_before(prev, prev_move_index, gametree)) {
  		var prefix = turn_prefix_from_node(prev_node); 
	  	domtree.jstree('set_type', prefix + 'singletonbefore', prev_dom_node);
	  } else {
			// there's no after position
			getNode(prev_node, prev_move_index).removeAttr('after');
		}
		
		current_domtree_node = prev_dom_node;
		current_move_index = prev_move_index;
				
    goto_node_and_update_treeview(prev);
		show_board();
	}

	function goto_node_and_update_treeview(id) {	
		viewer.gametree_goto(id);
		update_selected_nodehandle_view();
	}
	
	function if_singletonafter_set_before(elem, id) {
		if(elem.attr('rel').indexOf("singletonafter") >= 0) {
			var prefix = turn_prefix_from_node(gametree.select_node(id)); 
			domtree.jstree('set_type', prefix + 'singletonbefore', elem);
		}
	}

	function show_next_step(dont_try_show_next_step_again) {
		var cur_move = get_current_node().moves_from_node[current_move_index];
		if(!cur_move) return;
		if(current_step.node_id === viewer.current_id() && current_step.move_index === current_move_index) {
			if(!dont_try_show_next_step_again && current_step.step >= cur_move.steps.length - 1) {
				show_next();
				show_next_step(true /* don't call again if recursion ends here */)				
				return;
			} else {
				current_step.step++;
			}
		} else {
			current_step = {
				'node_id': viewer.current_id(),
				'move_index': current_move_index,
				'step': 0
			}
		}
		
		play_sound("step");
		
		var step = cur_move.steps[current_step.step];
		if(!!step) {
			if(step.type === "setting") {
				stepbuffer.push(GENERIC.shallowCopyObject(step));
				var result = ARIMAA.add_piece(step.piece, step.to, viewer.board(), viewer.gamestate());
				viewer.setBoard(result.board);
				viewer.setGamestate(result.gamestate);
				show_board();
			} else if(step.type === "pass") {
				stepbuffer.push(GENERIC.shallowCopyObject(step));
				var result = ARIMAA.pass(viewer.board(), viewer.gamestate());
				viewer.setBoard(result.board);
				viewer.setGamestate(result.gamestate);
				show_board();
			} else {
				showing_slowly = true;
				stepbuffer.push(GENERIC.shallowCopyObject(step));
				show_make_step_for_piece(step.from, step.to, true /* show shadows */, function() { showing_slowly = false; });
			}
		} else {
			stepbuffer = [];
		}
		
	}
	
	function show_prev_step(dont_try_show_prev_again) {
		if(showing_slowly) return;
		var cur_move = get_current_node().moves_from_node[current_move_index];
		if(!cur_move) return;
		//if(current_step.step === -1) return;
		
		if(current_step.step >= 0 && current_step.node_id === viewer.current_id() && current_step.move_index === current_move_index) {
			current_step.step--;
			stepbuffer.pop();
		} else {
			stepbuffer = [];
			if(!!dont_try_show_prev_again) return;
			goto_previous(true /* don't call show_board */);
			var move = get_current_node().moves_from_node[current_move_index];
			current_step = {
				'step': move.steps.length - 1,
				'move_index': current_move_index,
				'node_id': viewer.current_id()
			}
			
			show_prev_step(true /* don't try again if recursion ends here */);
			return;
		}
		
		viewer.gametree_goto(viewer.current_id());

		for(var i = 0; i <= current_step.step; ++i) {
			var step = cur_move.steps[i];
			if(step.type === 'setting') {
				var result = ARIMAA.add_piece(step.piece, step.to, viewer.board(), viewer.gamestate());
				viewer.setBoard(result.board);
				viewer.setGamestate(result.gamestate);
			} else if(step.type === "pass") {
				var result = ARIMAA.pass(viewer.board(), viewer.gamestate());
				viewer.setBoard(result.board);
				viewer.setGamestate(result.gamestate);
			} else {
				var selected = step.from;
				var new_coordinate = step.to;
				var result = ARIMAA.move_piece(viewer.gamestate(), viewer.board(), selected, new_coordinate);
				viewer.setBoard(result.board);
				viewer.setGamestate(result.gamestate);
			}
		}
			
		show_board(true /* show shadow */);
	}
	
	function select_dom_node(elem) {
		current_step = {};
		showing_slowly = false;
		undo_all_steps();
		
		var id = nodeId(elem);

		if_singletonafter_set_before(elem, id);
		
		current_move_index = moveIndex(elem); 
		current_domtree_node = elem;

		viewer.gametree_goto(id);
		show_board();
		update_selected_nodehandle_view(false /* don't move scrollbar*/); // should this be done here?
	}

	function update_commented_positions() {
		var collected = [];
		var commenteds = comment_handler.comments_by_node();
		commenteds.sort();
		GENERIC.for_each(commenteds, function(commented) {
			var node_id = commented.node_id;
			var node = gametree.select_node(node_id);

			var move_index = commented.move_index;
			
			if(node.moves_from_node.length > 0) {
				var turn = node.moves_from_node[0].id;
			} else {
				// if singleton, the id must be previous's
				node_id = node.previous_nodehandle.id;
				var turn = node.previous_nodehandle.moves_from_node[0].id;
				move_index = node.move_index_from_previous;
				var singleton = true;
			}
			
			collected.push({
					turn: turn,
					text: commented.text,
					node_id: node_id,
					move_index: move_index,
					singleton: singleton
			});
		});
		
		// sorts by turn, notice that it works 7g and 8g but also 7g and 7s since g is before s
		function turn_num(turn) { return parseInt(turn.slice(0, turn.length - 1)); }
		function turn_side(turn) { return turn.toString().slice(turn.length - 1); }
		collected.sort(function(a, b) { 
			return turn_num(a.turn) === turn_num(b.turn) ? 
				turn_side(a.turn) === turn_side(b.turn) ?
					!a.move_index ? -1 : 1 
					:	turn_side(a.turn) < turn_side(b.turn) ? -1 : 1 
				: turn_num(a.turn) - turn_num(b.turn); 
		});

		var html = "";
		GENERIC.for_each(collected, function(elem) {
			html += "<div nodeid='" + elem.node_id + "' ";
			if(!!elem.move_index) {
				html += " move_index='" + elem.move_index + "'";
				if(!!elem.singleton) {
					html += " singleton=true ";
					html += " class='commented_position' ";
				} else {
					html += " class='commented_position commented_move' ";
				}
			} else {
				html += " class='commented_position' "; 
			}
			
			html += "><span class='commented_turn'>" + elem.turn +  "</span>&nbsp;" + elem.text + "</div>";
		});
		
		$('.positions').html(html);
	}
	
	function bind_show_commented_positions() {
		$('.comment_panel.control').click(function() {
			if($('.commented_positions').is(':visible')) {
				$('.commented_positions').hide();
			} else {
				update_commented_positions();
				$('.commented_positions').show();
			}				
		});
		
		$('.commented_position').live('click', function() {
			var nodeid = $(this).attr('nodeid');
			var move_index = $(this).attr('move_index');
			var singleton = $(this).attr('singleton');
			if(!!move_index) { 
				var node = getNode(nodeid, move_index);
				if(!!singleton) {
					select_dom_node(node);
					show_next();
					return;
				}
			} else {
				var node = getNode(nodeid, 0);
			}
			select_dom_node(node);				
		});
	}
	
	function show_saved_games() {
		var html = "";
		html += "<table>";
		html += "<thead><tr><td>Title</td><td>Created</td></tr></thead>";
		html += "<tbody>";
		
		GENERIC.for_each(GAME_STORAGE.get_all_games(), function(game) {
			html += "<tr class='game'>";
			html += "<td>" + game.title + "</td>";
			html += "<td>" + game.created.toLocaleString() + "</td>";
			html += "<td class='action'><button class='load_game' id='" + game.id + "'>Load</button></td>";
			html += "<td class='action'><button class='delete_game' id='" + game.id + "'>Delete</button></td>";
			html += "</tr>";
		});

		html += "</tbody>";
		html += "</table>";
		$('.gamelist').html(html);
	}
	
	function bind_save_locally() {
		$('.load_game').live('click', function() {
			var id = $(this).attr('id');
			var game = GAME_STORAGE.get_game(id).fan;
			import_game_from_notated(game);
			current_game_storage_id = id;
			$('.games').hide();
		});

		$('.delete_game').live('click', function() {
			var id = $(this).attr('id');
			GAME_STORAGE.delete_game(id);
			if(id === current_game_storage_id) {
				create_new_game();
			}
			else {
				show_saved_games();
			}
		});
		
		$('.save_game.control').click(function() {
		  var game_as_text = TRANSLATOR.convert_from_gametree(gametree);
			current_game_storage_id = GAME_STORAGE.save_game(game_as_text, "" /*title */, current_game_storage_id);
			show_saved_games();
		});
		
		$('.show_saved_games.control').click(function() {
			if($('.games').is(':visible')) {
				$('.games').hide();
			} else {
				show_saved_games();
				$('.games').show();
			}
		});
	}
	
	function create_new_game() {
		current_game_storage_id = undefined;
		import_game_from_notated(default_board_position);
		$('.games').hide();		
	}
	
	function export_all() {
		var text = "";
		GENERIC.for_each(GAME_STORAGE.get_all_games(), function(game) {
			text += game.title;
			text += "\n";
			text += "Created: " + game.created.toLocaleString();
			text += "\n\n";
			text += game.fan;
			text += "\n\n";
		});
		
		$('.exported_notation').text(text);
	}
	
	$(function() {
		domtree = $('.gametree');

		create_tree_and_viewer(domtree);		
		bind_save_locally();
		bind_show_commented_positions();
		bind_import_game();
		bind_control_move();
		bind_select_piece();
		bind_move_piece();
		bind_settings_swap_piece();
		
		$('.create_new_game').click(create_new_game);

		$('.show').click(show_next_move_slowly);

		$('.square').live('mouseleave', function() {
			if(marking_handler.is_marker_selected()) {
				marking_handler.unhover_marker($(this));
			}
		});
		
		$('.next_step').click(function() { show_next_step(false); });
		$('.prev_step').click(function() { show_prev_step(); })

		// initial value from checkbox since the browser may have taken value from last session
		shadow_on = $('#shadow_on').is(':checked');

		$('#shadow_on').click(function() {
			shadow_on = $(this).is(':checked');
			var cur_move = get_current_node().moves_from_node[current_move_index];
			show_shadow_piece(cur_move);
		});
		
		$('.clear_markers_control').click(function() {
				marking_handler.clear_markers_from_dom_board();
				marking_handler.clear_markers_from_node(viewer.current_id());
		});
		
		$('.export').click(function() {
			var result = TRANSLATOR.convert_from_gametree(gametree);
			$('.exported_notation').text(result);
			$('.exported_list').show();
		});
		
		$('.close_export_list').click(function() { $('.exported_list').hide(); });
		$('.export_all').click(export_all);
		
		$('.comments_for_node').keyup(function() {
				save_comment_for_position();
				if($('.commented_positions').is(':visible')) {
					update_commented_positions();
				}
		});

		$('.comments_for_move').keyup(function() {
				save_comment_for_move();
				if($('.commented_positions').is(':visible')) {
					update_commented_positions();
				}
		});		

		$('.gametree li a').live('click', function() {
			var elem = $(this).closest('li');
			select_dom_node(elem);
		});
		
		$('.gametree a').live('mouseover', function() {
			$(this).addClass('treemove_hover');		
		});
		
		$('.gametree a').live('mouseleave', function() {
			$(this).removeClass('treemove_hover');		
		});

		function is_play_icon(elem) {
			//FIXME: UGLY hack to differentiate move icons from others (such as collapse tree icon) 
			var imagesrc = elem.css('background-image');
			return imagesrc.indexOf("/pics/") >= 0;
		}
		
		$('.jstree-icon').live('mouseenter', function() {
			if(!is_play_icon($(this))) return;
				
			$(this).closest('li a')
				.addClass('treeicon_hover')
				.removeClass('treemove_hover');
			return false;
		});
		
		$('.jstree-icon').live('mouseleave', function() {
			if(!is_play_icon($(this))) return;
			
			$(this).closest('li a').removeClass('treeicon_hover');
		});

		function if_singletonbefore_set_after(elem, id) {
			if(elem.attr('rel').indexOf("singletonbefore") >= 0) {
				var prefix = turn_prefix(ARIMAA.opposite_turn(gametree.select_node(id).gamestate.turn)); 
				domtree.jstree('set_type', prefix + 'singletonafter', elem);
			}
		}
		
		$('.jstree-icon').live('click', function() {
				if(showing_slowly) return false;
				if(!is_play_icon($(this))) return false;
				
				var elem = $(this).closest('li');				
				var move_index = moveIndex(elem);
				var id = nodeId(elem);

				if_singletonbefore_set_after(elem, id);				
				debug({"showing slowly": true, "id": id, "move_index": move_index});
				
				show_move_slowly(id, move_index);				
			
				return false; // don't let event buble
		});
		
		$('.marker').click(function() {
			marking_handler.marker_on_click($(this));
		});

		$('.square').live('click', function() {
			if(marking_handler.is_marker_selected()) {
				marking_handler.toggle_marker($(this));
			}
		});

	  import_game(); // example game

	});
	
}();