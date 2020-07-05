package com.flair.bi.security;

import java.io.IOException;
import java.util.Optional;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.flair.bi.config.Constants;
import com.flair.bi.domain.ExternalUser;
import com.flair.bi.domain.User;
import com.flair.bi.repository.UserRepository;
import com.flair.bi.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * An instance of this class will be created and onAuthenticationSuccess method
 * will be invoked on successful authentication of user. If the user is
 * external, this is customized to replicate the user to application database
 * with random password. This replication is required because all the
 * authorities and user information is accessed form application db on
 * successful authentication of user.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class CustomAuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	private final UserService userService;

	private final UserRepository userRepository;

	private final PasswordEncoder passwordEncoder;

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {
		log.debug("------------Login success-----------" + authentication.getName());
		if (SecurityContextHolder.getContext().getAuthentication().getPrincipal() instanceof ExternalUser) {
			ExternalUser externalUser = (ExternalUser) SecurityContextHolder.getContext().getAuthentication()
					.getPrincipal();
			Optional<User> user = userRepository.findOneByEmail(externalUser.getEmail());
			if (!user.isPresent()) {
				log.info("-------------User is not found in application database. -> replicating the user :"
						+ externalUser.getUsername());
				userService.createUser(externalUser.getUsername(), passwordEncoder.encode(RandomStringUtils.random(10)),
						externalUser.getFirstName(), externalUser.getLastName(), externalUser.getEmail(),
						Constants.LanguageKeys.ENGLISH, Constants.EXTERNAL_USER);
			}
		}
		response.setStatus(HttpServletResponse.SC_OK);
	}
}
