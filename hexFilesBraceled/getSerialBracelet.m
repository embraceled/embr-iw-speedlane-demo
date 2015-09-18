function serial = getSerialBracelet
fid1=fopen('c:\temp\currentSerial.txt','r');
serial=char(fread(fid1))';
serial=str2num(serial);
serial=serial+1;
fclose(fid1);
fid1=fopen('c:\temp\currentSerial.txt','w');
fwrite(fid1,num2str(serial));
fclose(fid1);