
var ARIMAA_MAIN = ARIMAA_MAIN || function() {
	var board = init_arimaa_board()['board'];

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
	
	function col_index(elem) {
		return $('.row').index(elem.closest('.row'));
	}
	
	function row_index(elem) {
		var row = elem.closest('.row');
		var elems_in_row = row.find('.square');
		return elems_in_row.index(elem);
	}
	
	$(function() {
		show_board(board);
		bind_select_piece();
	});
	
}();