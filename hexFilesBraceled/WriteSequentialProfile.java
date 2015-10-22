
import java.nio.charset.Charset;

import jssc.SerialPort;
import jssc.SerialPortException;
import jssc.SerialPortList;

public class WriteSequentialProfile {

	public static final int BAUDRATE = 38400;
	public static final int DATABITS = SerialPort.DATABITS_8;
	public static final int STOPBITS = SerialPort.STOPBITS_1;
	public static final int PARITY = SerialPort.PARITY_NONE;
	public static final int FLOWCONTROL = SerialPort.FLOWCONTROL_NONE;
	
	private static String eventID = "343CDD"; // dec=3423453
	private static String deviceID = "00000030";
	private static String deviceType = "0001";
	private static String contentId = "0000";
	private static String accesstoggles = "1F8"; // bin=111111000 dec=504
	private static String colors = "012345678";
	private static String age = "000000";
	private static String sex = "00";
	private static String groupDepth = "0F"; // bin=00001111 dec=15
	private static String credits = "1F"; // bin=00011111 dec=31
	
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
		
//			blockfill2(1:8)=dec2hex(deviceID,8);
		createProfileByteArray(byteArray, 0, deviceID.length(), deviceID);
//			blockfill2(9:12)=dec2hex(deviceType,4);
		createProfileByteArray(byteArray, 8, deviceType.length(), deviceType);
//			blockfill2(13:16)=dec2hex(contentId,4);
		createProfileByteArray(byteArray, 12, contentId.length(), contentId);
//			blockfill2(17:22)=dec2hex(age,6);
		createProfileByteArray(byteArray, 16, age.length(), age);
//			blockfill2(23:24)=dec2hex(sex,2);
		createProfileByteArray(byteArray, 22, sex.length(), sex);
		
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
			
			// Flash erase
			serialPort.writeBytes("ef".getBytes(Charset.forName("UTF-8")));
			System.out.println("Flash Erase");
			
			Thread.sleep(50);
			
			serialPort.writeBytes("l".getBytes(Charset.forName("UTF-8")));
			System.out.println("Enable ram buffer for writing.");
			
			Thread.sleep(10);
			
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
