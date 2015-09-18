%% Defines 
gameType=hex2dec('0002');
gameTime=40; %gametime
gameArg1=3;  %color tagee
gameArg2=4;  %color tag7er
gameArg3=1;  %immunity time
gameArg4=7;  %tagPower
gameArg5=1;  %tagType
gameArg6=0;  %reserved
gameArg7=0;  %reserved
gameArg8=0;  %reserved
gameArg9=0;  %reserved
eventID=3423453;
deviceID=hex2dec('00010000');
deviceType=1;
contentId=0;
accesstoggles= bin2dec('111111000');
colors=[0,1,2,3,4,5,6,7,8];
age=0;
sex=0;
groupDepth=bin2dec('00001111');
credits=bin2dec('00011111');
blockfill='FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF';
%% init serial port
if ~exist('s3')
    s3=serial('COM76');
    fopen(s3)
end
%% flash erase
fwrite(s3,'e')
pause(0.05)
fwrite(s3,'f')
pause(0.05)
char(fread(s3,s3.BytesAvailable))'

%% start write mode
fwrite(s3,'l')

%% write profile start

%  00 00 0C 41 00 01 00 00 00 00 00 00 15 0A 00 01 50 22 00 01 5D 4C 00 01 66
blockfill3 = '00000C410001000000000000150A0001'

blockfill2=blockfill3;
blockfill2(1:4)=dec2hex(gameType,4);
blockfill2(5:6)=dec2hex(gameTime,2);
blockfill2(7:8)=dec2hex(gameArg1,2);
blockfill2(9:10)=dec2hex(gameArg2,2);
blockfill2(11:12)=dec2hex(gameArg3,2);
blockfill2(13:14)=dec2hex(gameArg4,2);
blockfill2(15:16)=dec2hex(gameArg5,2);
blockfill2(17:18)=dec2hex(gameArg6,2);
blockfill2(19:20)=dec2hex(gameArg7,2);
blockfill2(21:22)=dec2hex(gameArg8,2);
blockfill2(23:24)=dec2hex(gameArg9,2);



fwrite(s3,blockfill2)
pause(0.05)
char(fread(s3,s3.BytesAvailable))';

%% fill profile info with empty stuff
blockfill4 = '502200015D4C000166FFFFFFFFFFFFFF'
    fwrite(s3,blockfill4)
    pause(0.05)
    char(fread(s3,s3.BytesAvailable))';



for i=3:7
    fwrite(s3,blockfill)
    pause(0.05)
    char(fread(s3,s3.BytesAvailable))';
end

%% write korsakov
accesstoggles=(bitshift(accesstoggles,3));
blockfill2=blockfill;
blockfill2(13:14)=dec2hex(credits,2);
blockfill2(15:20)=dec2hex(eventID,6);
blockfill2(21:23)=dec2hex(accesstoggles,3);
blockfill2(24:32)=(dec2hex(colors))';


fwrite(s3,blockfill2)
pause(0.05)
char(fread(s3,s3.BytesAvailable))';


%% program profile
fwrite(s3,'p')
pause(0.05)
fwrite(s3,'F0')
pause(0.05)
char(fread(s3,s3.BytesAvailable))'


%% check profile
fwrite(s3,'r')
pause(0.05)
fwrite(s3,'F0')
pause(0.05)
char(fread(s3,s3.BytesAvailable))'
%% get id
fwrite(s3,'i')
pause(0.05)
char(fread(s3,s3.BytesAvailable))'

%% close and clear
fclose(s3)
clear s3