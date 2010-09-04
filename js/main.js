
var ARIMAA_MAIN = ARIMAA_MAIN || function() {
	var board = init_arimaa_board()['board'];
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
	
	function show_board(board) {
  	var dom_board = create_dom_board(board);
  	$('.board').html(dom_board);
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
			'row': arrow.attr('row'),
			'col': arrow.attr('col')
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
		board = ARIMAA.move_piece(board, selected, new_coordinate);
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
		
		var possible_moves = ARIMAA.legal_moves(board, coordinate);

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
		return $('.row').index(elem.closest('.row'));
	}
	
	function col_index(elem) {
		var row = elem.closest('.row');
		var elems_in_row = row.find('.square');
		return elems_in_row.index(elem);
	}
	
	$(function() {
		show_board(board);
		bind_select_piece();
		bind_move_piece();
	});
	
}();