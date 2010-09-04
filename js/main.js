
//FIXME: piece testing should be in arimaa logic
function is_piece(piece) { return piece !== undefined && piece['type'] !== undefined; }

function get_pic(piece, side) {
	if(piece.type === 'elephant') return 'elephant.png';
	else if(piece.type === 'rabbit') return 'rabbit.png';
	else return "rabbit.png";
}

function sideprefix(piece) {
	return piece.side === ARIMAA.gold ? 'g' : piece.side === ARIMAA.silver ? 's' : '';
}

function create_square(piece) {
	if(is_piece(piece)) {
	  return '<div class="square"><img src="pics/' + sideprefix(piece) + get_pic(piece) + '" /></div>';
	} else return '<div class="square"></div>';
}
 
function create_board(board) {
	var result = "";
  for(var i = 0; i < board.length; ++i) {
  	var row = GENERIC.map(board[i], create_square);
  	var row = GENERIC.reduce("", row, function(s1, s2) { return s1 + s2; });
  	result += "<div>" + row + "</div>";
  	result += "<div class='clear'></div>";
  }
  
  return result;
}

function show_board(board) {
	var result = create_board(board);
	$('.board').html(result);
}

$(function() {
	var board = init_arimaa_board()['board'];
	show_board(board);
	console.log(board);
});
