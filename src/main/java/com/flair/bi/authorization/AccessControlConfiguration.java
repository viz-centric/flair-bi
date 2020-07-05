package com.flair.bi.authorization;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.flair.bi.repository.UserRepository;
import com.flair.bi.repository.security.PermissionEdgeRepository;
import com.flair.bi.repository.security.PermissionRepository;
import com.flair.bi.repository.security.UserGroupRepository;

@Configuration
public class AccessControlConfiguration {

	@Bean
	public AccessControlManager accessControlManager(UserRepository userRepository,
			UserGroupRepository userGroupRepository, PermissionRepository permissionRepository,
			PermissionEdgeRepository permissionEdgeRepository) {
		return new AccessControlManagerImpl(userRepository, userGroupRepository, permissionRepository,
				permissionEdgeRepository);
	}
}
