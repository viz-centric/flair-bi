package com.flair.bi.security.ldap;

import java.util.Collection;

import org.springframework.ldap.core.DirContextAdapter;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.ldap.userdetails.UserDetailsContextMapper;
import org.springframework.stereotype.Component;

import com.flair.bi.domain.ExternalUser;

import lombok.extern.slf4j.Slf4j;

/**
 * This class is used to populate custom fields to LDAPUser object after
 * authentication from the LDAP server
 */
@Component
@Slf4j
public class LDAPUserDetailsContextMapper implements UserDetailsContextMapper {

	private static final String LDAP_GIVEN_NAME = "givenName";
	private static final String LDAP_SN = "sn";
	private static final String LDAP_EMAIL = "mail";

	@Override
	public UserDetails mapUserFromContext(DirContextOperations ctx, String userName,
			Collection<? extends GrantedAuthority> authorities) {
		ExternalUser ldapUser = new ExternalUser();
		ldapUser.setFirstName(ctx.getStringAttribute(LDAP_GIVEN_NAME));
		ldapUser.setLastName(ctx.getStringAttribute(LDAP_SN));
		ldapUser.setUsername(userName);
		ldapUser.setEmail(ctx.getStringAttribute(LDAP_EMAIL));
		ldapUser.setAuthorities(authorities);
		return ldapUser;
	}

	/*
	 * There wont be any context mapping from flair to LDAP.
	 */
	@Override
	public void mapUserToContext(UserDetails userDetails, DirContextAdapter ctx) {
		log.warn(
				"Map user to context is not used, because we are not updating the user information in the LDAP from Flair bi");

	}

}
