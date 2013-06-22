inlets = 1;
outlets = 0;

function anything () {
	var message = messagename;
	for(var i in arguments) {
		message += ' ' + arguments[i];
	}
	
	TextScroll.message = message;
	
	post(TextScroll.message);
}

TextScroll = function () {
	var self = this;
	
	this.message;
	this.messageBuffer;
	
	this.setMessageBuffer = function () {
		self.messageBuffer = [8][8];
	}
}


/*
// Constants
DEFAULT_SAMPLE_PATCH = this.patcher.getnamed('DefaultSamplePatch');
PATCHER = this.patcher;

// The array to store all the current samples
var samples = {};

function create (sampleName) {
	var sample = new Sample(sampleName);
	
	samples[sampleName] = sample;
	
	post('created new buffer: ' + sampleName);
}

Sample = function (sampleName) {
	var self = this;

	this.name = sampleName;	

	this.patch = _.clone(DEFAULT_SAMPLE_PATCH);
	
/*	post(this.patch);
	
	/*
	this.patch = DEFAULT_SAMPLE_PATCH;
		post(this.patch.length);
	

	
	
	// Add to the global samples list
	
	this.sendToBuffer = function (message) {
		self.patch.message(message);
	}
	

	this.read = function () {
		self.sendToBuffer('read');
	}

	this.play = function () {
		self.sendToBuffer('play');
	}

	this.stop = function () {
		self.sendToBuffer('stop');
	}

	this.volume = function (volume) {
		self.sendToBuffer('volume', volume);
	}

	this.speed = function (speed) {
		self.sendToBuffer('speed', speed);
	}	
}
*/







