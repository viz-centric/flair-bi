package com.flair.bi.config.security;

import com.flair.bi.security.Http401UnauthorizedEntryPoint;
import com.flair.bi.security.UserDetailsService;
import com.flair.bi.security.jwt.JWTConfigurer;
import com.flair.bi.security.jwt.TokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.security.oauth2.client.EnableOAuth2Sso;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.data.repository.query.SecurityEvaluationContextExtension;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.CorsFilter;

@EnableOAuth2Sso
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
@Slf4j
@Profile("!integration")
public class JwtSecurityConfiguration extends WebSecurityConfigurerAdapter implements JwtConfiguration {

    private final TokenProvider tokenProvider;
    private final CorsFilter corsFilter;

    public JwtSecurityConfiguration(AuthenticationManagerBuilder authenticationManagerBuilder, UserDetailsService userDetailsService, TokenProvider tokenProvider, CorsFilter corsFilter, PasswordEncoder passwordEncoder) throws Exception {
        log.info("Creating Jwt configuration");
        this.tokenProvider = tokenProvider;
        this.corsFilter = corsFilter;

        authenticationManagerBuilder
                .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder);
    }

    @Bean
    public Http401UnauthorizedEntryPoint http401UnauthorizedEntryPoint() {
        return new Http401UnauthorizedEntryPoint();
    }

    @Override
    public void configure(WebSecurity web) {
        web.ignoring()
            .antMatchers(HttpMethod.OPTIONS, "/**")
            .antMatchers("/app/**/*.{js,html}")
            .antMatchers("/i18n/**")
            .antMatchers("/content/**")
            .antMatchers("/swagger-ui/index.html")
            .antMatchers("/test/**");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling()
            .authenticationEntryPoint(http401UnauthorizedEntryPoint())
            .and()
            .csrf()
            .disable()
            .headers()
            .frameOptions()
            .disable()
            .and()
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
            .antMatchers("/flair-ws**").permitAll()
            .antMatchers("/login**").permitAll()
            .antMatchers("/api/register").permitAll()
            .antMatchers("/api/activate").permitAll()
            .antMatchers("/api/authenticate").permitAll()
            .antMatchers("/api/account/reset_password/init").permitAll()
            .antMatchers("/api/account/reset_password/finish").permitAll()
            .antMatchers("/api/profile-info").permitAll()
            .antMatchers("/api/external/**").permitAll()
            .antMatchers("/api/**").authenticated()
            .antMatchers("/v2/api-docs/**").permitAll()
            .antMatchers("/swagger-resources/configuration/ui").permitAll()
            .antMatchers(HttpMethod.GET, "/api/users/**").access("@accessControlManager.hasAccess('USER-MANAGEMENT', 'READ', 'APPLICATION')")
            .antMatchers(HttpMethod.POST, "/api/users/**").access("@accessControlManager.hasAccess('USER-MANAGEMENT', 'WRITE', 'APPLICATION')")
            .antMatchers(HttpMethod.PUT, "/api/users/**").access("@accessControlManager.hasAccess('USER-MANAGEMENT', 'UPDATE', 'APPLICATION')")
            .antMatchers(HttpMethod.DELETE, "/api/users/**").access("@accessControlManager.hasAccess('USER-MANAGEMENT', 'DELETE', 'APPLICATION')")
            .antMatchers("/swagger-ui/index.html").access("@accessControlManager.hasAccess('API', 'READ', 'APPLICATION')")
            .antMatchers("/management/audits/**").access("@accessControlManager.hasAccess('AUDITS', 'READ', 'APPLICATION')")
            .antMatchers("/management/health/**").access("@accessControlManager.hasAccess('HEALTH-CHECKS', 'READ', 'APPLICATION')")
            .antMatchers("/management/configprops/**").access("@accessControlManager.hasAccess('CONFIGURATION', 'READ', 'APPLICATION')")
            .antMatchers(HttpMethod.GET, "/management/logs/**").access("@accessControlManager.hasAccess('LOGS', 'READ', 'APPLICATION')")
            .antMatchers(HttpMethod.PUT, "/management/logs/**").access("@accessControlManager.hasAccess('LOGS', 'UPDATE', 'APPLICATION')")
            .antMatchers("/management/metrics").access("@accessControlManager.hasAccess('APPLICATION-METRICS', 'READ', 'APPLICATION')")
            .and()
            .apply(securityConfigurerAdapter());


    }

    private JWTConfigurer securityConfigurerAdapter() {
        return new JWTConfigurer(tokenProvider);
    }

    @Bean
    public SecurityEvaluationContextExtension securityEvaluationContextExtension() {
        return new SecurityEvaluationContextExtension();
    }


}
