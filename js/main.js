

var state = {};

/*******************************************************************************************************************
 *********************************************** INITIALIZE *********************************************************
 ********************************************************************************************************************/
 //keep track of which Mindflex EEG headset we are dealing with
var mindflexID = 0;
var mindflexid1 = 999;
var mindflexid2 = 999;

var jediScore = 0;
var sithScore = 0;
var jediNeural = 0;
var sithNeural = 0;


//sensor array sample data
var sensorDataArray = new Array(12).fill(0);
var sensorDataArray2 = new Array(12).fill(0);

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
var getSamplesFlag2 = 0;
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
// Joystick var
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

var xJoystickDelta = 0;
var yJoystickDelta = 0;
var zJoystickDelta = 0;
var rxJoystickDelta = 0;
var ryJoystickDelta = 0;
var rzJoystickDelta = 0;

var xJoystick2 = 0;
var yJoystick2 = 0;
var zJoystick2 = 0;
var rxJoystick2 = 0;
var ryJoystick2 = 0;
var rzJoystick2 = 0;

var xJoystickOld2 = 0;
var yJoystickOld2 = 0;
var zJoystickOld2 = 0;
var rxJoystickOld2 = 0;
var ryJoystickOld2 = 0;
var rzJoystickOld2 = 0;

var xJoystickDelta2 = 0;
var yJoystickDelta2 = 0;
var zJoystickDelta2 = 0;
var rxJoystickDelta2 = 0;
var ryJoystickDelta2 = 0;
var rzJoystickDelta2 = 0;



//Streaming time series chart var - smoothie.js
var xJoystickLine, yJoystickLine, zJoystickLine, rxJoystickLine, ryJoystickLine, rzJoystickLine, zJoystickDeltaLine, ryJoystickDeltaLine , lineNN1, lineNN2;
var xJoystickChart, yJoystickChart, zJoystickChart, rxJoystickChart, ryJoystickChart, rzJoystickChart, zJoystickDeltaChart, ryJoystickDeltaChart; 

var xJoystickLine2, yJoystickLine2, zJoystickLine2, rxJoystickLine2, ryJoystickLine2, rzJoystickLine2, zJoystickDeltaLine2, ryJoystickDeltaLine2;
var xJoystickChart2, yJoystickChart2, zJoystickChart2, rxJoystickChart2, ryJoystickChart2, rzJoystickChart2, zJoystickDeltaChart2, ryJoystickDeltaChart2; 
//add smoothie.js time series streaming data chart
var chartHeight = 120;
var chartWidth = $(window).width();

