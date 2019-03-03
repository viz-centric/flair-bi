package com.flair.bi.service.mapper;

import com.flair.bi.domain.User;
import com.flair.bi.domain.security.Permission;
import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.service.dto.UserDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Mapper for the entity User and its DTO UserDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface UserMapper {

    UserDTO userToUserDTO(User user);

    List<UserDTO> usersToUserDTOs(List<User> users);

    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    @Mapping(target = "persistentTokens", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "activationKey", ignore = true)
    @Mapping(target = "resetKey", ignore = true)
    @Mapping(target = "resetDate", ignore = true)
    @Mapping(target = "password", ignore = true)
    User userDTOToUser(UserDTO userDTO);

    List<User> userDTOsToUsers(List<UserDTO> userDTOs);

    default User userFromId(Long id) {
        if (id == null) {
            return null;
        }
        User user = new User();
        user.setId(id);
        return user;
    }

    default Set<String> stringsFromPermissions(Set<Permission> permissions) {
        return permissions
            .stream()
            .map(Permission::getStringValue)
            .collect(Collectors.toSet());
    }

    default Set<String> stringsFromUserGroups(Set<UserGroup> userGroups) {
        return userGroups
            .stream()
            .map(UserGroup::getName)
            .collect(Collectors.toSet());
    }

    default Set<Permission> permissionsFromStrings(Set<String> strings) {
        return strings.stream()
            .map(Permission::fromStringValue
            ).collect(Collectors.toSet());
    }

    default Set<UserGroup> userGroupsFromStrings(Set<String> strings) {
        return strings.stream()
            .map(s -> {
                UserGroup userGroup = new UserGroup();
                userGroup.setName(s);
                return userGroup;
            }).collect(Collectors.toSet());
    }
}
