package com.flair.bi.domain.security;

import com.flair.bi.domain.Realm;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinColumns;
import javax.persistence.ManyToOne;
import javax.persistence.MapsId;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "permission_edge")
@Getter
@Setter
@EqualsAndHashCode(of = { "key" })
@AllArgsConstructor
@NoArgsConstructor
public class PermissionEdge {

	@EmbeddedId
	private PermissionEdgeKey key = new PermissionEdgeKey();

	@MapsId("fromKey")
	@JoinColumns(value = { @JoinColumn(name = "from_resource", referencedColumnName = "resource"),
			@JoinColumn(name = "from_action", referencedColumnName = "action"),
			@JoinColumn(name = "from_scope", referencedColumnName = "scope") })
	@ManyToOne
	private Permission from;

	@MapsId("toKey")
	@ManyToOne
	@JoinColumns(value = { @JoinColumn(name = "to_resource", referencedColumnName = "resource"),
			@JoinColumn(name = "to_action", referencedColumnName = "action"),
			@JoinColumn(name = "to_scope", referencedColumnName = "scope") })
	private Permission to;

	@Column(name = "bidirectional", updatable = false)
	private boolean biDirectional;

	@Column(name = "transitive", updatable = false)
	private boolean transitive;

	@ManyToOne(optional = false)
	@NotNull
	private Realm realm;

	public PermissionEdge(Permission from, Permission to, boolean biDirectional, boolean transitive, Realm realm) {
		this.from = from;
		this.to = to;
		this.biDirectional = biDirectional;
		this.transitive = transitive;
		this.realm = realm;
	}
}
