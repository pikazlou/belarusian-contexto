$(document).ready(function(){
    var today = new Date();
    var game_id = today.toISOString().slice(0, 10)

    set_game_id(game_id);

    $('.menu-btn').click(function(){
        $('.menu').css('visibility', 'visible');
        $('#menu-bg').css('visibility', 'visible');
        $('.menu-btn').addClass('menu-btn-selected');
    });

    $('#menu-bg').click(function(){
        $('.menu').css('visibility', 'hidden');
        $('#menu-bg').css('visibility', 'hidden');
        $('.menu-btn').removeClass('menu-btn-selected');
    });

    $('.modal-bg').click(function(){
        hide_modal();
    });

    $(".modal").click(function(e) {
        e.stopPropagation();
    });

    $('#menu-item-how-to-play').click(function(){
        $('.menu').css('visibility', 'hidden');
        $('#menu-bg').css('visibility', 'hidden');
        $('.menu-btn').removeClass('menu-btn-selected');

        let clone = $($("#how-to-play-template").html());
        $('.modal').html(clone);
        $('.modal-bg').css('visibility', 'visible');
    });

    $('#menu-item-another-game').click(function(){
        $('.menu').css('visibility', 'hidden');
        $('#menu-bg').css('visibility', 'hidden');
        $('.menu-btn').removeClass('menu-btn-selected');

        append_game_id_to_list_of_games('Выпадковая', random_game_id());

        let currentDate = new Date();
        let game_id = currentDate.toISOString().slice(0, 10);
        append_game_id_to_list_of_games(game_id + ' (сёння)', game_id);
        while (game_id != '2023-08-01') {
            currentDate.setDate(currentDate.getDate() - 1);
            game_id = currentDate.toISOString().slice(0, 10);
            append_game_id_to_list_of_games(game_id, game_id);
        }

        $('.modal-bg').css('visibility', 'visible');

        $('.specific_game_button').click(function(){
            var game_id = $(this).data('game_id');
            set_game_id(game_id);
            guessed_words = [];
            $('.guessed_row').remove();
            hide_modal();
        });
    });

    $('#menu-item-about').click(function(){
        $('.menu').css('visibility', 'hidden');
        $('#menu-bg').css('visibility', 'hidden');
        $('.menu-btn').removeClass('menu-btn-selected');

        let sections_html = ''
        let section_template = $('#about-section-template').html();
        $('.faq').each(function() {
            let question = $(this).find('.faq-question').html();
            let answer = $(this).find('.faq-answer').html();
            let resolved = section_template.replace('{question}', question).replace('{answer}', answer);
            sections_html += resolved;
        });
        let block_template = $('#about-block-template').html();
        let block_resolved = block_template.replace('{sections}', sections_html);
        $('.modal').append($(block_resolved));

        $('.modal-bg').css('visibility', 'visible');

        $('.about-question-row').click(function(){
            let current_answer = $(this).parent().find('.about-answer');
            $('.about-answer').not(current_answer).slideUp(200);
            current_answer.slideDown(200);
        });
    });
});

function hide_modal() {
    $('.modal-bg').css('visibility', 'hidden');
    $('.modal').empty();
}

function random_game_id() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var length = 5;
    var result = '';
    for (i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

function append_game_id_to_list_of_games(caption, game_id) {
    let specific_game_button = $($("#another-game-template").html()).filter('.specific_game_button').clone();
    specific_game_button.text(caption);
    specific_game_button.data('game_id', game_id);
    $('.modal').append(specific_game_button);
}

function set_game_id(game_id) {
    $('#game_id').text("Код гульні: " + game_id)

    $('#user-input').unbind("keypress");
    $('#user-input').on('keypress', function (e) {
         if(e.which === 13){
            var input = $(this).val().toLowerCase();
            submit_input(game_id, input);
            $('#user-input').val('');
            $('.how-to-play-block').remove();
         }
    });

    $("#status").empty();

    $('#wraper .how-to-play-block').remove();

    let how_to_play = $($("#how-to-play-template").html());
    $("#wraper").append(how_to_play);
}

function submit_input(game_id, input) {
    $("#status").text("Чакаем...");

    $.ajax({
        type: 'POST',
        url: '/guess',
        data: JSON.stringify ({game_id: game_id, word: input}),
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

    if (rank >= 1) {
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
        if (rank == 1) {
            $("#status").html("Віншуем! Сакрэтнае слова: <b>" + word + "</b>");
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
    var current = Math.pow(Math.log(rank), 2)
    var percent = 100.0 * (1.0 - current / max);

    var progress_color = '#dd8888'
    if (rank == 1) {
        progress_color = '#bbffbb'
    } else if (percent > 66.0) {
        progress_color = '#aaddaa'
    } else if (percent > 33.0) {
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