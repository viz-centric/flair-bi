package com.flair.bi.config.firebase;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "app.firebase", ignoreUnknownFields = false)
@Component
@Data
public class FirebaseProperties {
    private boolean enabled;
    private String googleAppCredFile;
}
