package com.flair.bi.service.security;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class UserGroupInfo {
    private final Long id;
    private final String name;
    private final Integer usersCount;
}
