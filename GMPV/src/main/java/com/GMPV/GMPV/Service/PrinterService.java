package com.GMPV.GMPV.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.Charset;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PrinterService {

    @Value("${printer.ip:192.168.123.100}") // default IP
    private String printerIp;

    @Value("${printer.port:9100}") // default port
    private int printerPort;

    private static final Charset PRINTER_CHARSET = Charset.forName("CP850"); // support accents

    /**
     * Send a label print job to the network printer.
     *
     * @param reference Reference/barcode text
     * @param name      Product name or label text
     */
    public void printLabel(String reference, String name) {
        String tspl = buildTSPL(reference, name);

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

    private String buildTSPL(String reference, String name) {
        return ""
            + "SIZE 80 mm,50 mm\n"
            + "GAP 3 mm,0\n"
            + "DENSITY 8\n"
            + "SPEED 4\n"
            + "CLS\n" // clear buffer
            + "TEXT 50,20,\"3\",0,1,1,\"" + name + "\"\n"
            + "BARCODE 50,60,\"128\",50,1,0,2,2,\"" + reference + "\"\n"
            + "PRINT 1,1\n";
    }

    /**
     * Open a socket and send raw TSPL commands to the printer.
     */
    private void sendToPrinter(String tsplData) throws IOException {
        try (Socket socket = new Socket()) {
            // Increased timeout to 10 seconds
            socket.connect(new InetSocketAddress(printerIp, printerPort), 10000);
            try (OutputStream out = socket.getOutputStream()) {
                // Send in blocks if the data is large
                byte[] dataBytes = tsplData.getBytes(PRINTER_CHARSET);
                int blockSize = 1024;
                for (int i = 0; i < dataBytes.length; i += blockSize) {
                    int length = Math.min(blockSize, dataBytes.length - i);
                    out.write(dataBytes, i, length);
                    out.flush();
                    Thread.sleep(50); // small delay to avoid overflowing printer buffer
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IOException("Printing interrupted", e);
            }
        }
    }
}
