package com.flair.bi.config.security;

import com.flair.bi.config.JHipsterProperties;
import com.flair.bi.security.ldap.LDAPUserDetailsContextMapper;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.ldap.userdetails.LdapAuthoritiesPopulator;

@Configuration
public class LdapConfiguration {

    private final JHipsterProperties jHipsterProperties;

    public LdapConfiguration(JHipsterProperties jHipsterProperties, AuthenticationManagerBuilder authenticationManagerBuilder, LdapAuthoritiesPopulator ldapAuthoritiesPopulator,
                             LDAPUserDetailsContextMapper ldapUserDetailsContextMapper, JwtConfiguration jwtConfiguration) throws Exception {

        // jwtConfiguration dependency should stay here to guarantee the order of the beans
        // created: first JWT, then LDAP
        this.jHipsterProperties = jHipsterProperties;
        authenticationManagerBuilder
                .ldapAuthentication()
                .ldapAuthoritiesPopulator(ldapAuthoritiesPopulator)
                .userDnPatterns("uid={0},ou=people")
                .userDetailsContextMapper(ldapUserDetailsContextMapper)
                .contextSource(getLDAPContextSource());
    }

    private LdapContextSource getLDAPContextSource() {
        LdapContextSource contextSource = new LdapContextSource();
        JHipsterProperties.LdapSettings ldapSettings = jHipsterProperties.getLdapsettings();
        contextSource.setUrl(ldapSettings.getUrl());
        contextSource.setBase(ldapSettings.getBase());
        contextSource.setUserDn(ldapSettings.getUserDn());
        contextSource.setPassword(ldapSettings.getPassword());
        contextSource.afterPropertiesSet(); // needed otherwise you will have a NullPointerException in spring
        return contextSource;
    }
}
