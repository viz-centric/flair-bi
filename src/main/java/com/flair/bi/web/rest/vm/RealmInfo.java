package com.flair.bi.web.rest.vm;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class RealmInfo {
    private final String name;
    private final Long id;
}
