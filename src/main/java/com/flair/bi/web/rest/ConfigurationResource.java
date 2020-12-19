package com.flair.bi.web.rest;

import com.flair.bi.config.firebase.FirebaseProperties;
import io.micrometer.core.annotation.Timed;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ConfigurationResource {

    private static final String ENTITY_NAME = "configuration";

    private final FirebaseProperties firebaseProperties;

    @GetMapping("/config")
    @Timed
    public Config getAllClientLogos() {
        return Config.builder()
                .mode(firebaseProperties.isEnabled() ? Config.Mode.CLOUD : Config.Mode.SELF_MANAGED)
                .build();
    }

    @Builder
    @Data
    private static class Config {
        final Mode mode;
        enum Mode {
            CLOUD, SELF_MANAGED;
        }
    }

}
