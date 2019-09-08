package com.flair.bi.service.mapper;

import com.flair.bi.domain.security.UserGroup;
import com.flair.bi.service.dto.UserGroupDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {})
public interface UserGroupMapper {

    UserGroupDTO userGroupToUserGroupDTO(UserGroup userGroup);

    UserGroup userGroupDTOtoUserGroup(UserGroupDTO userGroupDTO);

    List<UserGroup> userGroupDTOsToUserGroups(List<UserGroupDTO> userGroupDTOS);

    List<UserGroupDTO> userGroupsToUserGroupDTOs(List<UserGroup> fieldTypes);
}
