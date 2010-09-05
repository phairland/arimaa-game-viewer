function import_game() {
	var game = $('#imported_game').val();
	
	if(game === "") return;
	else {
		var gametree = TRANSLATOR.convert_to_gametree(game);
		
	}
}

function bind_import_game() {
  $('#import_game').click(import_game);
}

$(function(){ 
  bind_import_game();
});
