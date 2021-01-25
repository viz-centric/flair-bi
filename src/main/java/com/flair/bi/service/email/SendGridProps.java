package com.flair.bi.service.email;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.sendgrid", ignoreUnknownFields = false)
public class SendGridProps {
    Sender sender;
    @Data
    public static class Sender {
        String email;
        String name;
    }
}
