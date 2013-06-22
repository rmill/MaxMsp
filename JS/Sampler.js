inlets = 1;
outlets = 0;

// The array to store all the current samples
var samples = [];

function create (sampleName) {
	samples[sampleName] =  new Sample(sampleName);
	
	post('created new buffer: ' + sampleName);
}

function read(sampleName) {
	samples[sampleName].read();
}

function play(sampleName) {
	samples[sampleName].play();
}

function show(sampleName) {
	samples[sampleName].show();
}

Sample = function (sampleName) {
	var self = this;

    this.patcher = new Patcher();
    this.name = sampleName;	

    this.buffer = this.patcher.newdefault(0, 0, 'buffer~', this.name + '_buffer');
	this.groove = this.patcher.newdefault(0, 0, 'groove~', this.name + '_buffer');
	this.groove.sig = this.patcher.newdefault(0, 0, 'sig~');
	
	this.patcher.connect(this.groove.sig, 0, this.groove, 0);
	
	this.read = function () {
		self.buffer.message('read');
	}
	
	this.play = function () {
		this.groove.message('loop', 0);
		this.groove.message(0);
		this.groove.sig.message(1);
	}
	
	this.show = function () {
		var waveform = patcher.newdefault(500, 500, 'waveform~');
		waveform.message('name', self.name + '_buffer');
	}
}







