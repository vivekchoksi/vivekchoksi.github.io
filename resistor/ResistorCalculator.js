/*
 * File: ResistorCalculator.js
 * ----------------------------
 * Defines a ResistorCalculator object. The user inputs text defining resistor
 * color bands; the ResistorCalculator parses this text, computes resistance,
 * and displays an image of the resistor with the correct color bands. Written
 * in pure JavaScript.
 *
 * See here for reference on how resistor color-coding works.
 * http://en.wikipedia.org/wiki/Electronic_color_code#Resistor_color-coding
 */


/* 
 * @param inputField id of html input element.
 * @param imgContainer id of div that will contain the resistor graphics.
 * @param resultText id of the element that will display resistance.
 *
 * Note:
 * Band numbers are hard-coded for readability. Bands 1 through
 * 3 encode resistance, and optional band 4 encodes tolerance. 
 */
function ResistorCalculator(inputField, imgContainer, resultText) {
    // Store relevant elements on the object.
    this.inputField = document.getElementById(inputField);
    this.resultText = document.getElementById(resultText);
    var myImgContainer = document.getElementById(imgContainer);

    if (!this.inputField || !this.resultText || !myImgContainer) {
        return;
    }

    // Create unique ids for resistor color bands.
    ResistorCalculator.prototype.getBandId = function(bandIndex) {
        var uniqueIdPrefix = imgContainer + '_band_';
        return uniqueIdPrefix + bandIndex;
    };

    // Create divs representing color bands.
    this.bands = [];
    for (var i = 0; i < 4; i++) {
        this.bands[i] = document.createElement('DIV');
        this.bands[i].id = this.getBandId(i);
        myImgContainer.appendChild(this.bands[i]);
    }

    this.displayDefaults();

    // Define event handlers.
    var obj = this;
    var isDefaultText = true;
    this.inputField.onkeyup = function() {
        obj.displayResistance();
    };
    this.inputField.onfocus = function() {
        // Clear the input field only if it is displaying auto-
        // generated default text. 
        if (isDefaultText) {
            obj.inputField.value = '';
            isDefaultText = false;
        }

        obj.inputField.style.color = 'black';
        obj.displayResistance();
    };
    this.inputField.onblur = function() {
        obj.inputField.style.color = 'gray';
        // Re-display default text only if inputField is blank.
        if (obj.inputField.value === '') {
            obj.displayDefaults();
            isDefaultText = true;
        }
    };
};

// Read the user input, display colored resistance bands, and display
// the resistance result. 
ResistorCalculator.prototype.displayResistance = function() {
    // Convert input text into an array.
    var inputColors = this.inputField.value.toLowerCase().split(' ').removeSpaces(),  
        RC = ResistorCalculator,
        len = inputColors.length,
        numIterations = (len === 4) ? 4 : 3;

    // Translate user input into colors to display.
    for (var i = 0; i < numIterations; i++) {
        inputColors[i] = (i === 3) ? RC.getColor(inputColors[i], RC.TOLERANCES) : 
                                    RC.getColor(inputColors[i], RC.COLOR_VALUES, RC.COLOR_ALIASES);
        this.displayColor(i, inputColors[i]);
    }

    // If the user didn't provide a tolerance band color, display the default
    // color.
    if (len < 4) this.displayColor(3, RC.DEFAULT_COLORS[3]);

    if (len < 3 || len > 4 || inputColors.indexOf(false) != -1)
        // The input is invalid.
        this.resultText.innerHTML = 'Expecting three color bands <br />' + 
                                    '<span class="small">(and optional tolerance band)...</span>';
    else {
        var vals = [];
        for (var i = 0; i < len; i++) {
            vals[i] = (i === 3) ? RC.TOLERANCES[inputColors[i]] : RC.COLOR_VALUES[inputColors[i]];
        }
        this.resultText.innerHTML = RC.formatValue(vals);
    }
};

// Given a valid array of three or four digits, return a message indicating
// the resistance
ResistorCalculator.formatValue = function(vals) {
    var tolerance = '';
    if (vals.length === 4) tolerance = ' (with tolerance of &plusmn;' + vals[3] + '%)';

    var value = (vals[0] * 10 + vals[1]) * Math.pow(10, vals[2]); 
    var valueAsString = value.toString();
    var ret = '';

    if (valueAsString.length > 6)
        ret = (value / 1000000) + ' M'
    else if (valueAsString.length > 3)
        ret = (value / 1000) + ' k';
    else ret = (value / 1000) + ' ';

    return ret + '&Omega;' + tolerance;
};

// Change the color of a band 
ResistorCalculator.prototype.displayColor = function(index, color) {
    color = (color === undefined) ? '' : color;
    var myBand = document.getElementById(this.getBandId(index));
    myBand.className = (index === 3) ? 'band tol ' + color : 'band ' + color;
};

// Remove empty strings from an array
Array.prototype.removeSpaces = function () {
    var arr = this;
    var index = arr.indexOf('');
    while (index != -1) {
        arr.splice(index, 1);
        index = arr.indexOf('');
    }
    return arr;
};

// Display default field value, result text, and band colors.
ResistorCalculator.prototype.displayDefaults = function() {
    this.resultText.innerHTML = 'Type in the resistor\'s color code!'; 
    this.inputField.value = ResistorCalculator.DEFAULT_TEXT;
    this.inputField.style.color = 'gray';
    for (var i = 0; i < 4; i++) {
        var myBand = document.getElementById(this.getBandId(i));
        var myClasses = (i === 3) ? ' band tol ' : 'band ';
        myBand.className = myClasses + ResistorCalculator.DEFAULT_COLORS[i];
    }
};

// Translate user input to a standard color name and returns 
// false if there is no match. 
ResistorCalculator.getColor = function(input, arr, aliases) {
    for (var key in arr) {
        if (key.indexOf(input) === 0)
            return key;
    }
    for (var key in aliases) {
        if (key.indexOf(input) === 0)
            return aliases[key];
    }
    return false;
};

ResistorCalculator.COLOR_VALUES = {
    'black' : 0, 
    'brown' : 1, 
    'red' : 2,
    'orange' : 3,
    'yellow' : 4,
    'green' : 5,
    'blue' : 6,
    'purple' : 7,
    'gray' : 8,
    'white' : 9
};

ResistorCalculator.TOLERANCES = {
    'brown' : 1, // '1' means plus or minus 1 percent.
    'red' : 2,
    'gold' : 5, 
    'silver' : 10
};

ResistorCalculator.COLOR_ALIASES = {
    'blk' : 'black',
    'brn' : 'brown',
    'grn' : 'green',
    'grey' : 'gray',
    'violet' : 'purple'
};

ResistorCalculator.DEFAULT_TEXT = 'Ex: br Black r';

ResistorCalculator.DEFAULT_COLORS = ['brown', 'black', 'red', 'gold'];