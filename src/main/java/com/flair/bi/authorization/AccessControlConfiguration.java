package com.flair.bi.authorization;

import com.flair.bi.repository.UserRepository;
import com.flair.bi.repository.security.PermissionEdgeRepository;
import com.flair.bi.repository.security.PermissionRepository;
import com.flair.bi.service.security.UserGroupService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AccessControlConfiguration {

	@Bean
	public AccessControlManager accessControlManager(UserRepository userRepository,
													 UserGroupService userGroupService,
													 PermissionRepository permissionRepository,
													 PermissionEdgeRepository permissionEdgeRepository) {
		return new AccessControlManagerImpl(userRepository, userGroupService, permissionRepository,
				permissionEdgeRepository);
	}
}
