package com.flair.bi.authorization;

import com.flair.bi.domain.security.Permission;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Class that holds information about if grantee has a specific permission or
 * not
 *
 * Currently for this app that represents User and UserGroup because they are
 * the one who receive permissions as grants
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PermissionReport {

	private Permission permission;

	private boolean hasIt;

}
