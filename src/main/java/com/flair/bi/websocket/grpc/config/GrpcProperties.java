package com.flair.bi.websocket.grpc.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "grpc", ignoreUnknownFields = false)
@Data
public class GrpcProperties {

    private Server server = new Server();
    private Tls tls = new Tls();
    private Integer port;

    @Data
    public static class Server {
        private String serviceName;
    }

    @Data
    public static class Tls {
        private boolean enabled = false;
        private String rootCertificate;
        private String clientCertChainFile;
        private String clientPrivateKeyFile;
        private String trustCertCollectionFile;
    }

}
