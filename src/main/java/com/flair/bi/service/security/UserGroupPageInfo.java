package com.flair.bi.service.security;

import com.flair.bi.domain.security.UserGroup;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@RequiredArgsConstructor
public class UserGroupPageInfo {
    private final List<UserGroupInfo> results;
    private final Page<UserGroup> page;
}
