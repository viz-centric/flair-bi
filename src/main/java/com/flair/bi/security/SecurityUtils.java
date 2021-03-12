package com.flair.bi.security;

import com.flair.bi.security.okta.OktaUser;
import com.flair.bi.service.impl.RealmService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.provider.OAuth2Authentication;

import java.util.EnumSet;
import java.util.Map;
import java.util.Optional;

/**
 * Utility class for Spring Security.
 */
public final class SecurityUtils {

	public enum roles {
		ROLE_SUPERADMIN, ROLE_ADMIN, ROLE_USER, ROLE_DEVELOPMENT
	}

	/**
	 * Get the login of the current user.
	 *
	 * @return the login of the current user
	 */
	public static UserAuthInfo getUserAuth() {
		SecurityContext securityContext = SecurityContextHolder.getContext();
		Authentication authentication = securityContext.getAuthentication();
		if (authentication instanceof UsernamePasswordAuthenticationToken) {
			UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) authentication;
			if (authenticationToken.getDetails() instanceof UserAuthInfo) {
				return (UserAuthInfo) authenticationToken.getDetails();
			}
		} else if (authentication instanceof OAuth2Authentication) {
			return getOAuthUsername((OAuth2Authentication) authentication)
					.map(oauthUsername -> new UserAuthInfo(RealmService.VIZ_CENTRIC_REALM))
					.orElse(null);
		}
		throw new IllegalStateException("Realm not found in security context");
	}

	/**
	 * Get the login of the current user.
	 *
	 * @return the login of the current user
	 */
	public static String getCurrentUserLogin() {
		SecurityContext securityContext = SecurityContextHolder.getContext();
		Authentication authentication = securityContext.getAuthentication();
		if (authentication != null) {
			if (authentication.getPrincipal() instanceof UserDetails) {
				UserDetails springSecurityUser = (UserDetails) authentication.getPrincipal();
				return springSecurityUser.getUsername();
			} else if (authentication.getPrincipal() instanceof String) {
				if (authentication instanceof OAuth2Authentication) {
					return getOAuthUsername((OAuth2Authentication) authentication)
							.orElse(null);
				} else {
					return authentication.getPrincipal().toString();
				}

			}

		}
		return null;
	}

	private static Optional<String> getOAuthUsername(OAuth2Authentication authentication) {
		if (authentication.getUserAuthentication().getDetails() instanceof Map<?, ?>) {
			final Map<?, ?> authDetails = (Map<?, ?>) authentication.getUserAuthentication()
					.getDetails();
			final OktaUser user = OktaUser.from(authDetails);
			return Optional.ofNullable(user.getUsername());
		}
		return Optional.empty();
	}

	/**
	 * Check if a user is authenticated.
	 *
	 * @return true if the user is authenticated, false otherwise
	 */
	public static boolean isAuthenticated() {
		SecurityContext securityContext = SecurityContextHolder.getContext();
		Authentication authentication = securityContext.getAuthentication();
		return authentication != null && authentication.getAuthorities().stream()
				.noneMatch(grantedAuthority -> grantedAuthority.getAuthority().equals(AuthoritiesConstants.ANONYMOUS));
	}

	/**
	 * Check if a user is authenticated.
	 *
	 * @return true if the user is authenticated, false otherwise
	 */
	public static boolean iAdmin() {
		SecurityContext securityContext = SecurityContextHolder.getContext();
		Authentication authentication = securityContext.getAuthentication();
		return authentication != null && authentication.getAuthorities().stream()
				.noneMatch(grantedAuthority -> grantedAuthority.getAuthority().equals(AuthoritiesConstants.ADMIN));
	}

	public static EnumSet<roles> getPredefinedGroups() {
		return EnumSet.of(roles.ROLE_SUPERADMIN, roles.ROLE_ADMIN, roles.ROLE_DEVELOPMENT, roles.ROLE_USER);
	}

}
