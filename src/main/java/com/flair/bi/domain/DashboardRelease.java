package com.flair.bi.domain;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Release versioning for {@link Dashboard}
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "dashboard_releases")
@Entity
public class DashboardRelease extends Release {

	@ManyToMany(cascade = CascadeType.ALL)
	@JoinTable(name = "dashboard_view_releases", joinColumns = @JoinColumn(name = "dashboard_release_id", referencedColumnName = "id"), inverseJoinColumns = @JoinColumn(name = "view_release_id", referencedColumnName = "id"))
	private Set<ViewRelease> viewReleases = new HashSet<>();

	@JsonIgnore
	@ManyToOne
	private Dashboard dashboard;

	@JsonIgnore
	@OneToOne(cascade = CascadeType.REMOVE, mappedBy = "release")
	private ReleaseRequest releaseRequest;

	public DashboardRelease add(ViewRelease viewRelease) {
		viewReleases.add(viewRelease);
		viewRelease.getDashboardReleases().add(this);
		return this;
	}

	public DashboardRelease remove(ViewRelease viewRelease) {
		viewRelease.getDashboardReleases().remove(this);
		viewReleases.remove(viewRelease);
		return this;
	}

	public DashboardRelease add(Collection<ViewRelease> viewRelease) {
		viewRelease.forEach(this::add);
		return this;
	}

	public DashboardRelease remove(Collection<ViewRelease> viewRelease) {
		viewRelease.forEach(this::remove);
		return this;
	}

}
