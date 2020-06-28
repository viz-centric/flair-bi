package com.flair.bi.domain;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.AttributeOverride;
import javax.persistence.AttributeOverrides;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.PreRemove;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Publish version of {@link View}
 * <p>
 * Contains which document in NOSQL refers to this version, which version number
 * and which users are involved in it.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "view_releases")
public class ViewRelease extends Release {

	@Embedded
	@AttributeOverrides(value = { @AttributeOverride(name = "id", column = @Column(name = "release_state_id")),
			@AttributeOverride(name = "readOnly", column = @Column(name = "release_state_read_only")) })
	private ViewState viewState;

	@JsonIgnore
	@ManyToMany(mappedBy = "viewReleases")
	private Set<DashboardRelease> dashboardReleases = new HashSet<>();

	@JsonIgnore
	@ManyToOne
	private View view;

	@PreRemove
	public void preRemove() {
		dashboardReleases.forEach(x -> x.getViewReleases().remove(this));
		dashboardReleases.clear();
	}
}
