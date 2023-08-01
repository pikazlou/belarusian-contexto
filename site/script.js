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

    guess_response({'rank': rank, 'word': 'чалавек', 'total_words': total_words})
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

function guess_response(data) {
    rank = data['rank']
    word = data['word']
    top_words = data['top_words']
    total_words = data['total_words']

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
    $(".guessed_word",clone).text(word);
    $(".guessed_rank",clone).text(rank);
    $(".progress_bar", clone).css("width", percent + '%');
    $(".progress_bar", clone).css("background-color", progress_color);
    $("#guessed_template").before(clone);
}