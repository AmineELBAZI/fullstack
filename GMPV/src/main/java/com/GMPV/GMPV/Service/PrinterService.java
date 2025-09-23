package com.GMPV.GMPV.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PrinterService {

    @Value("${printer.ip:192.168.123.100}") // default IP
    private String printerIp;

    @Value("${printer.port:9100}") // default port
    private int printerPort;

    public void printLabel(String reference, String name) {
        // Simulate printing if printer is offline
        System.out.println("🖨️ Simulated print for ticket:");
        System.out.println("Product Name: " + name);
        System.out.println("Reference: " + reference);
        System.out.println("Printer IP: " + printerIp + ", Port: " + printerPort);

        // If printer is online later, you can uncomment the real sending:
        
        String tspl = ""
            + "SIZE 80 mm, 50 mm\n"
            + "GAP 3 mm, 0\n"
            + "DENSITY 8\n"
            + "SPEED 4\n"
            + "REFERENCE 0,0\n"
            + "TEXT 50,20,\"3\",0,1,1,\"" + name + "\"\n"
            + "BARCODE 50,60,\"128\",50,1,0,2,2,\"" + reference + "\"\n"
            + "PRINT 1,1\n";

        try {
            sendToPrinter(tspl);
            System.out.println("✅ Ticket sent to printer successfully");
        } catch (IOException e) {
            System.err.println("❌ Printing failed to " + printerIp + ":" + printerPort);
            e.printStackTrace();
        }
        
    }

    
    private void sendToPrinter(String tsplData) throws IOException {
        try (Socket socket = new Socket(printerIp, printerPort);
             OutputStream out = socket.getOutputStream()) {
            out.write(tsplData.getBytes(StandardCharsets.US_ASCII));
            out.flush();
        }
    }
    
}
