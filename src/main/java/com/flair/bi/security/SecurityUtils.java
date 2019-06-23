package com.flair.bi.security;

import java.util.EnumSet;
import java.util.LinkedHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.provider.OAuth2Authentication;

/**
 * Utility class for Spring Security.
 */
public final class SecurityUtils {

    public enum roles{
    	ROLE_ADMIN,
    	ROLE_USER,
    	ROLE_DEVELOPMENT
    }

    /**
     * Get the login of the current user.
     *
     * @return the login of the current user
     */
    public static String getCurrentUserLogin() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        Authentication authentication = securityContext.getAuthentication();
        String userName = null;
        if (authentication != null) {
            if (authentication.getPrincipal() instanceof UserDetails) {
                UserDetails springSecurityUser = (UserDetails) authentication.getPrincipal();
                userName = springSecurityUser.getUsername();
            } else if (authentication.getPrincipal() instanceof String) {
                if (authentication instanceof OAuth2Authentication) {
                    OAuth2Authentication oAuth2Authentication = (OAuth2Authentication) authentication;
                    if (oAuth2Authentication.getUserAuthentication().getDetails() instanceof LinkedHashMap<?, ?>) {
                        userName = (String) ((LinkedHashMap<?, ?>) oAuth2Authentication.getUserAuthentication()
                            .getDetails()).get("email");
                    }
                } else {
                    userName = authentication.getPrincipal().toString();
                }

            }

        }
        return userName;
    }

    /**
     * Check if a user is authenticated.
     *
     * @return true if the user is authenticated, false otherwise
     */
    public static boolean isAuthenticated() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        Authentication authentication = securityContext.getAuthentication();
        return authentication != null
            && authentication.getAuthorities()
            .stream()
            .noneMatch(grantedAuthority ->
                grantedAuthority.getAuthority()
                    .equals(AuthoritiesConstants.ANONYMOUS));
    }
    
    /**
     * Check if a user is authenticated.
     *
     * @return true if the user is authenticated, false otherwise
     */
    public static boolean iAdmin() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        Authentication authentication = securityContext.getAuthentication();
        return authentication != null
            && authentication.getAuthorities()
            .stream()
            .noneMatch(grantedAuthority ->
                grantedAuthority.getAuthority()
                    .equals(AuthoritiesConstants.ADMIN));
    }
    
    public static  EnumSet<roles> getPredefinedGroups(){
		return EnumSet.of(roles.ROLE_ADMIN,roles.ROLE_DEVELOPMENT,roles.ROLE_USER);
    }

}
