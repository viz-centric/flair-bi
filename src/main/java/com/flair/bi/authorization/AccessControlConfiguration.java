package com.flair.bi.authorization;

import com.flair.bi.repository.security.PermissionEdgeRepository;
import com.flair.bi.repository.security.PermissionRepository;
import com.flair.bi.service.UserService;
import com.flair.bi.service.security.UserGroupService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AccessControlConfiguration {

	@Bean
	public AccessControlManager accessControlManager(UserService userService,
													 UserGroupService userGroupService,
													 PermissionRepository permissionRepository,
													 PermissionEdgeRepository permissionEdgeRepository) {
		return new AccessControlManagerImpl(userService, userGroupService, permissionRepository,
				permissionEdgeRepository);
	}
}
