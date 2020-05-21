package com.flair.bi.security;

import java.util.Set;

import com.google.common.collect.ImmutableSet;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {

	public static final String ADMIN = "ROLE_ADMIN";

	public static final String USER = "ROLE_USER";

	public static final String ANONYMOUS = "ROLE_ANONYMOUS";

	public static final String DEVELOPER = "ROLE_DEVELOPER";

	public static final Set<String> ALL = ImmutableSet.of(ADMIN, USER, ANONYMOUS, DEVELOPER);
}
