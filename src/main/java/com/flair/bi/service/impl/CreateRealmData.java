package com.flair.bi.service.impl;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class CreateRealmData {
    private final Long id;
    private final String name;
    private final String token;
}
