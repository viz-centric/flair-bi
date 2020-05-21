package com.flair.bi.domain;

import java.io.Serializable;
import java.util.Comparator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

import org.apache.commons.lang3.builder.EqualsBuilder;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import lombok.Getter;
import lombok.Setter;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME)
@JsonSubTypes({ @JsonSubTypes.Type(value = DashboardRelease.class, name = "Dashboard"),
		@JsonSubTypes.Type(value = ViewRelease.class, name = "View") })
@Entity
@Getter
@Setter
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public abstract class Release extends AbstractAuditingEntity implements Serializable {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@Column(name = "release_comment")
	private String comment;

	/**
	 * Version number of released
	 */
	@NotNull
	@Column(name = "version_number", nullable = false)
	private Long versionNumber;

	/**
	 * User who processed release
	 */
	@ManyToOne
	@JoinColumn(name = "processed_by_login", referencedColumnName = "login")
	private User processedBy;

	/**
	 * User who requested release
	 */
	@JoinColumn(name = "requested_by_login", referencedColumnName = "login", nullable = false)
	@ManyToOne
	private User requestedBy;

	/**
	 * If the release has been has been approved
	 */
	@NotNull
	@Enumerated(EnumType.STRING)
	@Column(name = "release_status", nullable = false)
	private Status releaseStatus = Status.WAITING_FOR_RESPONSE;

	@Transient
	private Integer hashcodeValue;

	public enum Status {
		APPROVED, WAITING_FOR_RESPONSE, REJECT
	}

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;

		if (o == null || getClass() != o.getClass())
			return false;

		Release that = (Release) o;

		return new EqualsBuilder().append(getId(), that.getId()).isEquals();
	}

	@Override
	public int hashCode() {
		if (hashcodeValue == null) {
			if (id == null) {
				hashcodeValue = super.hashCode();
			} else {
				hashcodeValue = Math.toIntExact(id);
			}
		}

		return hashcodeValue;
	}

	public static Comparator<Release> maxVersion() {
		return (x, y) -> {
			if (x.getVersionNumber() > y.getVersionNumber()) {
				return 1;
			} else if (x.getVersionNumber().equals(y.getVersionNumber())) {
				return 0;
			} else {
				return -1;
			}
		};
	}
}
