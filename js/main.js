


//sensor data object
var state = {};

  


/*******************************************************************************************************************
 *********************************************** INITIALIZE *********************************************************
 ********************************************************************************************************************/

//sensor array sample data
var sensorDataArray = new Array(12).fill(0);

//sensor array sample data FOR CUSTOM TRAINING
var NN1TrueDataArray = new Array;
var NN1FalseDataArray = new Array;
var NN2TrueDataArray = new Array;
var NN2FalseDataArray = new Array;

var NN1Architecture = 'none';
var NN2Architecture = 'none';

var NN1NumInputs = 6;
var NN2NumInputs = 6;

//master session data array of arrays
var sensorDataSession = [];

//which samples in the session data array are part of a particular sample set
var sessionSampleSetIndex = [];

var getSamplesFlag = 0;
var getSamplesTypeFlag = 0; //0=none 1=NN1T 2=NN1F 3=NN2T 4=NN2F

//do we have a trained NN to apply to live sensor data?
var haveNNFlag1 = false;
var trainNNFlag1 = false;
var activeNNFlag1 = false;

var haveNNFlag2 = false;
var trainNNFlag2 = false;
var activeNNFlag2 = false;

//NN scores
var scoreArray = new Array(1).fill(0);

var initialised = false;
var timeout = null;

//HTML GamePad API
// Joystick & Distance var
var xJoystick = 0;
var yJoystick = 0;
var zJoystick = 0;
var rxJoystick = 0;
var ryJoystick = 0;
var rzJoystick = 0;

var xJoystickOld = 0;
var yJoystickOld = 0;
var zJoystickOld = 0;
var rxJoystickOld = 0;
var ryJoystickOld = 0;
var rzJoystickOld = 0;


//Streaming time series chart var - smoothie.js
var xJoystickLine, yJoystickLine, zJoystickLine, rxJoystickLine, ryJoystickLine, rzJoystickLine, linePitch, lineRoll, lineNN1, lineNN2;
var xJoystickChart, yJoystickChart, zJoystickChart, rxJoystickChart, ryJoystickChart, rzJoystickChart, rawPitchChart, rawRollChart; 
//add smoothie.js time series streaming data chart
var chartHeight = 100;
var chartWidth = $(window).width();

