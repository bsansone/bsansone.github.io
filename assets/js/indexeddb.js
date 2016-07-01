(function ($) {
  //console.log('js loaded....');
  var db;

  var openRequest = indexedDB.open("notelist", 1);
  openRequest.onupgradeneeded = function (e) {
    console.log("Upgrading DB...");
    var thisDB = e.target.result;
    if (!thisDB.objectStoreNames.contains("noteliststore")) {
      thisDB.createObjectStore("noteliststore", {
        autoIncrement: true
      });
    }
  }
  openRequest.onsuccess = function (e) {
    console.log("Open Success!");
    db = e.target.result;
    document.getElementById('add-btn').addEventListener('click', function () {
      var name = document.getElementById('name-in').value;
      var subject = document.getElementById('subject-in').value;
      var message = document.getElementById('message-in').value;
      if (!name.trim()) {
        //empty
      } else {
        addWord(name, subject, message, Date);
      }
    });
    renderList();
  }
  openRequest.onerror = function (e) {
    console.log("Open Error!");
    console.dir(e);
  }

  function addWord(n, s, m, date) {
    var transaction = db.transaction(["noteliststore"], "readwrite");
    var store = transaction.objectStore("noteliststore");
    var request = store.add({
      name: n,
      subject: s,
      message: m,
      date: new Date().toLocaleString()
    });
    request.onerror = function (e) {
      console.log("Error", e.target.error.name);
      //some type of error handler
    }
    request.onsuccess = function (e) {
      renderList();
      document.getElementById('name-in').value = '';
      document.getElementById('subject-in').value = '';
      document.getElementById('message-in').value = '';
    }
  }


  function renderList() {
    $('#note-subject').empty();
    //$('#note-detail').empty();
    $('#note-subject').html('<table class = "table table-bordered"><thead><tr><th><center>Notes</center></th></tr></thead></table>');
    //Count Objects
    var transaction = db.transaction(['noteliststore'], 'readonly');
    var store = transaction.objectStore('noteliststore');
    var countRequest = store.count();
    countRequest.onsuccess = function () {
      console.log(countRequest.result)
    };

    // Get all Objects
    var objectStore = db.transaction("noteliststore").objectStore("noteliststore");
    objectStore.openCursor().onsuccess = function (event) {
      var cursor = event.target.result;
      if (cursor) {
        var $link = $('<p data-key="' + cursor.key + '">' + cursor.value.name + '</p>');
        var $link2 = $('<p data-key="' + cursor.key + '"><button type="button" class="btn btn-link">' + cursor.value.subject + '</button></p>');
        var $link3 = $('<p data-key="' + cursor.key + '">' + cursor.value.message + '</p>');
        var $link4 = $('<p data-key="' + cursor.key + '">' + cursor.value.date + '</p>');
        $link2.click(function () {
          //alert('Clicked ' + $(this).attr('data-key'));
          loadTextByKey(parseInt($(this).attr('data-key')));
        });
        var $row = $('<tr >');
        var $row2 = $('<div data-key="' + cursor.key + '">');
        var $keyCell = $('<td>' + cursor.key + '</td>');
        var $nameCell = $('<td></td>').append($link);
        var $subjectCell = $('<td></td>').append($link2);
        var $messageCell = $('<td></td>').append($link3);
        var $dateCell = $('<td></td>').append($link4);
        //$row.append($keyCell);
        $row.append($subjectCell);
        $row2.append($nameCell);
        $row2.append($messageCell);
        $row2.append($dateCell);
        $('#note-subject table').append($row);
        cursor.continue();
      } else {
        //no more entries
      }
    };
  }

  function loadTextByKey(key) {
    var transaction = db.transaction(['noteliststore'], 'readonly');
    var store = transaction.objectStore('noteliststore');
    var request = store.get(key);
    request.onerror = function (event) {
      // Handle errors!
    };
    request.onsuccess = function (event) {
      // Do something with the request.result!
      var $delBtn = $('<button class="btn btn-danger btn-xs">Delete Entry</button>');
      $('#note-detail').html('<div class="text-left"><h2>' + request.result.subject + '</h2><h3>' + request.result.name + '</h3><footer><i>' + request.result.date + '</i></footer><br><p>' + request.result.message + '</p></div><br>');
      $delBtn.click(function () {
        console.log('Delete ' + key);
        deleteWord(key);
      });
      $('#note-detail').append($delBtn);
    };

  }

  function deleteWord(key) {
    var transaction = db.transaction(['noteliststore'], 'readwrite');
    var store = transaction.objectStore('noteliststore');
    var request = store.delete(key);
    request.onsuccess = function (evt) {
      renderList();
      $('#note-detail').empty();
    };
  }






})(jQuery);
