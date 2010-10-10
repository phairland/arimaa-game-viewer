var GAME_STORAGE = GAME_STORAGE || function() {
	var context = "ARIMAA-viewer";
	
	function key(name) { return context + "_" + name; }
	function game_key(num) { return "game_" + num; }
	
	function get_unique_id() {
		var last_key = $.jStorage.get(key("last_key"));
		if(!last_key) {
			last_key = 0; 
		}

		var unique_key = last_key + 1;
		// set new last_key
		$.jStorage.set(key("last_key"), unique_key);
		
		return game_key(unique_key);
	}
	
	function get_all_games() {
		var indexes = $.jStorage.index();
		
		var result = [];
		
		GENERIC.for_each(indexes, function(index) {
			var value = $.jStorage.get(index);
			if(value.type === "game") {
				result.push(value);
			}
		});
		
		return result;
	}
	
	function save_game(game, title, id) {
		if(!id) {
			var id = get_unique_id();
			var created = new Date();
		} else {
			var old = $.jStorage.get(id);
			if(!old) {
				throw "Failed to retrieve old id: " + id;
			}
			
			var created = old.created;
		}
		
		var title = id;

		$.jStorage.set(id, {
				type: "game",
				title: title,
				created: created,
				updated: new Date(),
				fan: game,
				id: id
		});
		
		return id;
	}
	
	function get_game(id) {
		return $.jStorage.get(id);
	}
	
	function delete_game(id) {
		$.jStorage.deleteKey(id);
	}
	
	return {
		'get_all_games': get_all_games,
		'save_game': save_game,
		'get_game': get_game,
		'delete_game': delete_game
	}
}();
