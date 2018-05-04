// Program used to test the USB Joystick object on the 
// Arduino Leonardo or Arduino Micro.
//
// Matthew Heironimus
// 2015-03-28 - Original Version
// 2015-11-18 - Updated to use the new Joystick library 
//              written for Arduino IDE Version 1.6.6 and
//              above.
// 2016-05-13   Updated to use new dynamic Joystick library
//              that can be customized.
//------------------------------------------------------------
#include <math.h>
#include "Joystick.h"

#include <Brain.h>

bool includeXAxis = true;
bool includeYAxis = true;
bool includeZAxis = true;

bool includeRxAxis = true;
bool includeRyAxis = true;
bool includeRzAxis = true;


// Create Joystick
Joystick_ Joystick;
/*
Joystick_ Joystick(JOYSTICK_DEFAULT_REPORT_ID,JOYSTICK_TYPE_GAMEPAD,
  1, 0,                  // Button Count, Hat Switch Count
  true, true, true,     // X and Y, Z Axis
  true, true, true,   //   Rx, Ry, and Rz
  true, true,          // Rudder and Throttle
  true, true, true);  // No accelerator, brake, or steering
  */




// Set up the brain parser, pass it the hardware serial object you want to listen on.
//Brain brain(Serial);
Brain brain(Serial1);
byte Attention = 1;
byte Meditation = 1;
/*
unsigned long Delta = 1;
unsigned long Theta = 1;
unsigned long LowAlpha = 1;
unsigned long HighAlpha = 1;
unsigned long LowBeta = 1;
unsigned long HighBeta = 1;
unsigned long LowGamma = 1;
unsigned long MidGamma = 1; */
float eegData[8];



// Set to true to test "Auto Send" mode or false to test "Manual Send" mode.
//const bool testAutoSendMode = true;
const bool testAutoSendMode = false;

const unsigned long gcCycleDelta = 1000;
const unsigned long gcAnalogDelta = 25;
const unsigned long gcButtonDelta = 500;
unsigned long gNextTime = 0;
unsigned int gCurrentStep = 0;

void setup() {

  // Set Range Values
  /*
  Joystick.setXAxisRange(0, 6);
  Joystick.setYAxisRange(0, 6);
  Joystick.setZAxisRange(0, 6);
  Joystick.setRxAxisRange(0, 6);
  Joystick.setRyAxisRange(0, 6);
  Joystick.setRzAxisRange(0, 6);
  */
 /*   Joystick.setThrottleRange(0, 6);
  Joystick.setRudderRange(0, 6);
  Joystick.setAcceleratorRange(0, 6);
  Joystick.setBrakeRange(0, 6);
  Joystick.setSteeringRange(0, 6); */
  

  Joystick.setXAxisRange(0, 100); // default 0 to 1023 
  Joystick.setYAxisRange(0, 100);
  Joystick.setZAxisRange(0, 100);
  Joystick.setRxAxisRange(0, 360);
  Joystick.setRyAxisRange(360, 0);
  Joystick.setRzAxisRange(0, 720);
  
  /*Joystick.setThrottleRange(0, 255);
  Joystick.setRudderRange(255, 0);
  Joystick.setAcceleratorRange(0, 260);
  Joystick.setBrakeRange(0, 260);
  Joystick.setSteeringRange(0, 300); */
  
  
  if (testAutoSendMode)
  {
    Joystick.begin();
  }
  else
  {
    Joystick.begin(false);
  }
  
  pinMode(A0, INPUT_PULLUP);
  pinMode(13, OUTPUT);

    Serial.begin(9600); // Leonardo's USB
    Serial1.begin(9600); // Leonardo's TX/RX pins
}

