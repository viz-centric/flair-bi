package com.flair.bi.config.security;

import com.flair.bi.config.Constants;
import com.flair.bi.domain.User;
import com.flair.bi.security.okta.OktaUser;
import com.flair.bi.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.RandomStringUtils;
import org.springframework.boot.autoconfigure.security.oauth2.resource.AuthoritiesExtractor;
import org.springframework.boot.autoconfigure.security.oauth2.resource.PrincipalExtractor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.data.repository.query.SecurityEvaluationContextExtension;

import java.util.Collections;
import java.util.Optional;

@Configuration
@Slf4j
public class SecurityDependenciesConfiguration {

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public SecurityEvaluationContextExtension securityEvaluationContextExtension() {
		return new SecurityEvaluationContextExtension();
	}

	/**
	 * @param userService    user service
	 * @return principal extractor
	 */
	@Bean
	public PrincipalExtractor principalExtractor(UserService userService) {
		return map -> {
			final OktaUser oktaUser = OktaUser.from(map);
			log.debug("Okta user: {}", oktaUser);
			Optional<User> user = userService.getUserByLogin(oktaUser.getUsername());
			if (!user.isPresent()) {
				userService.createUser(oktaUser.getUsername(), passwordEncoder().encode(RandomStringUtils.random(10)),
						oktaUser.getFirstName(), oktaUser.getLastName(), oktaUser.getEmail(),
						Constants.LanguageKeys.ENGLISH, Constants.EXTERNAL_USER);
			}
			return oktaUser.getUsername();
		};
	}

	@Bean
	public AuthoritiesExtractor extractor() {
		return map -> {
			log.debug("Extracting authorities");
			return Collections.emptyList();
		};
	}

}
