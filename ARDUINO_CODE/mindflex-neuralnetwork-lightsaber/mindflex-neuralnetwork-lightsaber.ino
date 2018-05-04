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



// Set up the brain parser, pass it the hardware serial object you want to listen on.
//Brain brain(Serial);
Brain brain(Serial1);

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
  
  Joystick.setXAxisRange(0,100); // default 0 to 1023 
  Joystick.setYAxisRange(0, 100);
  Joystick.setZAxisRange(0, 100);
  Joystick.setRxAxisRange(0, 360);
  Joystick.setRyAxisRange(360, 0);
  Joystick.setRzAxisRange(0, 720); 
  
  if (testAutoSendMode)
  {
    Joystick.begin();
  }
  else
  {
    Joystick.begin(false);
  }
  
    Serial.begin(9600); // Leonardo's USB
    Serial1.begin(9600); // Leonardo's TX/RX pins
}

void loop() {
  Serial.print("*");
      // Expect packets about once per second.

    if (brain.update()) {
        Serial.println(brain.readErrors());

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
  
        Joystick.setXAxis(Delta);
        Joystick.setYAxis(Theta);
        Joystick.setZAxis(LowAlpha);
        Joystick.setRxAxis(HighAlpha);
        Joystick.setRyAxis(LowBeta);
        Joystick.setRzAxis(HighBeta); 
    }
   
    if (testAutoSendMode == false)
    {
      Joystick.sendState();
    }
delay(10);
}
