$(document).ready(function(){
    var today = new Date();
    var game_id = today.toISOString().slice(0, 10)

    $('#game_id').text("Код гульні: " + game_id)

    $('#answer').on('keypress', function (e) {
         if(e.which === 13){
            var answer = $(this).val().toLowerCase();
            submit_answer(game_id, answer);
         }
    });
});

function submit_answer(game_id, answer) {
    $("#status").text("Чакаем...");

    $.ajax({
        type: 'POST',
        url: '/guess',
        data: JSON.stringify ({game_id: game_id, word: answer}),
        success: guess_response,
        contentType: "application/json",
        dataType: 'json'
    });
}

var guessed_words = []
function guess_response(data) {
    rank = data['rank']
    word = data['word']
    top_words = data['top_words']
    total_words = data['total_words']

    if (rank >= 0) {
        same_word = guessed_words.find(function(elem) { return elem.word == word; });
        word_exists = typeof same_word !== 'undefined';
        if (!word_exists) {
            guessed_words.push({"word": word, "rank": rank})
            guessed_words.sort(function(a, b){return a.rank - b.rank});
        }
        render_guessed_rows(total_words, word);
        if (word_exists) {
            $("#status").text("Слова ўжо было");
        }
        if (rank == 0) {
            $("#status").html("Віншуем! Сакрэтнае слова <b>" + word + "</b>");
        }
    } else {
        $("#status").text("Невядомае слова");
    }
}

function render_guessed_rows(total_words, current_word) {
    $('.guessed_row').remove();

    for (var i = 0; i < guessed_words.length; i++) {
        guessed_word = guessed_words[i]
        highlighted = guessed_word.word == current_word
        render_guessed_row(guessed_word.word, guessed_word.rank, total_words, highlighted);
    }
}

function render_guessed_row(word, rank, total_words, highlighted) {
    var max = Math.pow(Math.log(total_words), 2)
    var current = Math.pow(Math.log(rank + 1), 2)
    var percent = 100.0 * (1.0 - current / max);

    var progress_color = '#dd8888'
    if (rank == 0) {
        progress_color = '#bbffbb'
    } else if (percent > 50.0) {
        progress_color = '#aaddaa'
    } else if (percent > 25.0) {
        progress_color = '#eecc66'
    }

    let clone = $($("#guessed_template").html());
    $(".guessed_word", clone).text(word);
    $(".guessed_rank", clone).text(rank);
    $(".progress_bar", clone).css("width", percent + '%');
    $(".progress_bar", clone).css("background-color", progress_color);
    if (highlighted) {
        $(".guessed_row", clone).css("border", "3px solid black");
        $("#status").html(clone.clone());
    }
    $("#guessed_template").before(clone);
}