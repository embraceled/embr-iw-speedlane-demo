
import java.nio.charset.Charset;

import jssc.SerialPort;
import jssc.SerialPortException;
import jssc.SerialPortList;

public class WriteProfileGameConfigUpdate {

	public static final int BAUDRATE = 38400;
	public static final int DATABITS = SerialPort.DATABITS_8;
	public static final int STOPBITS = SerialPort.STOPBITS_1;
	public static final int PARITY = SerialPort.PARITY_NONE;
	public static final int FLOWCONTROL = SerialPort.FLOWCONTROL_NONE;
	
	private static String eventID = "343CDD"; // dec=3423453
	private static String accesstoggles = "1F8"; // bin=111111000 dec=504
	private static String colors = "012345678";
	private static String credits = "1F"; // bin=00011111 dec=31
	
	private static String gameType = "0001";
//	private static String gameTime = "FF"; // gametime dec=40
	private static String gameTime = "14"; // gametime dec=20
	private static String gameArg1 = "03";  // color tagee dec=3
	private static String gameArg2 = "04";  // color tag7er dec=4
	private static String gameArg3 = "01";  // immunity time dec=1
	private static String gameArg4 = "07";  // tagPower dec=7
	private static String gameArg5 = "00";  // tagType dec=1
	private static String gameArg6 = "00";  // reserved dec=0
	private static String gameArg7 = "00";  // reserved dec=0
	private static String gameArg8 = "00";  // reserved dec=0
	private static String gameArg9 = "00";  // reserved dec=0
	
	public static void main(String[] args) {
		for(String portItem: SerialPortList.getPortNames()){
			System.out.println("port names:" + portItem);
		}
		
//		String name = null;
//		String name = "COM7";
		String name = "/dev/tty.usbmodem00000001";
		
		if(name != null){
			SerialPort sp = createSerialObject(new SerialPort(name));
			
			String[] byteArray = fillProfileByteArray();
			
			writeProfile(byteArray, sp);
		}
	}

	public static String[] fillProfileByteArray() {
		String[] byteArray = new String[256];
		for(int i = 0; i < 256; i++){
			byteArray[i] = "F";
		}
		printByteArray(byteArray);
		
//		blockfill2(1:4)=dec2hex(gameType,4);
		createProfileByteArray(byteArray, 0, gameType.length(), gameType);
//		blockfill2(5:6)=dec2hex(gameTime,2);
		createProfileByteArray(byteArray, 4, gameTime.length(), gameTime);
//		blockfill2(7:8)=dec2hex(gameArg1,2);
		createProfileByteArray(byteArray, 6, gameArg1.length(), gameArg1);
//		blockfill2(9:10)=dec2hex(gameArg2,2);
		createProfileByteArray(byteArray, 8, gameArg2.length(), gameArg2);
//		blockfill2(11:12)=dec2hex(gameArg3,2);
		createProfileByteArray(byteArray, 10, gameArg3.length(), gameArg3);
//		blockfill2(13:14)=dec2hex(gameArg4,2);
		createProfileByteArray(byteArray, 12, gameArg4.length(), gameArg4);
//		blockfill2(15:16)=dec2hex(gameArg5,2);
		createProfileByteArray(byteArray, 14, gameArg5.length(), gameArg5);
//		blockfill2(17:18)=dec2hex(gameArg6,2);
		createProfileByteArray(byteArray, 16, gameArg6.length(), gameArg6);
//		blockfill2(19:20)=dec2hex(gameArg7,2);
		createProfileByteArray(byteArray, 18, gameArg7.length(), gameArg7);
//		blockfill2(21:22)=dec2hex(gameArg8,2);
		createProfileByteArray(byteArray, 20, gameArg8.length(), gameArg8);
//		blockfill2(23:24)=dec2hex(gameArg9,2);
		createProfileByteArray(byteArray, 22, gameArg9.length(), gameArg9);
		
		createProfileByteArray(byteArray, 24, "150A0001".length(), "150A0001");
		
		createProfileByteArray(byteArray, 32, "502200015D4C000166".length(), "502200015D4C000166");

//			blockfill2(13:14)=dec2hex(credits,2);
		createProfileByteArray(byteArray, (7*32)+12, credits.length(), credits);
//			blockfill2(15:20)=dec2hex(eventID,6);
		createProfileByteArray(byteArray, (7*32)+14, eventID.length(), eventID);
//			blockfill2(21:23)=dec2hex(accesstoggles,3);
		createProfileByteArray(byteArray, (7*32)+20, accesstoggles.length(), accesstoggles);
//			blockfill2(24:32)=(dec2hex(colors))';
			createProfileByteArray(byteArray, (7*32)+23, colors.length(), colors);
		
		printByteArray(byteArray);
		
		return byteArray;
	}
	
