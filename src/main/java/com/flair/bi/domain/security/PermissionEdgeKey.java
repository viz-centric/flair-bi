package com.flair.bi.domain.security;

import java.io.Serializable;

import javax.persistence.Embeddable;

import lombok.Data;

@Embeddable
@Data
public class PermissionEdgeKey implements Serializable {

	private PermissionKey fromKey;

	private PermissionKey toKey;
}
