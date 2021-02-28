package com.flair.bi.service.auth;

import com.flair.bi.domain.Realm;
import com.flair.bi.domain.User;
import com.flair.bi.security.UserAuthInfo;
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

    public String auth(User user, Realm realm) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getLogin());

        return auth(userDetails, realm);
    }

    public String auth(UserDetails userDetails, Realm realm) {
        UserAuthInfo userAuthInfo = new UserAuthInfo();
        userAuthInfo.setRealmId(realm.getId());

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, userDetails.getPassword(), userDetails.getAuthorities());
        authentication.setDetails(userAuthInfo);

        String jwtToken = tokenProvider.createToken(authentication, false);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return jwtToken;
    }

    public String auth(String username, String password, boolean rememberMe, Long realmId) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                username, password);
        authenticationToken.setDetails(new UserAuthInfo(realmId));
        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return tokenProvider.createToken(authentication, rememberMe);
    }

    public boolean auth(String username, String password) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username, password);
        authenticationManager.authenticate(authenticationToken);
        return true;
    }
}
