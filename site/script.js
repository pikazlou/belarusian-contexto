var api_host = "http://localhost:5000"

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
    alert(todayIso);
}