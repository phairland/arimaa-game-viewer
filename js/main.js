
var ARIMAA_MAIN = ARIMAA_MAIN || function() {
	var imported_game = undefined;

	var gametree = create_gametree();
	
	var board = init_arimaa_board()['board'];
	var gamestate = ARIMAA.get_initial_gamestate();
	
	var selected = undefined; // what square is selected currently

	//FIXME: piece testing should be in arimaa logic
	function is_piece(piece) { return piece !== undefined && piece['type'] !== undefined; }
	
	function get_pic(piece, side) {
		return piece.type + ".png";
	}
	
	function sideprefix(piece) {
		return piece.side === ARIMAA.gold ? 'g' : piece.side === ARIMAA.silver ? 's' : '';
	}
	
	function create_square(piece) {
		if(is_piece(piece)) {
			return '<div class="square"><img src="pics/' + sideprefix(piece) + get_pic(piece) + '" /></div>';
		} else return '<div class="square"></div>';
	}
	 
	function create_dom_board(board) {
		var result = "";
		for(var i = 0; i < board.length; ++i) {
			var mapped_row = GENERIC.map(board[i], create_square);
			var row = GENERIC.reduce("", mapped_row, function(s1, s2) { return s1 + s2; });
			result += "<div class='row'>" + row + "</div>";
			result += "<div class='clear'></div>";
		}
		
		return result;
	}
	
	function create_dom_movehandle(movehandle) {
		//var movename = movehandle.gamestate.turn.slice(0, 1);
		var movename = movehandle.move.id;
		return $('<div class="movehandle" side="' + movehandle.gamestate.turn.side + '" id="' + movehandle.id + '">' + movename + '</div>');
	}
	
	function make_move_to_gametree(move) {
		return;
		var movehandle = gametree.make_move(move);
		var dom_movehandle = create_dom_movehandle(movehandle);
		$('.gametree').append(dom_movehandle);
	}
	
	function show_board(board) {
  	var dom_board = create_dom_board(board);
  	$('.board').html(dom_board);
  	GENERIC.for_each(ARIMAA.traps, function(trap) {
  			$('.row').eq(trap[0]).find('.square').eq(trap[1]).addClass('trap');
  	});
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
			move_piece(selected, new_coordinate);
		});
	}
	
	function move_piece(selected, new_coordinate) {
		if(selected === undefined) return;

		var piece = board[selected.row][selected.col];
		var move = { 'from': selected, 'to': new_coordinate, 'piece': piece } 
		make_move_to_gametree(move);
		//FIXME: making move to gametree should be behind common interface with getting new board
		result = ARIMAA.move_piece(gamestate, board, selected, new_coordinate);
		board = result.board;
		gamestate = result.gamestate;
		show_board(board);
		clear_arrows();
	}
	
	function clear_arrows() {
		$('.arrow').hide();
	}
	
	function show_arrows(elem) {
		$('.arrow').hide();
		
		var coordinate = {
		 'row': row_index(elem),
		 'col': col_index(elem)
		}
		
		selected = coordinate;
		
		var possible_moves = ARIMAA.legal_moves(gamestate, board, coordinate);

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
      .css('left', center_x + (x_change !== 0 ? x_change * arrow_elem.width() : 0))
      .css('top', center_y + (y_change !== 0 ? y_change * arrow_elem.height() : 0))
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
	
	function show_gametree() {
		return;
		var handles = gametree.get_movehandles();
		
		GENERIC.for_each(handles, function(elem) { $('.gametree').append(create_dom_movehandle(elem)); });
	}
	
	function show_step(step) {
		if(step.type === 'setting') {
			board = ARIMAA.add_piece(step.piece, step.to, board);
			show_board(board);
		} else if(step.type === 'removal') {
			throw "removal step should not be handled here, the game logic should take care of it";			
			// this can be skipped, since the effect is already done in previous step
			
			//board = ARIMAA.remove_piece(step.coordinate, board);
			//show_board(board);
			
		} else {
			move_piece(step.from, step.to);
		}
	}



	function show_steps_slowly(steps) {
		if(steps.length === 0) return;

		show_step(steps[0]);
		setTimeout(function() { show_steps_slowly(steps.slice(1)); }, 
							300);				
	}
	
	function show_next_move_slowly() {
		if(!!imported_game) {
			var steps = imported_game.get_steps_in_next_move();

			show_steps_slowly(steps);
		}			
	}

	function show_next_move() {
		if(!!imported_game) {
			var steps = imported_game.get_steps_in_next_move();
			
			GENERIC.for_each(steps, function(step) { 
					show_step(step);
			});
		}			
	}
	
	function show_next() {
		if(!!imported_game) {
			var step = imported_game.get_next_step();
			show_step(step);
		} else {
			alert("You should first import a game!");
		}
	}

	function getKeyCode(event) {
		return event.keycode || event.which;
	}  
	
	function is_right_arrow_key(code) { return code === 39; }
	
	function bind_next_move() {
		$('.next').click(show_next);
    $(window).keydown(function(event) {
      var code = getKeyCode(event);
      if(is_right_arrow_key(code)) show_next();

      //console.log(code);
      if(code === 38) import_game(); // for debugging purposes quick importing
      if(code === 40) show_next_move_slowly();
    });
  }

  function build_move_tree(moves) {
  	var previous_movehandler = undefined;
		$('.movehandle').remove();
  	
  	GENERIC.for_each(moves, function(move) {
			var movehandle = gametree.make_move(move, previous_movehandler);
			previous_movehandler = movehandle;
			var dom_movehandle = create_dom_movehandle(movehandle);
			$('.gametree').append(dom_movehandle);
			apply_gametree_stylistics();
		});  	
  }
  
	function import_game() {
		var notated_game = $('#imported_game').val();
		
		if(notated_game === "") return;
		else {
			board = empty_board();
			
			var structured_moves = TRANSLATOR.convert_to_gametree(notated_game)
			//imported_game = create_import_game(structured_moves);
			build_move_tree(generate_moves(structured_moves));
			show_board(board);
		}
	}

	function bind_import_game() {
		$('#import_game').click(import_game);
	}
	
	function gametree_goto(id) {
		var node = gametree.select_move(id);
		board = node.board;
		gamestate = node.gamestate;
	}
	
	function bind_select_movehandle() {
		$('.movehandle').live('click', function() {
			var id = parseInt($(this).attr('id'));
			gametree_goto(id);
			show_board(board);		
		});
	}

	function apply_gametree_stylistics() {
		$('.movehandle[side="silver"]').css('background-color', 'gray');
		$('.movehandle[side="gold"]')
			.css('background-color', 'yellow')
			.css('color', 'black');
	}
	
	$(function() {
		bind_import_game();

		bind_next_move();

		show_board(board);
		show_gametree();
		bind_select_piece();
		bind_move_piece();
		bind_select_movehandle();
	});
	
}();