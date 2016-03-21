function createTable() {
  var columns = ['A','B','C','D'];
  var rows = ['1','2','3'];
  var $spacer = $('<img class="spacer" src="/img/spacer.png" alt="spacer">');
  var $table = $('<table>');
  for (var i = 0;i<rows.length;i++) {
    var $newRow = $('<tr>');
    for (var j=0;j<columns.length;j++) {
      var $newCell = $('<td id="'+columns[j]+rows[i]+'"></td>')
      $newRow.append($newCell);
    }
    $table.append($newRow);
  }
  $board.append($table);
}
