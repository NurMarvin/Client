//This function is a constructor for the Stopwatch class
function Stopwatch() {
    this.reset();
}

//This function resets the milliseconds to the current time.
Stopwatch.prototype.reset = function() {
    this.startMilliseconds = Date.now();
};

//This function gets milliseconds
Stopwatch.prototype.getMilliseconds = function() {
    var currentMilliseconds = Date.now();
    return currentMilliseconds - this.startMilliseconds;
};

//This function gets seconds
Stopwatch.prototype.getSeconds = function() {
    var currentMilliseconds = Date.now();
    return (currentMilliseconds - this.startMilliseconds) / 1000.0;
};

//This function gets minutes
Stopwatch.prototype.getMinutes = function() {
    var currentMilliseconds = Date.now();
    return (currentMilliseconds - this.startMilliseconds) / 1000.0 / 60.0;
};

//This function gets hours
Stopwatch.prototype.getHours = function() {
    var currentMilliseconds = Date.now();
    return (currentMilliseconds - this.startMilliseconds) / 1000.0 / 60.0 / 60.0;
};