	function show_comments() {
		return; // FIXME: needs access to current node
		var current = get_current_node();
		if(!current) return;
		
  	$('.comments_for_node').val(current.comment);
	}	

	function show_turn(gamestate) {
		if(gamestate.turn === ARIMAA.gold) {
			$('.turn')
				.text("Gold to move")
				.css('color', "yellow");			
		} else {
			$('.turn')
				.text("Silver to move")
				.css('color', "#ccc");
		}
	}
	
	function show_current_position_info(gamestate) {
		show_comments(); //FIXME not the best place
		show_turn(gamestate);
	}
	
	function show_board(board, gamestate) {
		show_current_position_info(gamestate); //FIXME not the best place
		
  	var dom_board = create_dom_board(board);
  	$('.board').html(dom_board);
  	GENERIC.for_each(ARIMAA.traps, function(trap) {
  			$('.row').eq(trap[0]).find('.square').eq(trap[1]).addClass('trap');
  	});
	}

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
	

