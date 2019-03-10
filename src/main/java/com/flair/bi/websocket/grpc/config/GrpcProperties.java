package com.flair.bi.websocket.grpc.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Example:
 * grpc:
 * server:
 * host: devsupport-vizcentric.com
 * port: 6565
 * tls:
 * enabled: false
 * root-certificate: ca.crt
 */
@ConfigurationProperties(prefix = "grpc", ignoreUnknownFields = false)
@Getter
@Setter
public class GrpcProperties {

    private Server server = new Server();
    private Tls tls = new Tls();
    private Integer port;

    @Getter
    @Setter
    public static class Server {
        private String serviceName;
    }

    @Getter
    @Setter
    public static class Tls {
        private boolean enabled = false;
        private String rootCertificate;
    }

}
