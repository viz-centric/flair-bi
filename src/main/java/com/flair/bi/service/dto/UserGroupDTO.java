package com.flair.bi.service.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.flair.bi.domain.security.Permission;
import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;

@Data
public class UserGroupDTO {

    @NotNull
    @Size(max = 50)
    private String name;

    @JsonIgnore
    private Set<Permission> permissions = new HashSet<>();

    private Set<UserDTO> users = new HashSet<>();
}
