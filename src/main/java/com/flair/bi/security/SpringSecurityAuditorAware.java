package com.flair.bi.security;

import java.util.Optional;

import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

import com.flair.bi.config.Constants;

/**
 * Implementation of AuditorAware based on Spring Security.
 */
@Component
public class SpringSecurityAuditorAware implements AuditorAware<String> {

	@Override
	public Optional<String> getCurrentAuditor() {
		return Optional.of(Optional.ofNullable(SecurityUtils.getCurrentUserLogin()).orElse(Constants.SYSTEM_ACCOUNT));
	}
}
