package com.flair.bi.domain.security;

import com.flair.bi.domain.enumeration.Action;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.io.Serializable;

@Data
@Embeddable
@AllArgsConstructor
@NoArgsConstructor
public class PermissionKey implements Serializable {

    @Size(max = 255)
    @Pattern(regexp = "[a-zA-Z0-9]*|-")
    @Column(name = "resource", nullable = false, updatable = false)
    private String resource;

    @Size(max = 255)
    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "action", nullable = false, updatable = false)
    private Action action;

    @Size(max = 255)
    @Pattern(regexp = "[a-zA-Z0-9]*|-")
    @Column(name = "scope", nullable = false, updatable = false)
    private String scope;

}
