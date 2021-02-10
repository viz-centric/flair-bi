package com.flair.bi.service.signup;

import com.flair.bi.domain.DraftUser;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SignUpWithProviderResult {
    private final String emailToken;
    private final DraftUser draftUser;
}
