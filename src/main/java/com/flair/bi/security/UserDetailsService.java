package com.flair.bi.security;

import com.flair.bi.domain.User;
import com.flair.bi.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Authenticate a user from the database.
 */
@Component("userDetailsService")
@Slf4j
@RequiredArgsConstructor
public class UserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

	private final UserService userService;

	@Override
	@Transactional
	public UserDetails loadUserByUsername(final String login) {
		log.debug("Authenticating {}", login);
		String lowercaseLogin = login.toLowerCase(Locale.ENGLISH);
		Optional<User> userFromDatabase = userService.getUserByLoginNoRealmCheck(lowercaseLogin);
		return userFromDatabase.map(user -> {
			if (!user.isActivated()) {
				throw new UserNotActivatedException("User " + lowercaseLogin + " was not activated");
			}
			final List<GrantedAuthority> grantedAuthorities = user.retrieveAllUserPermissions(false).stream()
					.map(PermissionGrantedAuthority::new).collect(Collectors.toList());

			return new org.springframework.security.core.userdetails.User(lowercaseLogin, user.getPassword(),
					grantedAuthorities);
		}).orElseThrow(
				() -> new UsernameNotFoundException("User " + lowercaseLogin + " was not found in the " + "database"));
	}
}
