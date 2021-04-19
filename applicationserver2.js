var WebSocket = require("ws");
var wss = new WebSocket.Server({ port: 8081 });
wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {

        var object = JSON.parse(message).object;
        var N =  object.N;        
        console.log("N");
        console.log(N);
        var divisors = {}

        var step = N / 100;
        var cur = step;
        for (var r = 2; r <= N; ++r)
        {
            if (r >= cur)
            {
                // console.log("send progress");
                // console.log(JSON.stringify({taskId : object.taskId, userId : object.userId, status : "progress", progress : Math.floor(r * 100 / N)}));
                ws.send(JSON.stringify({taskId : object.taskId, userId : object.userId, status : "progress", progress : Math.floor(r * 100 / N)}));
                cur += step;
            }
            while (N % r === 0)
            {
                if (divisors[r] > 0)
                {
                    divisors[r] = divisors[r] + 1;
                }
                else
                {
                    divisors[r] = 1;
                }
                N = N / r;
            }
        }
        if (N > 1)
        {
            if (divisors[N] > 0)
            {
                divisors[N] = divisors[N] + 1;
            }
            else
            {
                divisors[N] = 1;
            }
        }

        var res = 1
        for (let divisor in divisors)
        {
            res = res * (Math.pow(divisor, divisors[divisor]) - Math.pow(divisor, divisors[divisor] - 1));
        }
        ws.send(JSON.stringify({taskId : object.taskId, status : "result", result : res, userId : object.userId}));
    });
});