$(document).ready(function() {

    /*******************************************************************************************************************
    **************************************** STREAMING SENSOR DATA CHART ***********************************************
    *******************************************************************************************************************/

    $("#streaming-data-chart").html('<canvas id="chart-canvas" width="' + chartWidth + '" height="' + chartHeight + '"></canvas>');

    var streamingChart = new SmoothieChart({/*  grid: { strokeStyle:'rgb(125, 0, 0)', fillStyle:'rgb(60, 0, 0)', lineWidth: 1, millisPerLine: 250, verticalSections: 6, }, labels: { fillStyle:'rgb(60, 0, 0)' } */ });

    streamingChart.streamTo(document.getElementById("chart-canvas"), 1200 /*delay*/ );

    xJoystickLine = new TimeSeries();
    yJoystickLine = new TimeSeries();
    zJoystickLine = new TimeSeries();
        rxJoystickLine = new TimeSeries();
    ryJoystickLine = new TimeSeries();
    rzJoystickLine = new TimeSeries();

    lineNN1 = new TimeSeries();
    lineNN2 = new TimeSeries();

    streamingChart.addTimeSeries(xJoystickLine,  {strokeStyle: 'rgb(185, 156, 107)', lineWidth: 3 });
    streamingChart.addTimeSeries(yJoystickLine,  {strokeStyle: 'rgb(143, 59, 27)',   lineWidth: 3 });
    streamingChart.addTimeSeries(zJoystickLine,  {strokeStyle: 'rgb(213, 117, 0)',   lineWidth: 3 });
    streamingChart.addTimeSeries(rxJoystickLine, {strokeStyle: 'rgb(128, 128, 128)', lineWidth: 3 });
    streamingChart.addTimeSeries(ryJoystickLine,  {strokeStyle: 'rgb(240, 240, 240)', lineWidth: 3 });
    streamingChart.addTimeSeries(rzJoystickLine,  {strokeStyle: 'rgb(140, 240, 240)', lineWidth: 3 });

    streamingChart.addTimeSeries(lineNN1,   {strokeStyle: 'rgb(72, 244, 68)',   lineWidth: 4 });
    streamingChart.addTimeSeries(lineNN2,   {strokeStyle: 'rgb(244, 66, 66)',   lineWidth: 4 });

    //min/max streaming chart button
    $('#circleDrop').click(function() {

        $('.card-middle').slideToggle();
        $('.close').toggleClass('closeRotate');

        var chartHeight = $(window).height() / 1.2;
        var chartWidth = $(window).width();

        if ($("#chart-size-button").hasClass('closeRotate')) {
            $("#streaming-data-chart").html('<canvas id="chart-canvas" width="' + chartWidth + '" height="' + chartHeight + '"></canvas>');
        } else {
            $("#streaming-data-chart").html('<canvas id="chart-canvas" width="' + chartWidth + '" height="' + 100 + '"></canvas>');
        }

        //hide controls
        $("#basic-interface-container, #hand-head-ui-container, #nn-slide-controls, .console, #interface-controls, #dump-print, #record-controls").toggleClass("hide-for-chart");
        //redraw chart
        streamingChart.streamTo(document.getElementById("chart-canvas"), 350 /*delay*/ );
    });

    //numerical data display
    function displayData() {
        var xJoystickElement =    document.getElementsByClassName('joystick-x-data')[0];
        var yJoystickElement =    document.getElementsByClassName('joystick-y-data')[0];
        var zJoystickElement =    document.getElementsByClassName('joystick-z-data')[0];

        var rxJoystickElement =    document.getElementsByClassName('joystick-rx-data')[0];
        var ryJoystickElement =    document.getElementsByClassName('joystick-ry-data')[0];
        var rzJoystickElement =    document.getElementsByClassName('joystick-rz-data')[0];

        xJoystickElement.innerHTML =      Math.pow(10, (sensorDataArray[0] * 5) ).toFixed(2);
        yJoystickElement.innerHTML =      Math.pow(10, (sensorDataArray[1] * 5) ).toFixed(2);
        zJoystickElement.innerHTML =      Math.pow(10, (sensorDataArray[2] * 5) ).toFixed(2);

        rxJoystickElement.innerHTML =      Math.pow(10, (sensorDataArray[3] * 5) ).toFixed(2);
        ryJoystickElement.innerHTML =      Math.pow(10, (sensorDataArray[4] * 5) ).toFixed(2);
        rzJoystickElement.innerHTML =      Math.pow(10, (sensorDataArray[5] * 5) ).toFixed(2);
    }

    function updateSampleCountDisplay() {
        $('.message-nn1-true').html(NN1TrueDataArray.length);
        $('.message-nn1-false').html(NN1FalseDataArray.length);
        $('.message-nn2-true').html(NN2TrueDataArray.length);
        $('.message-nn2-false').html(NN2FalseDataArray.length);
    }

    /********************************************************************************************************************
     *********************************************** HTML GAMEPAD API ***************************************************
     ********************************************************************************************************************/
    
        InitGamepad();

        //check for new data every X milliseconds - this is to decouple execution from Web Bluetooth actions
        setInterval(function() {
            //     bluetoothDataFlag = getBluetoothDataFlag();





                timeStamp = new Date().getTime();

                //load data into global array
                sensorDataArray = new Array(12).fill(0);

                sensorDataArray[0] = xJoystick;
                sensorDataArray[1] = yJoystick;
                sensorDataArray[2] = zJoystick;
                sensorDataArray[3] = rxJoystick;
                sensorDataArray[4] = ryJoystick;
                sensorDataArray[5] = rzJoystick;

                sensorDataArray[6] = 0;
                sensorDataArray[7] = 0;
                sensorDataArray[8] = 0;
                sensorDataArray[9] = 0;
                sensorDataArray[10] = 0;
                sensorDataArray[11] = timeStamp;


                //update time series chart
                xJoystickChart = ((sensorDataArray[0] + 1) / 2);
                yJoystickChart = ((sensorDataArray[1] + 1) / 2);
                zJoystickChart = ((sensorDataArray[2] + 1) / 2);

                rxJoystickChart = ((sensorDataArray[3] + 1) / 2);
                ryJoystickChart = ((sensorDataArray[4] + 1) / 2);
                rzJoystickChart = ((sensorDataArray[5] + 1) / 2);


                //sensor values in bottom 2/3 of chart , 1/10 height each
                xJoystickChart = (xJoystickChart / 4.5) + 3 * 0.1;
                yJoystickChart = (yJoystickChart / 4.5) + 2.5 * 0.1;
                zJoystickChart = (zJoystickChart / 4.5) + 2 * 0.1;

                rxJoystickChart = (rxJoystickChart / 4.5) + 1.5 * 0.1;
                ryJoystickChart = (ryJoystickChart / 4.5) + 1 * 0.1;
                rzJoystickChart = (rzJoystickChart / 4.5) + 0.5 * 0.1;


                xJoystickLine.append(timeStamp, xJoystickChart);
                yJoystickLine.append(timeStamp, yJoystickChart);
                zJoystickLine.append(timeStamp, zJoystickChart);

                rxJoystickLine.append(timeStamp, rxJoystickChart);
                ryJoystickLine.append(timeStamp, ryJoystickChart);
                rzJoystickLine.append(timeStamp, rzJoystickChart);

             //   linePitch.append(timeStamp, rawPitchChart);
             //   lineRoll.append(timeStamp, rawRollChart);

                //have the values been updated?
                if(xJoystick != xJoystickOld || yJoystick != yJoystickOld || zJoystick != zJoystickOld){
                    xJoystickOld = xJoystick;
                    yJoystickOld = yJoystick;
                    zJoystickOld = zJoystick;

                    rxJoystickOld = rxJoystick;
                    ryJoystickOld = ryJoystick;
                    rzJoystickOld = rzJoystick;

                    //add new values to NN training data
                    if (getSamplesFlag > 0) {
                        collectData();
                    } else if (trainNNFlag1 || trainNNFlag2) {
                        //don't do anything
                    }
                }


                //if data sample collection has been flagged
                //  getSensorData();
            /*    if (getSamplesFlag > 0) {
                    collectData();
                } else if (trainNNFlag1 || trainNNFlag2) {
                    //don't do anything
                } else { */
                    if (haveNNFlag1 && activeNNFlag1) { //we have a NN and we want to apply to current sensor data
                        getNNScore(1);
                    } 
                    if (haveNNFlag2 && activeNNFlag2) { //we have a NN and we want to apply to current sensor data
                        getNNScore(2);
                    } 
           //     }

                displayData();



        }, 200); // throttle 100 = 10Hz limit
    


    

    function getSensorData() {
        if (state.accelerometer) {
            sensorDataArray[0] = xJoystick.toFixed(2);
            sensorDataArray[1] = yJoystick.toFixed(2);
            sensorDataArray[2] = zJoystick.toFixed(2);
            sensorDataArray[3] = rxJoystick.toFixed(2);
            sensorDataArray[4] = ryJoystick.toFixed(2);
            sensorDataArray[5] = rzJoystick.toFixed(2);
        }
    } 

    function collectData() {
        var collectedDataArray = new Array(12).fill(0); //12 device 
        collectedDataArray = sensorDataArray;

        console.log("web bluetooth sensor data:");
        console.dir(collectedDataArray);

        //add sample to set
        sensorDataSession.push(collectedDataArray);

        if (getSamplesTypeFlag == 1) {
            NN1TrueDataArray.push(collectedDataArray);
            $('.message-nn1-true').html(NN1TrueDataArray.length);
        } else if (getSamplesTypeFlag == 2) {
            NN1FalseDataArray.push(collectedDataArray);
            $('.message-nn1-false').html(NN1FalseDataArray.length);
        } else if (getSamplesTypeFlag == 3) {
            NN2TrueDataArray.push(collectedDataArray);
            $('.message-nn2-true').html(NN2TrueDataArray.length);
        } else if (getSamplesTypeFlag == 4) {
            NN2FalseDataArray.push(collectedDataArray);
            $('.message-nn2-false').html(NN2FalseDataArray.length);
        }

        console.log("Set Index: ");
        console.dir(sessionSampleSetIndex);

        //countdown for data collection
        getSamplesFlag = getSamplesFlag - 1;
    }


    /*******************************************************************************************************************
     *********************************************** NEURAL NETWORKS ****************************************************
     ********************************************************************************************************************/
    /**
     * Attach synaptic neural net components to app object
     */
    var nnRate =        $("#rate-input").val();
    var nnIterations =  $("#iterations-input").val();
    var nnError =       $("#error-input").val();

    // ************** NEURAL NET #1
    var Neuron = synaptic.Neuron;
    var Layer = synaptic.Layer;
    var Network = synaptic.Network;
    var Trainer = synaptic.Trainer;
    var Architect = synaptic.Architect;
    var neuralNet = new Architect.LSTM(5, 5, 5, 1);
    var trainer = new Trainer(neuralNet);
    var trainingData;

    // ************* NEURAL NET #2
    var Neuron2 = synaptic.Neuron;
    var Layer2 = synaptic.Layer;
    var Network2 = synaptic.Network;
    var Trainer2 = synaptic.Trainer;
    var Architect2 = synaptic.Architect;
    var neuralNet2 = new Architect2.LSTM(5, 5, 5, 1);
    var trainer2 = new Trainer2(neuralNet2);
    var trainingData2;


    function getNNScore(selectNN) {
        var feedArray = new Array(1).fill(0);
        var scoreArray = new Array(1).fill(0);
        var timeStamp = new Date().getTime();
        var displayScore;

    /*    if ((selectNN == 1 && NN1NumInputs == 2) || (selectNN == 2 && NN2NumInputs == 2)) {
            feedArray[0] = sensorDataArray[5] / 360;
            feedArray[1] = sensorDataArray[6] / 360;
        }

        if ((selectNN == 1 && NN1NumInputs == 5) || (selectNN == 2 && NN2NumInputs == 5)) {
            feedArray[0] = (sensorDataArray[0] + 2) / 4;
            feedArray[1] = (sensorDataArray[1] + 2) / 4;
            feedArray[2] = (sensorDataArray[2] + 2) / 4;
            feedArray[3] = sensorDataArray[5] / 360;

            feedArray[4] = sensorDataArray[6] / 360;
        }

        if ((selectNN == 1 && NN1NumInputs == 3) || (selectNN == 2 && NN2NumInputs == 3)) { */
            feedArray[0] = sensorDataArray[0];
            feedArray[1] = sensorDataArray[1];
            feedArray[2] = sensorDataArray[2];
            feedArray[3] = sensorDataArray[3];
            feedArray[4] = sensorDataArray[4];
            feedArray[5] = sensorDataArray[5];
 //       }

        // use trained NN or loaded NN
        if (haveNNFlag1 && activeNNFlag1 && selectNN == 1) {
            scoreArray = neuralNet.activate(feedArray);
        } /*else if (loadNNFlag && selectNN == 1) {
            scoreArray = neuralNetwork1(feedArray);
        }*/

        if (haveNNFlag2 && activeNNFlag2 && selectNN == 2) {
            scoreArray = neuralNet2.activate(feedArray);
        } /* else if (loadNNFlag && selectNN == 2) {
            scoreArray = neuralNetwork2(feedArray);
        } */

        displayScore = scoreArray[0].toFixed(4) * 100;
        displayScore = displayScore.toFixed(2);

        if (selectNN == 1) {
            console.log("NN1 FEED ARRAY: " + feedArray);
            console.log("NN1 SCORE ARRAY: " + scoreArray);
            $(".message-nn1-score").html(displayScore + '%');
            var rawLineNN1Chart = scoreArray[0].toFixed(4);
            rawLineNN1Chart = (rawLineNN1Chart / 3) + 0.8;
            lineNN1.append(timeStamp, rawLineNN1Chart);

        } else if (selectNN == 2) {
            console.log("NN2 FEED ARRAY: " + feedArray);
            console.log("NN2 SCORE ARRAY: " + scoreArray);
            $(".message-nn2-score").html(displayScore + '%');
            var rawLineNN2Chart = scoreArray[0].toFixed(4);
            rawLineNN2Chart = (rawLineNN2Chart / 3) + 0.8;
            lineNN2.append(timeStamp, rawLineNN2Chart);
        }
    }



    /**************************** TRAIN NN ******************************/
    function trainNN(selectNN) {
        //'2:1', '2:5:1', '2:5:5:1', '3:1', '3:5:1', '3:5:5:1', '5:5:1', '5:7:7:1'
        //  var processedDataSession = sensorDataSession;
        var processedDataSession = new Array;
        var falseDataArray = new Array;
        var trueDataArray = new Array;
        var combinedTrueFalse = new Array(13).fill(0);
        trainingData = new Array;

        var rawNNArchitecture = $(".range-slider__value.nn-architecture").html();

        /**************** SET NUMBER OF NN INPUTS *************************/
     //   var numInputs = parseInt(rawNNArchitecture.charAt(0));
        var numInputs = 3;

     //   nnRate = $("#rate-input").val();
        nnRate = 0.6;
      //  nnIterations = $("#iterations-input").val();
        nnIterations = 5000;
      //  nnError = $("#error-input").val();
        nnError = 0.6;

        if (selectNN == 1) {
            trueDataArray = NN1TrueDataArray;
            falseDataArray = NN1FalseDataArray;
        } else if (selectNN == 2) {
            trueDataArray = NN2TrueDataArray;
            falseDataArray = NN2FalseDataArray;
        }

        //combine true and false data
        for (var j = 0; j < trueDataArray.length; j++) {
            combinedTrueFalse = trueDataArray[j];
            combinedTrueFalse[12] = 1; //true
            processedDataSession.push(combinedTrueFalse);
        }
        for (var k = 0; k < falseDataArray.length; k++) {
            combinedTrueFalse = falseDataArray[k];
            combinedTrueFalse[12] = 0; //false
            processedDataSession.push(combinedTrueFalse);
        }

        

        var getArchitect;
      /*  if (rawNNArchitecture == '2:1') {
            getArchitect = new Architect.LSTM(2, 1);
        } else if (rawNNArchitecture == '2:5:1') {
            getArchitect = new Architect.LSTM(2, 5, 1);
        } else if (rawNNArchitecture == '2:5:5:1') {
            getArchitect = new Architect.LSTM(2, 5, 5, 1);
        } else if (rawNNArchitecture == '3:1') {
            getArchitect = new Architect.LSTM(3, 1);
        } else if (rawNNArchitecture == '3:5:1') {
            getArchitect = new Architect.LSTM(3, 5, 1); 
        } else if (rawNNArchitecture == '3:5:5:1') { */
            getArchitect = new Architect.LSTM(6, 5, 5, 1);
   /*     } else if (rawNNArchitecture == '5:1') {
            getArchitect = new Architect.LSTM(5, 1);
        } else if (rawNNArchitecture == '5:5:1') {
            getArchitect = new Architect.LSTM(5, 5, 1);
        } else if (rawNNArchitecture == '5:7:7:1') {
            getArchitect = new Architect.LSTM(5, 7, 7, 1);
        } */

        if (selectNN == 1) {
            neuralNet = getArchitect;
            NN1Architecture = rawNNArchitecture;
            NN1NumInputs = numInputs;
            trainer = new Trainer(neuralNet);
        } else {
            neuralNet2 = getArchitect;
            NN2Architecture = rawNNArchitecture;
            NN2NumInputs = numInputs;
            trainer2 = new Trainer2(neuralNet2);
        }

        //   console.log("raw NN architecture: " + rawNNArchitecture);

        //  console.log("SIZE OF UNPROCESSED SESSION DATA: " + processedDataSession.length);

        for (var i = 0; i < processedDataSession.length; i++) {

            var currentSample = processedDataSession[i];
            var outputArray = new Array(1).fill(0);
            var inputArray = new Array(2).fill(0);

            outputArray[0] = currentSample[12]; //true or false

    /*        if (numInputs == 5) {
                inputArray[0] = (currentSample[0] + 2) / 4;
                inputArray[1] = (currentSample[1] + 2) / 4;
                inputArray[2] = (currentSample[2] + 2) / 4;
                inputArray[3] = currentSample[3] / 360;
                inputArray[4] = currentSample[4] / 360;
            } else if (numInputs == 3) { */
                inputArray[0] = (currentSample[0]);
                inputArray[1] = (currentSample[1]);
                inputArray[2] = (currentSample[2]);

                inputArray[3] = (currentSample[3]);
                inputArray[4] = (currentSample[4]);
                inputArray[5] = (currentSample[5]);

        /*    } else if (numInputs == 2) {
                inputArray[0] = currentSample[3] / 360;
                inputArray[1] = currentSample[4] / 360;
            } */

            trainingData.push({
                input: inputArray,
                output: outputArray
            });

            console.log("*********************************************************************************************************");
            console.log(currentSample + " TRAINING INPUT: " + inputArray + "  --> NN# " + selectNN);
            console.log(currentSample + " TRAINING OUTPUT: " + outputArray + "  --> NN# " + selectNN);
        }


        if (selectNN == 1) {
            console.log("TRAINING ON selectNN1 --> interations:" + nnIterations + "  error:" + nnError + "  rate:" + nnRate + "  arch:" + rawNNArchitecture + "  inputs:" + numInputs);

            trainer.train(trainingData, {
                rate: nnRate,
                //   iterations: 15000,
                iterations: nnIterations,
                error: nnError,
                shuffle: true,
                //   log: 1000,
                log: 5,
                cost: Trainer.cost.CROSS_ENTROPY
            });

            //we have a trained NN to use
            haveNNFlag1 = true;
            trainNNFlag1 = false;
            $('#activate-btn').addClass("haveNN");
            $('#export-btn').addClass("haveNN");

        } else if (selectNN == 2) {
            console.log("TRAINING ON selectNN2");

            trainer2.train(trainingData, {
                rate: nnRate,
                //   iterations: 15000,
                iterations: nnIterations,
                error: nnError,
                shuffle: true,
                //   log: 1000,
                log: 5,
                cost: Trainer2.cost.CROSS_ENTROPY
            });

            //we have a trained NN to use
            haveNNFlag2 = true;
            trainNNFlag2 = false;
            $('#activate2-btn').addClass("haveNN");
            $('#export2-btn').addClass("haveNN");
        }
    }


    /*******************************************************************************************************************
     ******************************************* NEURAL NETWORK BUTTONS *************************************************
     ********************************************************************************************************************/
    $('#train-btn').click(function() {
        console.log("train button 1");
        trainNNFlag1 = true;
        trainNN(1);
    });

    $('#activate-btn').click(function() {
        console.log("activate button");
        activeNNFlag1 = true;
        $('#activate-btn').toggleClass("activatedNN");

        //if loaded NN, turn off
     /*   if (loadNNFlag) {
            loadNNFlag = false;
            $('#load-nn-btn').toggleClass("activatedNN");
        } */
    });

    $('#train2-btn').click(function() {
        console.log("train button 2");
        trainNNFlag2 = true;
        trainNN(2);
    });

    $('#activate2-btn').click(function() {
        console.log("activate button");
        activeNNFlag2 = true;
        $('#activate2-btn').toggleClass("activatedNN");

        //if leaded NN, turn off
     /*   if (loadNNFlag) {
            loadNNFlag = false;
            $('#load-nn-btn').toggleClass("activatedNN");
        } */
    });


    /*******************************************************************************************************************
     ********************************** COLLECT, PRINT, LOAD BUTTON ACTIONS *********************************************
     ********************************************************************************************************************/

    /*************** COLLECT SAMPLE - SONSOR AND MODEL DATA - STORE IN GSHEET AND ADD TO NN TRAINING OBJECT *****************/
    $('#collect-true-1').click(function() {
        //how many samples for this set?
        /************** CONTROL NUMBER OF SAMPLES COLLECTED **********/
       // getSamplesFlag = $('input.sample-size').val();
       getSamplesFlag = 20;
        getSamplesTypeFlag = 1;
        console.log("Collect btn NN1T #samples flag: " + getSamplesFlag);
    });

    $('#collect-false-1').click(function() {
        //how many samples for this set?
             /************** CONTROL NUMBER OF SAMPLES COLLECTED **********/
        //this flag is applied in the bluetooth data notification function
      //  getSamplesFlag = $('input.sample-size').val();
      getSamplesFlag = 20;
        getSamplesTypeFlag = 2;
        console.log("Collect btn NN1F #samples flag: " + getSamplesFlag);
    });

    $('#collect-true-2').click(function() {
        //how many samples for this set?
         /************** CONTROL NUMBER OF SAMPLES COLLECTED **********/
      //  getSamplesFlag = $('input.sample-size').val();
      getSamplesFlag = 20;
        //this flag is applied in the bluetooth data notification function
        getSamplesTypeFlag = 3;
        console.log("Collect btn NN2T #samples flag: " + getSamplesFlag);
    });

    $('#collect-false-2').click(function() {
        //how many samples for this set?
         /************** CONTROL NUMBER OF SAMPLES COLLECTED **********/
     //   getSamplesFlag = $('input.sample-size').val();
     getSamplesFlag = 20;
        //this flag is applied in the bluetooth data notification function
        getSamplesTypeFlag = 4;
        console.log("Collect btn NN2F #samples flag: " + getSamplesFlag);
    });

    $('#clear-1').click(function() {
        NN1TrueDataArray = new Array;
        NN1FalseDataArray = new Array;
        sensorDataArray = new Array(18).fill(0);
        sensorDataSession = new Array;
        updateSampleCountDisplay();
        $("#dump-print").html("");
        console.log("Clear NN1 Data");
    });

    $('#clear-2').click(function() {
        NN2TrueDataArray = new Array;
        NN2FalseDataArray = new Array;
        sensorDataArray = new Array(18).fill(0);
        sensorDataSession = new Array;
        updateSampleCountDisplay();
        $("#dump-print").html("");
        console.log("Clear NN2 Data");
    });

}); // end on document load
//}