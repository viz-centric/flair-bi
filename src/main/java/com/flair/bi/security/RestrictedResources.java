package com.flair.bi.security;

import com.google.common.collect.ImmutableSet;

import java.util.Set;

import static com.flair.bi.security.AuthoritiesConstants.SUPERADMIN;

/**
 * Constants for Spring Security authorities.
 */
public final class RestrictedResources {

	public static final Set<String> RESTRICTED_ROLES = ImmutableSet.of(SUPERADMIN);

	public static final Set<String> RESTRICTED_RESOURCES = ImmutableSet.of("REALM-MANAGEMENT");

}