void loop() {
  Serial.print("*");
      // Expect packets about once per second.
    // The .readCSV() function returns a string (well, char*) listing the most recent brain data, in the following format:
    // "signal strength, attention, meditation, delta, theta, low alpha, high alpha, low beta, high beta, low gamma, high gamma"
    if (brain.update()) {
        Serial.println(brain.readErrors());
   //     Serial.println(brain.readCSV());
   /*     Delta = brain.readDelta();
        Theta = brain.readTheta();
        LowAlpha = brain.readLowAlpha();
        HighAlpha = brain.readHighAlpha();
        LowBeta = brain.readLowBeta();
        HighBeta = brain.readHighBeta();
        LowGamma = brain.readLowGamma();
        MidGamma = brain.readMidGamma();  */

     //   Attention = brain.readAttention();
     //   Meditation = brain.readMeditation();
     float   Delta = min(log10(max(1e-3, brain.readDelta())),7)/7;
     float   Theta = min(log10(max(1e-3,brain.readTheta())),7)/7;
     float   LowAlpha = min(max(1e-3,log10(brain.readLowAlpha())),7)/7;
     float   HighAlpha = min(max(1e-3,log10(brain.readHighAlpha())),7)/7; 
     float   LowBeta = min(max(1e-3,log10(brain.readLowBeta())),7)/7; 
     float   HighBeta = min(max(1e-3,log10(brain.readHighBeta())),7)/7; 
     float   LowGamma = min(max(1e-3,log10(brain.readLowGamma ())),7)/7; 
     float   MidGamma = min(max(1e-3,log10(brain.readMidGamma ())),7)/7; 

                Serial.print( brain.readDelta() ); Serial.print("  ");
        Serial.print( brain.readTheta() ); Serial.print("  ");
        Serial.println( brain.readLowAlpha() ); 

    //    Serial.print(Attention); Serial.print("  ");
   //     Serial.print(Meditation); Serial.print("  ");
        Serial.print(Delta); Serial.print("  ");
        Serial.print(Theta); Serial.print("  ");
        Serial.println(LowAlpha); 
     //            Serial.print(eegData[0]); Serial.print("  ");
   //     Serial.print(eegData[1]); Serial.print("  ");
   //     Serial.println(eegData[2]); 
   
    Joystick.setXAxis(Delta * 100);
    Joystick.setYAxis(Theta * 100);
    Joystick.setZAxis(LowAlpha * 100);
    Joystick.setRxAxis(HighAlpha * 360);
    Joystick.setRyAxis(LowBeta * 360);
    Joystick.setRzAxis(HighBeta * 720); 
    }
    /*
    eegData[0] = Delta * 100;
    eegData[1] = (Theta) * 100;
    eegData[2] = (LowAlpha) * 100;
    eegData[3] = (HighAlpha) * 360;
    eegData[4] = (LowBeta) * 360;
    eegData[5] = (HighBeta) * 720;
    eegData[6] = (LowGamma);
    eegData[7] = (MidGamma); 
    */



    

/*
    eegData[0] = log10(Delta);
    eegData[1] = log10(Theta);
    eegData[2] = log10(LowAlpha);
    eegData[3] = log10(HighAlpha);
    eegData[4] = log10(LowBeta);
    eegData[5] = log10(HighBeta);
    eegData[6] = log10(LowGamma);
    eegData[7] = log10(MidGamma);
    */
    
        /*
    for(int i; i < 8; i++){
      if(eegData[i] > 10000 && eegData[i] != 0){
        eegData[i] = eegData[i] / 400;
        Joystick.pressButton(i);
      } else {
        eegData[i] = eegData[i] / 2.1;
        Joystick.releaseButton(i);
      }
      if(eegData[i] > 4999){eegData[i] = 4999;}
    }
    */


    /*
            Joystick.setXAxis(2*Delta-1); 
        Joystick.setYAxis(2*Theta-1); 
        Joystick.setZAxis(2*LowAlpha-1); 

        // values of axis are dependent on both setX and setRx
        Joystick.setRxAxis(HighAlpha*360);
        Joystick.setRyAxis(LowBeta*360);
        Joystick.setRzAxis(2*HighBeta*360);
        */
  
   /*     Joystick.setThrottle(255*LowGamma);
        Joystick.setRudder(255*MidGamma);   

        // lower frequencies are represented twice
        Joystick.setAccelerator(260*Delta);   
        Joystick.setBrake(260*Theta);
        Joystick.setSteering(260*LowAlpha); */

//Joystick.setXAxis(5000);
   
    if (testAutoSendMode == false)
    {
      Joystick.sendState();
    }
delay(10);
}
