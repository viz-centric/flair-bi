package com.flair.bi.config.security;

import org.springframework.context.annotation.Profile;

@Profile("integration")
public class MockJwtConfiguration implements JwtConfiguration {
}
