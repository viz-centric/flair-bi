package com.flair.bi.domain.security;

import lombok.Data;

import javax.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
@Data
public class PermissionEdgeKey implements Serializable {

    private PermissionKey fromKey;

    private PermissionKey toKey;
}
