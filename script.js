var canvas = document.getElementById("canvsignature");
canvas.addEventListener("mousedown", pointerDown, false);
canvas.addEventListener("mouseup", pointerUp, false);
var ctx = canvas.getContext("2d");
var btnSubmit = document.getElementById("btnSubmit");
var datasignature = document.getElementById("datasignature");

function pointerDown(evt) {
    ctx.beginPath();
    ctx.moveTo(evt.offsetX, evt.offsetY);
    canvas.addEventListener("mousemove", paint, false);
}

function pointerUp(evt) {
    canvas.removeEventListener("mousemove", paint);
    paint(evt);
}

function paint(evt) {
    ctx.lineTo(evt.offsetX, evt.offsetY);
    ctx.stroke();
}
btnSubmit.addEventListener(
    "click",
    function() {
        var dataURL = canvas.toDataURL();
        datasignature.value = dataURL;
    },
    false
);
