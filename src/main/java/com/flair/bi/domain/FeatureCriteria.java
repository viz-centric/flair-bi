package com.flair.bi.domain;

import java.io.Serializable;
import java.util.Objects;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.PreRemove;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * A FeatureCriteria.
 */
@Entity
@Table(name = "feature_criteria")
public class FeatureCriteria implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
	@SequenceGenerator(name = "sequenceGenerator")
	private Long id;

	@NotNull
	@Column(name = "jhi_value", nullable = false)
	private String value;

	@Column(name = "meta_data")
	private String metaData;

	@Column(name = "date_range")
	private boolean dateRange;

	@ManyToOne(optional = false)
	@NotNull
	private Feature feature;

	@ManyToOne
	@NotNull
	@JsonIgnore
	private FeatureBookmark featureBookmark;

	@Transient
	private Integer hashcodeValue;

	@PreRemove
	public void preRemove() {
		this.feature = null;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	public String getMetaData() {
		return metaData;
	}

	public void setMetaData(String metaData) {
		this.metaData = metaData;
	}

	public boolean getDateRange() {
		return dateRange;
	}

	public void setDateRange(boolean dateRange) {
		this.dateRange = dateRange;
	}

	public FeatureCriteria value(String value) {
		this.value = value;
		return this;
	}

	public Feature getFeature() {
		return feature;
	}

	public void setFeature(Feature feature) {
		this.feature = feature;
	}

	public FeatureCriteria feature(Feature feature) {
		this.feature = feature;
		return this;
	}

	public FeatureBookmark getFeatureBookmark() {
		return featureBookmark;
	}

	public void setFeatureBookmark(FeatureBookmark featureBookmark) {
		this.featureBookmark = featureBookmark;
	}

	public FeatureCriteria featureBookmark(FeatureBookmark featureBookmark) {
		this.featureBookmark = featureBookmark;
		return this;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (o == null || getClass() != o.getClass()) {
			return false;
		}
		FeatureCriteria featureCriteria = (FeatureCriteria) o;
		if (featureCriteria.getId() == null || getId() == null) {
			return false;
		}
		return getId().equals(featureCriteria.getId());
	}

	@Override
	public int hashCode() {
		if (hashcodeValue == null) {
			if (id == null) {
				hashcodeValue = super.hashCode();
			} else {
				hashcodeValue = Objects.hashCode(id);
			}
		}
		return hashcodeValue;
	}

	@Override
	public String toString() {
		return "FeatureCriteria{" + "id=" + getId() + ", value='" + getValue() + "'" + "}";
	}
}
