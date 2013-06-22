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
 * An boolean array containing the Button states (on or off)
 * 
 * @var array
 */
this.OHMStates;

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
        trigger: this.triggerState
    };

    this.setMidiFunction('toggle');
    this.OHMStates = [];
    this.midiInterface = this.patcher.getnamed('toOhm64');
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
 * @param boolean isKeyDown Only trigger state change on button down events
 */
this.toggleState = function (buttonId, isKeyDown) {	
    // Only toggle state on button down
    if (!isKeyDown) {
        return;
    }

    // Toggle the state
    state = (this.OHMStates[buttonId] > 0) ? 0 : 1;

    setButtonState(buttonId, state);
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
 * Set the buttons state (on or off)
 * 
 * @param integer buttonId The button ID
 * @param boolean state The state of the button
 */
this.setButtonState = function (buttonId, state) {	
    this.OHMStates[buttonId] = state;
    this.sendMessage(144, buttonId, state);	
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
 * Send a message to the Ohm64
 * 
 * @param string eventType The event type
 */
this.sendMessage = function (eventType, note, value) {
    this.midiInterface.message(eventType, note, value);	
};

/**
 * The list event
 */
this.list = function () {
    post('list');
    var matrix = getMaskedMatrix(arguments);
    var sysexCommand = '';

    var sysexValue = 0;

    for (var col = 0; col < 11; col++) {
            sysexValue += Math.pow(2, col) * matrix[col];
    }
};

/**
 * 
 */
this.getMaskedMatrix = function (values) {
    var maskedMatrix = [];

    for(var i = 0; i < 16; i++) {
            var maskIndex = Ohm64_mask[i];
            maskedMatrix[i] = Boolean(values[maskIndex]);
    }

    return maskedMatrix;
};

/**
 * 
 */
this.Ohm64_mask = [
    0,  48, 33, 18, 3,  51, 36, 21, 6,  54, 39,
    8,  56, 41, 26, 11, 59, 44, 29, 14, 62, 47,
    16, 1,  49, 36, 19, 4,  52, 37, 22, 7,  55,
    24, 9,  57, 46, 27, 12, 60, 45, 30, 15, 63,
    32, 17, 2,  54, 35, 20, 5,  53, 38, 23, null,
    40, 25, 10, 62, 43, 28, 13, 61, 46, 31, null
];

// Initialize the Ohm64
this.init();