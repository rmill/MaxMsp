outlets = 0;
inlets = 1;

/**
 * A mapping of the midi function
 * 
 * @var object
 */
this.MIDI_FUNCTION_MAP;

/**
 * The currently selected MIDI function
 * 
 * @var function
 */
this.midiFunction;

/**
 * An array containing the button states
 * 
 * @var array
 */
this.buttonStates;

/**
 * The interface that handles sending messages to the Ohm64
 * 
 * @var midiout 
 */
this.midiInterface;

/**
 * Initialize the object
 */
this.init = function () {
    this.MIDI_FUNCTION_MAP = {
        toggle: this.toggleState,
        trigger: this.triggerState,
        blink: this.blinkState
    };

    this.setMidiFunction('toggle');
    this.midiInterface = this.patcher.getnamed('toOhm64');
    this.clear();
};

/**
 * The button event
 *  
 * @param integer buttonId The ID of the button
 * @param interger value The state of the button
 **/
this.button = function (buttonId, state) {
    this.midiFunction(buttonId, state);
};

/**
 * Toggle the pressed state of a button
 * 
 * @param integer buttonId The ID of the button
 * @param boolean isKeyDown Only trigger state change on button down events (default: true)
 */
this.toggleState = function (buttonId, isKeyDown) {	
    // Only toggle state on button down
    if (!isKeyDown) {
        return;
    }

    // Toggle the state
    state = (this.getButton(buttonId).state > 0) ? 0 : 1;

    this.setButtonState(buttonId, state);
};

/**
 * Set the state of the button
 * 
 * @param {type} buttonId
 * @param {type} value
 * @returns {undefined}
 */
this.triggerState = function (buttonId, value) {
    setButtonState(buttonId, value);
};

/**
 * Blink the pressed state of a button
 * 
 * @param integer buttonId The ID of the button
 * @param boolean isKeyDown Only trigger state change on button down events
 */
this.blinkState = function (buttonId, isKeyDown) {	
    // Only toggle state on button down
    if (!isKeyDown) {
        return;
    }

    // blink the state
    var button = this.getButton(buttonId);
    if (!button.isBlinking) {
        button.blinkTask = new Task(this.toggleState, this, buttonId, true);
        button.blinkTask.interval = 100;
        button.blinkTask.repeat();
        button.isBlinking = true;
    } else {
        button.blinkTask.cancel(); 
        this.triggerState(buttonId, 0);
    }
};

/**
 * Set the buttons state (on or off)
 * 
 * @param integer buttonId The button ID
 * @param boolean state The state of the button
 */
this.setButtonState = function (buttonId, state) {	
    this.getButton(buttonId).state = state;
    this.midiInterface.message([144, buttonId, state]);
};

/**
 * Retrieve a button object
 * 
 * @param interger buttonId The button ID
 * 
 * @returns object
 */
this.getButton = function (buttonId) {
    if (this.buttonStates[buttonId] === undefined) {
        this.buttonStates[buttonId] = {};
    };
    
    return this.buttonStates[buttonId];
};

/**
 * Set the MIDI function
 * 
 * @param string functionName The name of the function to use (must be one of this.MIDI_FUNCTION_MAP)
 */
this.setMidiFunction = function (functionName) {
    if (this.MIDI_FUNCTION_MAP[functionName]) {
        this.midiFunction = this.MIDI_FUNCTION_MAP[functionName];
    }else {
        post(functionName + ' is not a valid midi function');
    }
};

/**
 * The list event. Sets all LEDs
 */
this.list = function () {
    // Validate the input
    if (arguments.length !== 64) {
        post('Invalid list. See help for the list reference');
        return;
    }
        
    // Update the button states
    for(var i=0; i < arguments.length; i++) {
        this.getButton(i).state = Boolean(arguments[i]);
    }
    
    this.sync();
};

/**
 * Sync the states of the buttons on the Ohm64. This uses a sysex command
 * to update all the buttons at once. This is done using bits to determine
 * which should be on or off. For the full documentation see 
 * http://wiki.lividinstruments.com/wiki/Ohm64
 */
this.sync = function () {
    var sysexCommand = [240, 0, 1, 97, 2, 4]; 
    for (var i=0; i < this.OHM64_INDEX_MASK.length; i++) {
        var checksum = this.getColumnChecksum(i);
        sysexCommand.push(checksum.LL, checksum.HH);
    }
    
    sysexCommand.push(247);
    
    this.midiInterface.message(sysexCommand);
};

this.getColumnChecksum = function (column) {
    var indexMask = this.OHM64_INDEX_MASK[column];
    var LL = 0;
    var HH = 0;
    var exponent = 0;
    
    // There are 14 rows per column
    for (var i=0; i < indexMask.length; i++) {
        var index = indexMask[i];
        var isSet = (index === null) ? false : this.getButton(index).state;
        var columnValue = Math.pow(2, exponent) * !isSet;

        if (i < 7) {
            LL += columnValue;
        } else {
            HH += columnValue;
        }
        
        // Reset the exponent after the 7th value
        if (i === 6) {
            exponent = 0;
        } else {
            exponent++;
        }
    }
    
    return {LL: LL, HH: HH};
};

/**
 * Trigger a factory reset on the Ohm64
 */
this.factoryReset = function () {
    var reset = [240, 0, 1, 97, 2, 6, 247];
    this.midiInterface.message(reset);
};

/**
 *  Cleart all the buttons 
 */
this.clear = function () {
    this.buttonStates = [];
    this.sync();
};

/**
 * This array hold the order in which the rows and columns need
 * be added to get the correct LL HH values
 * 
 * @var array
 */
this.OHM64_INDEX_MASK = [
    [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, null, 60, null, null],
    [1, 7, 13, 19, 25, 31, 37, 43, 49, 55, null, 61, null, null],
    [2, 8, 14, 20, 26, 32, 38, 44, 50, 56, null, 62, null, null],
    [3, 9, 15, 21, 27, 33, 39, 45, 51, 57, null, 63, null, null],
    [4, 10, 16, 22, 28, 34, 40, 46, 52, 58, null, null, null, null],
    [5, 11, 17, 23, 29, 35, 41, 47, 53, 59, null, null, null, null]
];

// Initialize the Ohm64
this.init();