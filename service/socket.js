// module.exports = function (server) {
//     var io = require('socket.io');
//     io = io(server);
//     io.on('connection', function(socket){//웹 소켓 연결시
//         console.log('Socket Initialized');
//
//
//         socket.on('disconnect', function () {
//             console.log('disconnect');
//         });
//
//     });
// };