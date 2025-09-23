package com.GMPV.GMPV.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PrinterService {

    @Value("${printer.ip:192.168.123.101}") // default IP
    private String printerIp;

    @Value("${printer.port:9100}") // default port
    private int printerPort;

    /**
     * Send a label print job to the network printer.
     *
     * @param reference Reference/barcode text
     * @param name      Product name or label text
     */
    public void printLabel(String reference, String name) {
        String tspl = ""
            + "SIZE 80 mm, 50 mm\n"
            + "GAP 3 mm, 0\n"
            + "DENSITY 8\n"
            + "SPEED 4\n"
            + "REFERENCE 0,0\n"
            + "CLS\n" // clear buffer before each print
            + "TEXT 50,20,\"3\",0,1,1,\"" + name + "\"\n"
            + "BARCODE 50,60,\"128\",50,1,0,2,2,\"" + reference + "\"\n"
            + "PRINT 1,1\n";

        System.out.println("➡️ Sending job to printer " + printerIp + ":" + printerPort);
        System.out.println("TSPL DATA:\n" + tspl);

        try {
            sendToPrinter(tspl);
            System.out.println("✅ Ticket sent to printer successfully");
        } catch (IOException e) {
            System.err.println("❌ Printing failed to " + printerIp + ":" + printerPort);
            e.printStackTrace();
        }
    }

    /**
     * Open a socket and send raw TSPL commands to the printer.
     */
    private void sendToPrinter(String tsplData) throws IOException {
        try (Socket socket = new Socket()) {
            // timeout helps if printer is unreachable
            socket.connect(new InetSocketAddress(printerIp, printerPort), 3000);
            try (OutputStream out = socket.getOutputStream()) {
                out.write(tsplData.getBytes(StandardCharsets.US_ASCII));
                out.flush();
            }
        }
    }
}
