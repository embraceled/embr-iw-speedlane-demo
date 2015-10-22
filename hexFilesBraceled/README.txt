
tag = game bandje.
join = paal sw / aanmeld braceled.

FF01 = Antenne finish 1
FF02 = Antenne finish 2
FF03 = Start ontvanger ( geplaatst bij finish en detecteerd de start)


De scriptjes zijn voor matlab 2014.
 
writesequentialserial.m schrijft een profiel naar de bandjes.
Je moet dan even c:\temp\currentSerial.txt bestand aan. Hier moet alleen 500 instaan (even via notepad).
writeprofilegameconfigupdate.m schrijft een profiel naar een join bandje.
De parameters zijn redelijk vanzelfsprekend. (als je wil weten wat je moet invullen zie wiki).

TODO : Deze scriptjes omzetten naar java code.
----------------------------------------------------------------------------------------------------------------------------------

WriteSequentialProfile
  compilen 
    javac -cp ./:lib/jssc-2.8.0.jar WriteSequentialProfile.java
  runnen
    java -cp ./:lib/jssc-2.8.0.jar WriteSequentialProfile

WriteProfileGameConfigUpdate
  compilen 
    javac -cp ./:lib/jssc-2.8.0.jar WriteProfileGameConfigUpdate.java
  runnen
    java -cp ./:lib/jssc-2.8.0.jar WriteProfileGameConfigUpdate