$(document).ready(function() {

    /*******************************************************************************************************************
    **************************************** STREAMING SENSOR DATA CHART ***********************************************
    *******************************************************************************************************************/

    $("#streaming-data-chart").html('<canvas id="chart-canvas" width="' + chartWidth + '" height="' + chartHeight + '"></canvas>');

    var streamingChart = new SmoothieChart({/*  grid: { strokeStyle:'rgb(125, 0, 0)', fillStyle:'rgb(60, 0, 0)', lineWidth: 1, millisPerLine: 250, verticalSections: 6, }, labels: { fillStyle:'rgb(60, 0, 0)' } */ });

    streamingChart.streamTo(document.getElementById("chart-canvas"), 900 /*delay*/ );

  //  xJoystickLine = new TimeSeries();
    yJoystickLine = new TimeSeries();
    zJoystickLine = new TimeSeries();
  //  rxJoystickLine = new TimeSeries();
    ryJoystickLine = new TimeSeries();
 //   rzJoystickLine = new TimeSeries();
  //  zJoystickDeltaLine = new TimeSeries();  //low alpha
  //  ryJoystickDeltaLine = new TimeSeries();  //low beta

 //   xJoystickLine2 = new TimeSeries();
    yJoystickLine2 = new TimeSeries();
    zJoystickLine2 = new TimeSeries();
 //   rxJoystickLine2 = new TimeSeries();
    ryJoystickLine2 = new TimeSeries();
 //   rzJoystickLine2 = new TimeSeries();
  //  zJoystickDeltaLine2 = new TimeSeries();  //low alpha
  //  ryJoystickDeltaLine2 = new TimeSeries();  //low beta

    lineNN1 = new TimeSeries();
    lineNN2 = new TimeSeries();

  //  streamingChart.addTimeSeries(xJoystickLine,         {strokeStyle: 'rgb(47, 86, 233)', lineWidth: 3 });
    streamingChart.addTimeSeries(yJoystickLine,         {strokeStyle: 'rgb(45, 100, 245)',   lineWidth: 3 });
    streamingChart.addTimeSeries(zJoystickLine,         {strokeStyle: 'rgb(47, 141, 255)',   lineWidth: 3 });
 //   streamingChart.addTimeSeries(rxJoystickLine,        {strokeStyle: 'rgb(52, 204, 255)', lineWidth: 3 });
    streamingChart.addTimeSeries(ryJoystickLine,        {strokeStyle: 'rgb(23, 236, 236)', lineWidth: 3 });
//    streamingChart.addTimeSeries(rzJoystickLine,        {strokeStyle: 'rgb(168, 255, 255)', lineWidth: 3 });
 //   streamingChart.addTimeSeries(zJoystickDeltaLine,    {strokeStyle: 'rgb(48, 129, 238)', lineWidth: 3 });
 //   streamingChart.addTimeSeries(ryJoystickDeltaLine,   {strokeStyle: 'rgb(174, 234, 255)', lineWidth: 3 });

 //   streamingChart.addTimeSeries(xJoystickLine2,        {strokeStyle: 'rgb(128, 0, 0)', lineWidth: 3 });
    streamingChart.addTimeSeries(yJoystickLine2,        {strokeStyle: 'rgb(178, 34, 34)',   lineWidth: 3 });
    streamingChart.addTimeSeries(zJoystickLine2,        {strokeStyle: 'rgb(220, 20, 60)',   lineWidth: 3 });
  //  streamingChart.addTimeSeries(rxJoystickLine2,       {strokeStyle: 'rgb(255, 0, 0)', lineWidth: 3 });
    streamingChart.addTimeSeries(ryJoystickLine2,       {strokeStyle: 'rgb(250, 128, 114)', lineWidth: 3 });
  //  streamingChart.addTimeSeries(rzJoystickLine2,       {strokeStyle: 'rgb(240, 128, 128)', lineWidth: 3 });
 //   streamingChart.addTimeSeries(zJoystickDeltaLine2,   {strokeStyle: 'rgb(128, 10, 20)', lineWidth: 3 });
 //   streamingChart.addTimeSeries(ryJoystickDeltaLine2,  {strokeStyle: 'rgb(178, 40, 20)', lineWidth: 3 });

    streamingChart.addTimeSeries(lineNN1,   {strokeStyle: 'rgb(72, 244, 68)',   lineWidth: 4 });
    streamingChart.addTimeSeries(lineNN2,   {strokeStyle: 'rgb(244, 66, 66)',   lineWidth: 4 });

    //min/max streaming chart button
    $('#circleDrop').click(function() {

        $('.card-middle').slideToggle();
        $('.close').toggleClass('closeRotate');

        $('#saber-container1').toggleClass('hideSaber');
        $('#saber-container2').toggleClass('hideSaber');

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

    //    var rudderJoystickElement =    document.getElementsByClassName('joystick-rudder-data')[0];
    //    var throttleJoystickElement =    document.getElementsByClassName('joystick-throttle-data')[0];


        xJoystickElement.innerHTML =      Math.pow(10, (sensorDataArray[0] * 5) ).toFixed(2);
        yJoystickElement.innerHTML =      Math.pow(10, (sensorDataArray[1] * 5) ).toFixed(2);
        zJoystickElement.innerHTML =      Math.pow(10, (sensorDataArray[2] * 5) ).toFixed(2);

        rxJoystickElement.innerHTML =      Math.pow(10, (sensorDataArray[3] * 5) ).toFixed(2);
        ryJoystickElement.innerHTML =      Math.pow(10, (sensorDataArray[4] * 5) ).toFixed(2);
        rzJoystickElement.innerHTML =      Math.pow(10, (sensorDataArray[5] * 5) ).toFixed(2);

  //      rudderJoystickElement =      Math.pow(10, (sensorDataArray[6] * 5) ).toFixed(2);
   //     throttleJoystickElement =      Math.pow(10, (sensorDataArray[7] * 5) ).toFixed(2);

//MINDFLEX #2
        var xJoystickElement2 =    document.getElementsByClassName('joystick-x-data2')[0];
        var yJoystickElement2 =    document.getElementsByClassName('joystick-y-data2')[0];
        var zJoystickElement2 =    document.getElementsByClassName('joystick-z-data2')[0];

        var rxJoystickElement2 =    document.getElementsByClassName('joystick-rx-data2')[0];
        var ryJoystickElement2 =    document.getElementsByClassName('joystick-ry-data2')[0];
        var rzJoystickElement2 =    document.getElementsByClassName('joystick-rz-data2')[0];

       // var rudderJoystickElement2 =    document.getElementsByClassName('joystick-rudder-data2')[0];
      //  var throttleJoystickElement2 =    document.getElementsByClassName('joystick-throttle-data2')[0];


        xJoystickElement2.innerHTML =      Math.pow(10, (sensorDataArray2[0] * 5) ).toFixed(2);
        yJoystickElement2.innerHTML =      Math.pow(10, (sensorDataArray2[1] * 5) ).toFixed(2);
        zJoystickElement2.innerHTML =      Math.pow(10, (sensorDataArray2[2] * 5) ).toFixed(2);

        rxJoystickElement2.innerHTML =      Math.pow(10, (sensorDataArray2[3] * 5) ).toFixed(2);
        ryJoystickElement2.innerHTML =      Math.pow(10, (sensorDataArray2[4] * 5) ).toFixed(2);
        rzJoystickElement2.innerHTML =      Math.pow(10, (sensorDataArray2[5] * 5) ).toFixed(2);

      //  rudderJoystickElement2 =      Math.pow(10, (sensorDataArray2[6] * 5) ).toFixed(2);
      //  throttleJoystickElement2 =      Math.pow(10, (sensorDataArray2[7] * 5) ).toFixed(2);

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

                sensorDataArray[0] = xJoystick.toFixed(5);
                sensorDataArray[1] = yJoystick.toFixed(5); //theta
                sensorDataArray[2] = zJoystick.toFixed(5); //low alpha
                sensorDataArray[3] = rxJoystick.toFixed(5);
                sensorDataArray[4] = ryJoystick.toFixed(5); //low beta
                sensorDataArray[5] = rzJoystick.toFixed(5);

                sensorDataArray[6] = yJoystickDelta.toFixed(5);  //theta
				sensorDataArray[7] = zJoystickDelta.toFixed(5);  //low alpha
				sensorDataArray[8] = ryJoystickDelta.toFixed(5); //low beta
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

            //    rudderJoystickChart = ((sensorDataArray[6] + 1) / 2);
            //    throttleJoystickChart = ((sensorDataArray[7] + 1) / 2);


                //sensor values in bottom 2/3 of chart , 1/10 height each
                xJoystickChart = (xJoystickChart / 2) + 3 * 0.1;
                yJoystickChart = (yJoystickChart / 2) + 2.5 * 0.1;
                zJoystickChart = (zJoystickChart / 2) + 2 * 0.1;

                rxJoystickChart = (rxJoystickChart / 2) + 1.5 * 0.1;
                ryJoystickChart = (ryJoystickChart / 2) + 1 * 0.1;
                rzJoystickChart = (rzJoystickChart / 2) + 0.5 * 0.1;

          //      zJoystickDeltaChart = (zJoystickDeltaChart / 2) + 1 * 0.1;
          //      ryJoystickDeltaChart = (ryJoystickDeltaChart / 2) + 0.5 * 0.1;


           //     xJoystickLine.append(timeStamp, xJoystickChart);
                yJoystickLine.append(timeStamp, yJoystickChart);
                zJoystickLine.append(timeStamp, zJoystickChart);

            //    rxJoystickLine.append(timeStamp, rxJoystickChart);
                ryJoystickLine.append(timeStamp, ryJoystickChart);
             //   rzJoystickLine.append(timeStamp, rzJoystickChart);

           //     zJoystickDeltaLine.append(timeStamp, zJoystickDeltaChart);
           //     ryJoystickDeltaLine.append(timeStamp, ryJoystickDeltaChart);


           //     rudderJoystickLine.append(timeStamp, rudderJoystickChart);
           //     throttleJoystickLine.append(timeStamp, throttleJoystickChart);

             //   linePitch.append(timeStamp, rawPitchChart);
             //   lineRoll.append(timeStamp, rawRollChart);

                //have the values been updated?
                if(xJoystick.toFixed(3) != xJoystickOld.toFixed(3) 
                    && yJoystick.toFixed(3) != yJoystickOld.toFixed(3) 
                    && zJoystick.toFixed(3) != zJoystickOld.toFixed(3)
                    && rxJoystick.toFixed(3) != rxJoystickOld.toFixed(3)
                    && ryJoystick.toFixed(3) != ryJoystickOld.toFixed(3)){

                    xJoystickDelta = (xJoystickOld - xJoystick + 1) / 2 ;
                    yJoystickDelta = (yJoystickOld - yJoystick + 1) / 2 ;
                    zJoystickDelta = (zJoystickOld - zJoystick + 1) / 2 ;
                    rxJoystickDelta = (rxJoystickOld - rxJoystick + 1) / 2 ;
                    ryJoystickDelta = (ryJoystickOld - ryJoystick + 1) / 2 ;
                    rzJoystickDelta = (rzJoystickOld - rzJoystick + 1) / 2 ;

                    console.log("Delta: " + yJoystickDelta + "  " + zJoystickDelta + "  " + ryJoystickDelta)

                    xJoystickOld = xJoystick;
                    yJoystickOld = yJoystick;
                    zJoystickOld = zJoystick;

                    rxJoystickOld = rxJoystick;
                    ryJoystickOld = ryJoystick;
                    rzJoystickOld = rzJoystick;

                 //   rudderJoystickOld = rudderJoystick;
                 //   throttleJoystickOld = throttleJoystick;



                    //add new values to NN training data
                    if (getSamplesFlag > 0) {
                        collectData();
                    } else if (trainNNFlag1 || trainNNFlag2) {
                        //don't do anything
                    } 
                    if (haveNNFlag1 && activeNNFlag1){
                        jediScore = Number(jediScore) + Number(jediNeural);
                        jediScore = jediScore.toFixed(1);
                        $(".score-player1").html("<span class='player-label'>&nbsp;&nbsp;&nbsp;</span>Jedi Score: <span class='player1-score'>" + jediScore + "</span>");
                        console.log("jediNeural: " + jediNeural);
                    }

                } 

/**********************************************************************************************
********************************MINDFLEX NUMBER TWO********************************************
**********************************************************************************************/
                //load data into global array
                sensorDataArray2 = new Array(12).fill(0);

                sensorDataArray2[0] = xJoystick2.toFixed(5);
                sensorDataArray2[1] = yJoystick2.toFixed(5); //theta
                sensorDataArray2[2] = zJoystick2.toFixed(5); //low alpha
                sensorDataArray2[3] = rxJoystick2.toFixed(5);
                sensorDataArray2[4] = ryJoystick2.toFixed(5); //low beta
                sensorDataArray2[5] = rzJoystick2.toFixed(5);

                sensorDataArray2[6] = yJoystickDelta2.toFixed(5);  //theta
                sensorDataArray2[7] = zJoystickDelta2.toFixed(5);  //low alpha
                sensorDataArray2[8] = ryJoystickDelta2.toFixed(5); //low beta
                sensorDataArray2[9] = 0;
                sensorDataArray2[10] = 0;

                sensorDataArray2[11] = timeStamp;


                //update time series chart
                xJoystickChart2 = ((sensorDataArray2[0] + 1) / 2);
                yJoystickChart2 = ((sensorDataArray2[1] + 1) / 2);
                zJoystickChart2 = ((sensorDataArray2[2] + 1) / 2);

                rxJoystickChart2 = ((sensorDataArray2[3] + 1) / 2);
                ryJoystickChart2 = ((sensorDataArray2[4] + 1) / 2);
                rzJoystickChart2 = ((sensorDataArray2[5] + 1) / 2);

            //    rudderJoystickChart = ((sensorDataArray[6] + 1) / 2);
            //    throttleJoystickChart = ((sensorDataArray[7] + 1) / 2);


                //sensor values in bottom 2/3 of chart , 1/10 height each
                xJoystickChart2 = (xJoystickChart2 / 2) + 3 * 0.1;
                yJoystickChart2 = (yJoystickChart2 / 2) + 2.5 * 0.1;
                zJoystickChart2 = (zJoystickChart2 / 2) + 2 * 0.1;

                rxJoystickChart2 = (rxJoystickChart2 / 2) + 1.5 * 0.1;
                ryJoystickChart2 = (ryJoystickChart2 / 2) + 1 * 0.1;
                rzJoystickChart2 = (rzJoystickChart2 / 2) + 0.5 * 0.1;

          //      zJoystickDeltaChart2 = (zJoystickDeltaChart2 / 2) + 1 * 0.1;
         //       ryJoystickDeltaChart2 = (ryJoystickDeltaChart2 / 2) + 0.5 * 0.1;


            //    xJoystickLine2.append(timeStamp, xJoystickChart2);
                yJoystickLine2.append(timeStamp, yJoystickChart2);
                zJoystickLine2.append(timeStamp, zJoystickChart2);

            //    rxJoystickLine2.append(timeStamp, rxJoystickChart2);
                ryJoystickLine2.append(timeStamp, ryJoystickChart2);
             //   rzJoystickLine2.append(timeStamp, rzJoystickChart2);

                            $(".gamepad-val-display.xjoystick").html("X1: <span>" + xJoystick.toFixed(5) + "</span");
            $(".gamepad-val-display.yjoystick").html("Y1: <span>" + yJoystick.toFixed(5) + "</span");
            $(".gamepad-val-display.zjoystick").html("Z1: <span>" + zJoystick.toFixed(5) + "</span");

            $(".gamepad-val-display.rxjoystick").html("rX1: <span>" + rxJoystick.toFixed(5) + "</span");
            $(".gamepad-val-display.ryjoystick").html("rY1: <span>" + ryJoystick.toFixed(5) + "</span");
            $(".gamepad-val-display.rzjoystick").html("rZ1: <span>" + rzJoystick.toFixed(5) + "</span");


                //have the values been updated?
                if(xJoystick2.toFixed(3) != xJoystickOld2.toFixed(3) 
                    && yJoystick2.toFixed(3) != yJoystickOld2.toFixed(3) 
                    && zJoystick2.toFixed(3) != zJoystickOld2.toFixed(3)
                    && rxJoystick2.toFixed(3) != rxJoystickOld2.toFixed(3)
                    && ryJoystick2.toFixed(3) != ryJoystickOld2.toFixed(3)){

                    xJoystickDelta2 = (xJoystickOld2 - xJoystick2 + 1) / 2 ;
                    yJoystickDelta2 = (yJoystickOld2 - yJoystick2 + 1) / 2 ;
                    zJoystickDelta2 = (zJoystickOld2 - zJoystick2 + 1) / 2 ;
                    rxJoystickDelta2 = (rxJoystickOld2 - rxJoystick2 + 1) / 2 ;
                    ryJoystickDelta2 = (ryJoystickOld2 - ryJoystick2 + 1) / 2 ;
                    rzJoystickDelta2 = (rzJoystickOld2 - rzJoystick2 + 1) / 2 ;

                    console.log("Delta2: " + yJoystickDelta2 + "  " + zJoystickDelta2 + "  " + ryJoystickDelta2);

                    xJoystickOld2 = xJoystick2;
                    yJoystickOld2 = yJoystick2;
                    zJoystickOld2 = zJoystick2;

                    rxJoystickOld2 = rxJoystick2;
                    ryJoystickOld2 = ryJoystick2;
                    rzJoystickOld2 = rzJoystick2;

            $(".gamepad-val-display.xjoystick2").html("X2: <span>" + xJoystick2.toFixed(5) + "</span");
            $(".gamepad-val-display.yjoystick2").html("Y2: <span>" + yJoystick2.toFixed(5) + "</span");
            $(".gamepad-val-display.zjoystick2").html("Z2: <span>" + zJoystick2.toFixed(5) + "</span");

            $(".gamepad-val-display.rxjoystick2").html("rX2: <span>" + rxJoystick2.toFixed(5) + "</span");
            $(".gamepad-val-display.ryjoystick2").html("rY2: <span>" + ryJoystick2.toFixed(5) + "</span");
            $(".gamepad-val-display.rzjoystick2").html("rZ2: <span>" + rzJoystick2.toFixed(5) + "</span");



                    //add new values to NN training data
                    if (getSamplesFlag2 > 0) {
                        collectData2();
                    } else if (trainNNFlag1 || trainNNFlag2) {
                        //don't do anything
                    }
                    if (haveNNFlag2 && activeNNFlag2){
                        sithScore = Number(sithScore) + Number(sithNeural);
                        sithScore = sithScore.toFixed(1);
                        $(".score-player2").html("<span class='player-label'>&nbsp;&nbsp;&nbsp;</span>Sith Score: <span class='player2-score'>" + sithScore + "</span>");

                        console.log("sithNeural: " + sithNeural);
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



        }, 100); // throttle 100 = 10Hz limit
    


    function collectData() {
        var collectedDataArray = new Array(12).fill(0); //12 device 
        collectedDataArray = sensorDataArray;

        console.log("EEG data:");
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

    function collectData2() {
        var collectedDataArray = new Array(12).fill(0); //12 device 
        collectedDataArray = sensorDataArray2;

        console.log("EEG data:");
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
        getSamplesFlag2 = getSamplesFlag2 - 1;
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
    var neuralNet = new Architect.LSTM(6, 5, 5, 1);
    var trainer = new Trainer(neuralNet);
    var trainingData;

    // ************* NEURAL NET #2
    var Neuron2 = synaptic.Neuron;
    var Layer2 = synaptic.Layer;
    var Network2 = synaptic.Network;
    var Trainer2 = synaptic.Trainer;
    var Architect2 = synaptic.Architect;
    var neuralNet2 = new Architect2.LSTM(6, 5, 5, 1);
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

 //       }

        // use trained NN or loaded NN
        if (haveNNFlag1 && activeNNFlag1 && selectNN == 1) {

            feedArray[0] = sensorDataArray[1];
            feedArray[1] = sensorDataArray[2];
            feedArray[2] = sensorDataArray[4];
            feedArray[3] = sensorDataArray[6];
            feedArray[4] = sensorDataArray[7];
            feedArray[5] = sensorDataArray[8];

            scoreArray = neuralNet.activate(feedArray);
        } /*else if (loadNNFlag && selectNN == 1) {
            scoreArray = neuralNetwork1(feedArray);
        }*/

        if (haveNNFlag2 && activeNNFlag2 && selectNN == 2) {

            feedArray[0] = sensorDataArray2[1];
            feedArray[1] = sensorDataArray2[2];
            feedArray[2] = sensorDataArray2[4];
            feedArray[3] = sensorDataArray2[6];
            feedArray[4] = sensorDataArray2[7];
            feedArray[5] = sensorDataArray2[8];

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
            rawLineNN1Chart = (rawLineNN1Chart ) + 0.3;
            lineNN1.append(timeStamp, rawLineNN1Chart);

            jediNeural = displayScore;


        } else if (selectNN == 2) {
            console.log("NN2 FEED ARRAY: " + feedArray);
            console.log("NN2 SCORE ARRAY: " + scoreArray);
            $(".message-nn2-score").html(displayScore + '%');
            var rawLineNN2Chart = scoreArray[0].toFixed(4);
            rawLineNN2Chart = (rawLineNN2Chart ) + 0.3;
            lineNN2.append(timeStamp, rawLineNN2Chart);

            sithNeural = displayScore;
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
        var numInputs = 6;

     //   nnRate = $("#rate-input").val();
        nnRate = 0.6;
      //  nnIterations = $("#iterations-input").val();
        nnIterations = 100;
      //  nnError = $("#error-input").val();
        nnError = 0.1;

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

            inputArray[0] = (currentSample[1]);
            inputArray[1] = (currentSample[2]);
            inputArray[2] = (currentSample[4]);

            inputArray[3] = (currentSample[6]);
            inputArray[4] = (currentSample[7]);
            inputArray[5] = (currentSample[8]);

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
       getSamplesFlag = 50;
        getSamplesTypeFlag = 1;
        console.log("Collect btn NN1T #samples flag: " + getSamplesFlag);
    });

    $('#collect-false-1').click(function() {
        //how many samples for this set?
             /************** CONTROL NUMBER OF SAMPLES COLLECTED **********/
        //this flag is applied in the bluetooth data notification function
      //  getSamplesFlag = $('input.sample-size').val();
      getSamplesFlag = 50;
        getSamplesTypeFlag = 2;
        console.log("Collect btn NN1F #samples flag: " + getSamplesFlag);
    });

    $('#collect-true-2').click(function() {
        //how many samples for this set?
         /************** CONTROL NUMBER OF SAMPLES COLLECTED **********/
      //  getSamplesFlag = $('input.sample-size').val();
      getSamplesFlag2 = 50;
        //this flag is applied in the bluetooth data notification function
        getSamplesTypeFlag = 3;
        console.log("Collect btn NN2T #samples flag: " + getSamplesFlag);
    });

    $('#collect-false-2').click(function() {
        //how many samples for this set?
         /************** CONTROL NUMBER OF SAMPLES COLLECTED **********/
     //   getSamplesFlag = $('input.sample-size').val();
     getSamplesFlag2 = 50;
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

    $('#clear-game-scores').click(function() {
        jediScore = 0;
        sithScore = 0;
    });

    

}); // end on document load
//}