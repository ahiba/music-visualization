/**
 * Created by zhan on 2017/8/22.
 */

function $(s) {
    return document.querySelectorAll(s);
}



var lis = $('#list li');
var size = 128;
var box = $('#box')[0];
var height,width;
var canvas = document.createElement('canvas');
box.appendChild(canvas);
var ctx = canvas.getContext('2d');
var Dots = [];
var oAdd = $('#add')[0];
var oUpload = $('#upload')[0];

var mv = new MusicVisualizer({
    size:size,
    visualizer:draw
})

////////////////////////////////////////
oAdd.onclick = function () {
    oUpload.click();
}
//读取本地文件，相较于服务器读取文件，少了ajax过程，其它一样
oUpload.onchange = function () {
    var file = this.files[0];
    var fr = new FileReader();
    fr.onload = function (e) {
        mv.play(e.target.result);
    }
    fr.readAsArrayBuffer(file);
}
///////////////////////////////////////////

for(var i=0;i<lis.length;i++){
    lis[i].onclick = function () {
        for(var j=0;j<lis.length;j++){
            lis[j].className='';
        }
        this.className='selected';
        mv.play('/media/'+this.title)
    }
}


function random(m,n) {
    return Math.round(Math.random() * (n-m) + m);
}
function getDots() {
    Dots = [];
    for(var i=0;i<size;i++){
        var x = random(0,width);
        var y = random(0,height);
        var color = 'rgba('+random(0,255)+','+random(0,255)+','+random(0,255)+',0.3)';
        Dots.push({
            x:x,
            y:y,
            dx:random(1,4),
            color:color,
            cap:0
        })
    }

}
var line;
function resize() {
    height = box.clientHeight;
    width = box.clientWidth;
    canvas.height = height;
    canvas.width = width;
    line = ctx.createLinearGradient(0,0,0,height);
    line.addColorStop(0,'red');
    line.addColorStop(0.5,'yellow');
    line.addColorStop(1,'green');
    getDots();
}
resize();
window.onresize = resize;
function draw(arr) {
    ctx.clearRect(0,0,width,height);
    var w =width / size;
    for(var i=0;i<size;i++){
        var o = Dots[i];
        ctx.fillStyle = line;
        if(draw.type == 'column'){
            var h = arr[i] / 256 * height;
            var cw = w * 0.6;
            capH = cw > 10 ? 10 : cw;
            ctx.fillRect(w*i,height-h,cw,h);
            ctx.fillRect(w*i,height-(o.cap+capH),cw,capH);
            o.cap--;
            if(o.cap<0){
                o.cap = 0;
            }
            if(h > 0 && o.cap < h + 40){
                o.cap = h+40 > height - capH ? height-capH : h + 40;
            }
        }else if(draw.type == 'dot'){
            ctx.beginPath();
            var r = 10 + arr[i] /256 * (height > width ? height : width)/30;
            ctx.arc(o.x,o.y,r,0,Math.PI * 2,false);
            var g = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,r);
            g.addColorStop(0,'#fff');
            g.addColorStop(1,o.color);
            ctx.fillStyle = g;
            ctx.fill();
            o.x += o.dx;
            o.x = o.x > width ? 0: o.x;
        }

    }
}

draw.type = 'column'

var types = $('#type li');
for(var i=0;i<types.length;i++){
    types[i].onclick = function () {
        for(var j=0;j<types.length;j++){
            types[j].className = '';
        }
        this.className = 'selected';
        draw.type = this.getAttribute('data-type')
        getDots();
    }
}

$('#volume')[0].onchange = function () {
    mv.changeVolumn(this.value/this.max);

}
$('#volume')[0].onchange();