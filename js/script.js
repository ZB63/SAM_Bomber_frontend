const WIDTH = 800;
const HEIGHT = 600;

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.moveTo(0,0);
ctx.lineTo(WIDTH,HEIGHT);
ctx.stroke();

ctx.beginPath();
ctx.arc(WIDTH/2,HEIGHT/2,40,0,2*Math.PI);
ctx.stroke();

ctx.font = "30px Arial";
ctx.fillText("Bomberman!", WIDTH/2,HEIGHT/8);