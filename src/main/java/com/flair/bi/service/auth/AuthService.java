package com.flair.bi.service.auth;

import com.flair.bi.domain.User;
import com.flair.bi.security.jwt.TokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final TokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;
    private final AuthenticationManager authenticationManager;

    public String auth(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getLogin());
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, userDetails.getPassword(), userDetails.getAuthorities());
        String jwtToken = tokenProvider.createToken(authentication, false);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return jwtToken;
    }

    public String auth(String username, String password, boolean rememberMe) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                username, password);
        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return tokenProvider.createToken(authentication, rememberMe);
    }
}
