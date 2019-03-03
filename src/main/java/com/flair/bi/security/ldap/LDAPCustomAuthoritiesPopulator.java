package com.flair.bi.security.ldap;

import com.flair.bi.domain.User;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.security.AuthoritiesConstants;
import com.flair.bi.security.PermissionGrantedAuthority;
import com.flair.bi.service.UserService;
import com.flair.bi.service.security.PermissionService;
import com.flair.bi.service.security.UserGroupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.ldap.userdetails.LdapAuthoritiesPopulator;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * This is a custom authorities populator which injects authorities from the
 * application level rather than the LDAP ones. This BI tool uses application
 * level authorization functionality so all the authorities details are stored
 * and managed by application db.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LDAPCustomAuthoritiesPopulator implements LdapAuthoritiesPopulator {

    private static final String LDAP_UID = "uid";

    private final UserService userService;

    private final UserGroupService userGroupService;

    @Override
    public Collection<? extends GrantedAuthority> getGrantedAuthorities(DirContextOperations userData,
                                                                        String username) {
        log.info("--------------------------inside ldap custom authorities populator---------------------------");
        String login = userData.getStringAttribute(LDAP_UID);
        log.info("--login is ---->" + login);
        Optional<User> user = userService.getUserWithAuthoritiesByLogin(login);
        return user.<Collection<? extends GrantedAuthority>>map(user1 -> user1.retrieveAllUserPermissions().stream().map(PermissionGrantedAuthority::new)
            .collect(Collectors.toSet())).orElseGet(this::getDefaultAuthority);
    }

    private Set<GrantedAuthority> getDefaultAuthority() {
        final UserGroup userGroup = userGroupService.findOne(AuthoritiesConstants.USER);
        return userGroup
            .getPermissions()
            .stream()
            .map(PermissionGrantedAuthority::new)
            .collect(Collectors.toSet());
    }

}