	private static void writeProfile(String[] byteArray, SerialPort serialPort) {
		
		try {
			// Ram erase
			serialPort.writeBytes("er".getBytes(Charset.forName("UTF-8")));
			System.out.println("Ram erase");
			
			Thread.sleep(150);
			
			// Flash erase
			serialPort.writeBytes("ef".getBytes(Charset.forName("UTF-8")));
			System.out.println("Flash Erase");
			
			Thread.sleep(150);
			
			serialPort.writeBytes("l".getBytes(Charset.forName("UTF-8")));
			System.out.println("Enable ram buffer for writing.");
			
			Thread.sleep(50);
			
			int byteMultiplier = 2;
			int profileSize = 128;
			int writeBufferSize = 16;
			
			for(int i = 0; i < (profileSize * byteMultiplier);i += (writeBufferSize * byteMultiplier)){
				System.out.println("Length=" + (i + (writeBufferSize * byteMultiplier)));
				StringBuilder sb = new StringBuilder(); 
				for (int n = i; n < (i + (writeBufferSize * byteMultiplier)); n++) {
					sb.append(byteArray[n]);
				}
				System.out.println("Buffer to write='" + sb.toString() + "' from "+i+" to "+(i+(writeBufferSize * byteMultiplier)));
				serialPort.writeBytes(sb.toString().getBytes(Charset.forName("UTF-8")));
				Thread.sleep(50);
			}
			System.out.println("Bytes writen.\n");
			Thread.sleep(50);
			
			serialPort.writeBytes("p".getBytes(Charset.forName("UTF-8")));
			Thread.sleep(50);
			serialPort.writeBytes("F0".getBytes(Charset.forName("UTF-8")));
			System.out.println("Block writen");
			
		} catch (InterruptedException e) {
			e.printStackTrace();
		} catch (SerialPortException e) {
			e.printStackTrace();
		}
	}
	
	private static void printByteArray(String[] byteArray) {
		StringBuilder sb = new StringBuilder();
		for (String str : byteArray) {
			sb.append(str);
		}
		System.out.println("ByteArray=" + sb.toString());
	}
	
	public static SerialPort createSerialObject(SerialPort sp){
		try {
			if(!sp.isOpened()){
				System.out.println("Port not open -> opening");
				sp.openPort();
			}
			sp.setParams(
					BAUDRATE,
					DATABITS,
					STOPBITS,
					PARITY
					);
			
			sp.setFlowControlMode(FLOWCONTROL);
		} catch (SerialPortException e) {
			e.printStackTrace();
			return null;
		}
		return sp;
	}
	
	private static String[] createProfileByteArray(String[] byteArray, int start, int length, String data) {
		int n = 0;
		for(int i = start; i < (start + length); i++){
			char c = 0;
			try{
				c = data.charAt(n);
			} catch(IndexOutOfBoundsException e){
				c = 70;
			}
			byteArray[i] = "" + c;
			n++;
		}
		return byteArray;
	}

}
