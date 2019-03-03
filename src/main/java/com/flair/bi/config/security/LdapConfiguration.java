package com.flair.bi.config.security;

import com.flair.bi.config.JHipsterProperties;
import com.flair.bi.security.ldap.LDAPUserDetailsContextMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.BeanInitializationException;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.ldap.userdetails.LdapAuthoritiesPopulator;

import javax.annotation.PostConstruct;

@Configuration
@Order(3)
@RequiredArgsConstructor
public class LdapConfiguration {

    private final JHipsterProperties jHipsterProperties;

    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    private final LdapAuthoritiesPopulator ldapAuthoritiesPopulator;

    private final LDAPUserDetailsContextMapper ldapUserDetailsContextMapper;

    @PostConstruct
    public void init() {
        try {
            authenticationManagerBuilder
                .ldapAuthentication()
                .ldapAuthoritiesPopulator(ldapAuthoritiesPopulator)
                .userDnPatterns("uid={0},ou=people")
                .userDetailsContextMapper(ldapUserDetailsContextMapper)
                .contextSource(getLDAPContextSource());
        } catch (Exception e) {
            throw new BeanInitializationException("Security configuration failed", e);
        }
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
