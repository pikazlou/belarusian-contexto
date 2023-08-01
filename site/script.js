var api_host = "http://ec2-3-66-198-236.eu-central-1.compute.amazonaws.com:8000"

$(document).ready(function(){
    $('#answer').on('keypress', function (e) {
         if(e.which === 13){
            var answer = $(this).val();
            submit_answer(answer);
         }
    });
});

function submit_answer(answer) {
    var today = new Date();
    var todayIso = today.toISOString().slice(0, 10)

    var total_words = 22334
    var rank = Math.floor(Math.random() * 22334);

    guess_response({'rank': rank, 'word': answer, 'total_words': total_words})
    //alert(todayIso);
//    $.ajax({
//        type: 'POST',
//        url: api_host + '/guess',
//        data: '{"name":"jonas"}', // or JSON.stringify ({name: 'jonas'}),
//        success: function(data) { alert('data: ' + data); },
//        contentType: "application/json",
//        dataType: 'json'
//    });
}

var guessed_words = []
function guess_response(data) {
    rank = data['rank']
    word = data['word']
    top_words = data['top_words']
    total_words = data['total_words']
    guessed_words.push({"word": word, "rank": rank})
    guessed_words.sort(function(a, b){return a.rank - b.rank});
    render_guessed_rows(total_words, word);
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
    if (percent > 50.0) {
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
    }
    $("#guessed_template").before(clone);
}