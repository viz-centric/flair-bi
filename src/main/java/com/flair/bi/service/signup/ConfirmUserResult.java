package com.flair.bi.service.signup;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConfirmUserResult {
    private final String jwtToken;
}
