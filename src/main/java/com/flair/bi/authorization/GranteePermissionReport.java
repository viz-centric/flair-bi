package com.flair.bi.authorization;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

/**
 * Report about which permissions does user have or does not have
 *
 * @param <T> permission grantee
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class GranteePermissionReport<T extends PermissionGrantee> {

    private T grantee;

    private Map<String, Object> info = new HashMap<>();
}
