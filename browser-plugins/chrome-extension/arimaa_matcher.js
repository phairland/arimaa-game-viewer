
/* Show page action (icon) only if there is movelist available */

if($('#movelist').length > 0) {
  var request = { 'show_page_action': true };
  chrome.extension.sendRequest(request, function(response) {});
}
