package com.flair.bi.security.okta;

import java.util.Map;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class OktaUser {

    private final String username;
    private final String firstName;
    private final String lastName;
    private final String email;

    public static OktaUser from(Map<?, ?> map) {
        return new OktaUser(((String) map.get("preferred_username")).toLowerCase(), (String) map.get("given_name"),
                (String) map.get("family_name"), (String) map.get("email"));
    }

}