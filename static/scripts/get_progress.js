$(document).ready(function()
{
    var socket = new WebSocket('ws://127.0.0.1:8077'); 
    socket.onmessage = function(event) {
        let object = JSON.parse(event.data);
        if (object.progress === -1)
        {
            $("#"+object.taskId+".progress").hide();
            $("#"+object.taskId+".percent").text("Status : In queue ");            
        }
        else
        if (object.result === undefined)
        {
            $("#"+object.taskId+".progress").show();
            $("#"+object.taskId+".progress-bar").css("width", object.progress+"%");
            $("#"+object.taskId+".percent").text("Status : In progress " + object.progress+"%");
        } 
        else
        {
            $("#"+object.taskId+".percent").html("Result :" + object.result);            
            $("#"+object.taskId+".progress").hide();
        }
    };
    var idArray = [];
    $(".calculation").each(function () {
        idArray.push(this.id);
    });
    socket.onopen = function (event) {
        let timerId = setInterval(() => socket.send(JSON.stringify(idArray)), 200);
    };

});
  