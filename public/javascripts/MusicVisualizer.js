/**
 * Created by zhan on 2017/8/22.
 */

function MusicVisualizer(obj) {

    this.source = null;
    this.count = 0;

    this.analyser = MusicVisualizer.ac.createAnalyser();
    this.size = obj.size;
    this.analyser.fftSize = this.size * 2;

    this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain?'createGain':'createGainNode']();
    this.gainNode.connect(MusicVisualizer.ac.destination);

    this.analyser.connect(this.gainNode);
    this.xhr = new XMLHttpRequest();
    this.visualizer = obj.visualizer;
    this.visualize();
    // this.initCallback = null;
}
MusicVisualizer.ac = new (window.AudioContext||window.webkitAudioContext);


MusicVisualizer.prototype.load = function (path,fun) {
    this.xhr.abort();
    this.xhr.open('GET',path);
    this.xhr.responseType = 'arraybuffer';
    var self = this;
    this.xhr.onload = function () {
        fun(self.xhr.response)
    }
    this.xhr.send();
}
MusicVisualizer.prototype.decode = function (arraybuffer,fun) {
    MusicVisualizer.ac.decodeAudioData(arraybuffer,function (buffer) {
        fun(buffer)
    },function (err) {
        console.log(err);
    })
}
MusicVisualizer.prototype.play = function (path) {
    var n = ++this.count;
    var self = this;
    this.source && this.source.stop();
    if(path instanceof ArrayBuffer){
        if(n != self.count){return}
        self.decode(path,function (buffer) {
            if(n != self.count){return}
            var bs = MusicVisualizer.ac.createBufferSource();
            bs.connect(self.analyser)
            bs.buffer = buffer;
            bs[bs.start?'start':'noteOn'](0);
            self.source = bs;
        })
    }
    if(typeof(path) === 'string'){
    self.load(path,function (arraybuffer) {
        if(n != self.count){return}
        self.decode(arraybuffer,function (buffer) {
            if(n != self.count){return}
            var bs = MusicVisualizer.ac.createBufferSource();
            bs.connect(self.analyser)
            bs.buffer = buffer;
            bs[bs.start?'start':'noteOn'](0);
            self.source = bs;
        })
    })
}}
MusicVisualizer.prototype.stop = function () {
    this.source[this.source.stop? 'stop': 'noteOff'](0);
}
MusicVisualizer.prototype.changeVolumn = function (percent) {
    this.gainNode.gain.value = percent * percent;
}
MusicVisualizer.prototype.visualize = function () {
    var arr = new Uint8Array(this.analyser.frequencyBinCount);
    var self = this;

    requestAnimationFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;
    function v() {
        self.analyser.getByteFrequencyData(arr);
        self.visualizer(arr);
        requestAnimationFrame(v);
    }
    requestAnimationFrame(v);
}
// //应用加载完毕，为ios设备添加用户触发事件
// MusicVisualizer.prototype.addinit = function (fun) {
//     this.initCallback = fun;
// }