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
	
	private String eventID = "343CDD";
	private String deviceID = "00000030";
	private String deviceType = "01";
	private String contentId = "00";
//	accesstoggles= bin2dec('111111000');
//	colors=[0,1,2,3,4,5,6,7,8];
	private String age = "00";
	private String sex = "00";
//	groupDepth=bin2dec('00001111');
//	credits=bin2dec('00011111');
	
	public static void main(String[] args) {
		for(String portItem: SerialPortList.getPortNames()){
			System.out.println("port names:" + portItem);
		}
		
//		String name = null;
//		String name = "COM7";
		String name = "/dev/tty.usbmodem89";
		
		if(name != null){
			SerialPort sp = createSerialObject(new SerialPort(name));
			
			String[] byteArray = new String[256];
			for(int i = 0; i < 256; i++){
				byteArray[i] = "F";
			}
			printByteArray(byteArray);
			
			writeProfile(byteArray, sp);
		}
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

}
