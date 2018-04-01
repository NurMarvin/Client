/*
 animationRunTimeSeconds - Length of the animation in seconds.
 frameUpdateCallback - Callback function that takes speed, passed milliseconds and finished decimal from 0.0 to 1.0
 */

function AnimationTimer(self, animationRunTimeSeconds, frameUpdateCallback, finishedCallback) {
    //Constructor
    this.self = self;
    this.animationRunTimeMilliseconds = animationRunTimeSeconds * 1000.0;
    this.frameUpdateCallback = frameUpdateCallback;
    this.finishedCallback = finishedCallback;
    this.finished = false;
    //this.timerCount = 0.0;
    this.stopwatch = new Stopwatch();
}

var lastFPSTime = 0;
var chosenFPS = 60.0;
var chosenFPSMilliseconds = 1000.0/chosenFPS;
AnimationTimer.startAnimationLoop = function() {
    var logic = function(speed) {
        AnimationTimer.ProcessTimers(speed);
    };
    var requestFrameLoop = function(time) {
        var delta = time - lastFPSTime;
        var speed = delta / chosenFPSMilliseconds;
        //while (speed > 1.9) {
        //    speed -= 1.0;
        //    mainLogicTimer(1.0);
        //}
        logic(speed);
        lastFPSTime = time;
        window.requestAnimationFrame(requestFrameLoop);
    };
    window.requestAnimationFrame(function() {
        requestFrameLoop();
    });
}


AnimationTimer.prototype.process = function(speed) {
    if (this.finished == false) {
        //this.timerCount += passedMilliseconds;
        //if (this.timerCount >= this.animationRunTimeMilliseconds) {
        //    passedMilliseconds -= (this.timerCount - this.animationRunTimeMilliseconds);
        //    speed = passedMilliseconds / chosenFPSMilliseconds;
        //    this.timerCount = this.animationRunTimeMilliseconds;
        //}

        this.frameUpdateCallback.call(this.self, speed, this.stopwatch.getMilliseconds() / this.animationRunTimeMilliseconds);
        if (this.stopwatch.getMilliseconds() >= this.animationRunTimeMilliseconds) {
            this.finished = true;
            this.finishedCallback.call(this.self);
        }
    }
};
AnimationTimer.prototype.isFinished = function() {
    return this.finished;
};
//Static functions and variables
AnimationTimer.TimerList = [];
AnimationTimer.StartTimer = function(self, animationRunTimeSeconds, frameUpdateCallback, finishedCallback) {
    var self = self;
    var animationTimer = new AnimationTimer(self, animationRunTimeSeconds, frameUpdateCallback, finishedCallback);
    AnimationTimer.TimerList.push(animationTimer);
    //Run once at 0 just so anything that needs drawn or placed will be
    animationTimer.process(0.0);
};
AnimationTimer.StartTimerDelayed = function(self, animationDelay, animationRunTimeSeconds, frameUpdateCallback, finishedCallback) {
    var self = self;

    var delayTimer = new AnimationTimer(self, animationDelay, function(){}, function(){
        var animationTimer = new AnimationTimer(self, animationRunTimeSeconds, frameUpdateCallback, finishedCallback);
        AnimationTimer.TimerList.push(animationTimer);
        //Run once at 0 just so anything that needs drawn or placed will be
        animationTimer.process(0.0);
    });
    AnimationTimer.TimerList.push(delayTimer);
};
AnimationTimer.ProcessTimers = function(speed) {
    var completedOne = false;
    for (var i = 0; i < AnimationTimer.TimerList.length; i++) {
        var animationTimer = AnimationTimer.TimerList[i];
        animationTimer.process(speed);
        if (animationTimer.isFinished()) {
            AnimationTimer.TimerList.splice(i, 1);
            i--;
            completedOne = true;
        }
    }
    if (completedOne) AnimationTimer.ProcessTimers(0.0);
};