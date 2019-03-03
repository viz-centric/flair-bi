package com.flair.bi.domain.security;

import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "permission_edge")
@Getter
@Setter
@EqualsAndHashCode(of = {"key"})
@AllArgsConstructor
@NoArgsConstructor
public class PermissionEdge {

    @EmbeddedId
    private PermissionEdgeKey key = new PermissionEdgeKey();

    @MapsId("fromKey")
    @JoinColumns(value = {
        @JoinColumn(name = "from_resource", referencedColumnName = "resource"),
        @JoinColumn(name = "from_action", referencedColumnName = "action"),
        @JoinColumn(name = "from_scope", referencedColumnName = "scope")
    })
    @ManyToOne
    private Permission from;

    @MapsId("toKey")
    @ManyToOne
    @JoinColumns(value = {
        @JoinColumn(name = "to_resource", referencedColumnName = "resource"),
        @JoinColumn(name = "to_action", referencedColumnName = "action"),
        @JoinColumn(name = "to_scope", referencedColumnName = "scope")
    })
    private Permission to;

    @Column(name = "bidirectional", updatable = false)
    private boolean biDirectional;

    @Column(name = "transitive", updatable = false)
    private boolean transitive;

    public PermissionEdge(Permission from, Permission to, boolean biDirectional, boolean transitive) {
        this.from = from;
        this.to = to;
        this.biDirectional = biDirectional;
        this.transitive = transitive;
    }
}
