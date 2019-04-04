package com.flair.bi.websocket.grpc.config;

import com.netflix.appinfo.InstanceInfo;
import com.netflix.discovery.EurekaClient;
import io.grpc.ManagedChannel;
import io.grpc.netty.shaded.io.grpc.netty.GrpcSslContexts;
import io.grpc.netty.shaded.io.grpc.netty.NettyChannelBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.net.ssl.SSLException;
import java.io.File;
import java.util.function.Supplier;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class GrpcConfig {

    private final GrpcProperties properties;

    private final EurekaClient eurekaClient;

    @Bean
    public ManagedChannelFactory establishChannel() {
        Supplier<ManagedChannel> dynamicManagedChannel = () -> {
            log.info("Configuring GRPC message channel");
            final InstanceInfo instanceInfo = eurekaClient
                .getNextServerFromEureka(properties.getServer().getServiceName(), false);

            final NettyChannelBuilder nettyChannelBuilder =
                NettyChannelBuilder
                    .forAddress(instanceInfo.getIPAddr(),
                        instanceInfo.getPort());

            log.info("GRPC Hostname: {}", instanceInfo.getHostName());

            if (properties.getTls().isEnabled()) {
                if (!new File(properties.getTls().getRootCertificate()).exists()) {
                    log.warn("Invalid file location tls on grpc not enabled");
                } else {
                    log.debug("GRPC TLS enabled");
                    try {
                        nettyChannelBuilder
                            .sslContext(GrpcSslContexts.forClient()
                                .trustManager(new File(properties.getTls().getRootCertificate())).build());
                    } catch (SSLException e) {
                        log.error(e.getMessage(), e);
                    }
                }
            } else {
                nettyChannelBuilder.usePlaintext();
            }
            return nettyChannelBuilder.build();
        };
        return new ManagedChannelFactory(dynamicManagedChannel);
    }
}
