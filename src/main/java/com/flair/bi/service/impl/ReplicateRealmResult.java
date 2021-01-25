package com.flair.bi.service.impl;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReplicateRealmResult {
    private final String jwtToken;
}
