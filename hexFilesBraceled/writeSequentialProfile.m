function writeSequentialProfile(port,serial1)

serial1 = hex2dec('e7')%
%300%getSerialBracelet();


%% Defines 
eventID=3423453;
deviceID=serial1;%hex2dec('00000030');
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
    s3=serial(port);
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
blockfill2(1:8)=dec2hex(deviceID,8);
blockfill2(9:12)=dec2hex(deviceType,4);
blockfill2(13:16)=dec2hex(contentId,4);
blockfill2(17:22)=dec2hex(age,6);
blockfill2(23:24)=dec2hex(sex,2);


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