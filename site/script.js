var _game_id;
var _guessed_words = []
var _top_words = [];
var _total_words = 1;

$(document).ready(function(){
    var today = new Date();
    reset_game_id(today.toISOString().slice(0, 10));

    $('#user-input').unbind("keypress");
    $('#user-input').on('keypress', function (e) {
         if(e.which === 13){
            var input = $(this).val().toLowerCase();
            submit_input(input);
            $('#user-input').val('');
            $('.how-to-play-block').remove();
         }
    });

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
        deselect_menu();

        let clone = $($("#how-to-play-template").html());
        $('.modal').html(clone);
        $('.modal-bg').css('visibility', 'visible');
    });

    $('#menu-item-hint').click(function(){
        deselect_menu();

        get_hint();
    });

    $('#menu-item-another-game').click(function(){
        deselect_menu();

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
            let game_id = $(this).data('game_id');
            reset_game_id(game_id);
            hide_modal();
        });
    });

    $('#menu-item-about').click(function(){
        deselect_menu();

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

    $('#closest_words_btn').click(function(){
        if (_top_words.length > 0) {
            let temp_container = $('<div>');
            for (var i = 0; i < _top_words.length; i++) {
                top_word = _top_words[i];
                row = render_word_row(top_word, i + 2, _total_words);
                temp_container.append(row);
            }

            let section_template = $('#closest-words-template').html();
            let resolved = section_template.replace('{secret_word}', _guessed_words[0].word).replace('{top_words}', temp_container.html());

            $('.modal').html(resolved);
            $('.modal-bg').css('visibility', 'visible');
        }
    });
});

function get_state() {
    let state_str = window.localStorage.getItem('state');
    if (state_str === null) {
        return {}
    } else {
        return JSON.parse(state_str);
    }
}

function set_state(state) {
    window.localStorage.setItem("state", JSON.stringify(state));
}

function hide_modal() {
    $('.modal-bg').css('visibility', 'hidden');
    $('.modal').empty();
}

function deselect_menu() {
    $('.menu').css('visibility', 'hidden');
    $('#menu-bg').css('visibility', 'hidden');
    $('.menu-btn').removeClass('menu-btn-selected');
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

function get_game_id() {
    return _game_id;
}

function reset_game_id(new_game_id) {
    _game_id = new_game_id;
    $('#game_id').text("Код гульні: " + _game_id)

    _guessed_words = [];
    $('#guessed_words').empty();

    $('#win_block').hide();

    $('#wraper .how-to-play-block').remove();

    const [words, _top_words, _total_words] = get_game_state(new_game_id);
    for (var i = 0; i < words.length; i++) {
        let word = words[i];
        add_word(word.word, word.rank, _top_words, _total_words);
    }

    $("#status").empty();

    if (words.length == 0) {
        let how_to_play = $($("#how-to-play-template").html());
        $("#wraper").append(how_to_play);
    }
}

function get_game_state(game_id) {
    let state = get_state();
    let game_state = state[game_id];
    if (game_state === undefined) {
        game_state = {};
    }
    let words = game_state['words'];
    let top_words = game_state['top_words'];
    let total_words = game_state['total_words'];
    if (words === undefined || top_words === undefined || total_words === undefined) {
        words = [];
        top_words = [];
        total_words = 1;
    }
    return [words, top_words, total_words];
}

function set_game_state(game_id, words, top_words, total_words) {
    let state = get_state();
    state[game_id] = {'words': words, 'top_words': top_words, 'total_words': total_words};
    set_state(state);
}

function submit_input(input) {
    $("#status").text("Чакаем...");

    $.ajax({
        type: 'POST',
        url: '/guess',
        data: JSON.stringify ({game_id: get_game_id(), word: input}),
        success: guess_response,
        contentType: "application/json",
        dataType: 'json'
    });
}

function get_hint() {
    var highest_word;
    if (_guessed_words.length > 0) {
        highest_word = _guessed_words[0].word;
    } else {
        highest_word = '';
    }

    $("#status").text("Чакаем...");

    $.ajax({
        type: 'POST',
        url: '/hint',
        data: JSON.stringify ({game_id: get_game_id(), word: highest_word}),
        success: guess_response,
        contentType: "application/json",
        dataType: 'json'
    });
}


function guess_response(data) {
    let word = data['word'];
    let rank = data['rank'];
    let top_words = data['top_words'];
    let total_words = data['total_words'];

    $('.guessed_row').removeClass('highlighted_word_row');

    if (rank <= 0) {
        $("#status").text("Невядомае слова");
    } else {
        same_word = _guessed_words.find(function(elem) { return elem.word == word; });
        word_exists = typeof same_word !== 'undefined';
        if (word_exists) {
            $("#status").text("Слова ўжо было");
        } else {
            add_word(word, rank, top_words, total_words);
            $('#status').empty();
            $(".guessed_word:contains(" + word + ")").closest('.guessed_row').parent().clone().appendTo('#status');
        }

        $(".guessed_word:contains(" + word + ")").closest('.guessed_row').addClass('highlighted_word_row')
    }
}

function add_word(word, rank, top_words, total_words) {
    if (_top_words.length == 0) {
        _top_words = top_words;
        _total_words = total_words;
    }

    same_word = _guessed_words.find(function(elem) { return elem.word == word; });
    word_exists = typeof same_word !== 'undefined';
    _guessed_words.push({"word": word, "rank": rank})
    _guessed_words.sort(function(a, b){return a.rank - b.rank});
    render_guessed_rows(total_words, word);
    set_game_state(get_game_id(), _guessed_words, top_words, total_words);
    if (rank == 1) {
        $('#win_block').show();
    }
}

function render_guessed_rows(total_words, current_word) {
    $('#guessed_words').empty();

    for (var i = 0; i < _guessed_words.length; i++) {
        guessed_word = _guessed_words[i]
        row = render_word_row(guessed_word.word, guessed_word.rank, total_words);
        $("#guessed_words").append(row);
    }
}

function render_word_row(word, rank, total_words) {
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
    return clone;
}