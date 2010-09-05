function import_game() {
	var game = $('#imported_game').text();
	if(game === "") return;
	else {
		var gametree = TRANSLATOR.converto_to_gametree(game);
	}
}

bind_import_game() {
  $('#import_game').click(import_game);
}

$(function(){ 
  bind_import_game();
});
