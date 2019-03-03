package com.flair.bi.service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class JwtTokenDTO {

    private String idToken;

    public JwtTokenDTO() {
    }

    public JwtTokenDTO(String idToken) {
        this.idToken = idToken;
    }

    @JsonProperty("id_token")
    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
