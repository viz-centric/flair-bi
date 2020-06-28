package com.flair.bi.domain;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

@Entity
@Table(name = "information")
public class Information extends AbstractAuditingEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@NotNull
	@Column(name = "information_name", nullable = false)
	private String name;

	@Column(name = "information_description")
	private String description;

	@Column(name = "information_icon")
	private String icon;

	@NotNull
	@Column(name = "information_endpoint", nullable = false, length = 500)
	private String endPoint;

	@Column(name = "data_paths")
	private String dataPaths;

	@Column(name = "is_array")
	private boolean isArray;

	@Column(name = "sequence_number")
	private int order;

	@Column(name = "css_style")
	private String cssStyle;

	@Column(name = "is_desktop")
	private Boolean isDesktop;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getIcon() {
		return icon;
	}

	public void setIcon(String icon) {
		this.icon = icon;
	}

	public String getEndPoint() {
		return endPoint;
	}

	public void setEndPoint(String endPoint) {
		this.endPoint = endPoint;
	}

	public String getDataPaths() {
		return dataPaths;
	}

	public void setDataPaths(String dataPaths) {
		this.dataPaths = dataPaths;
	}

	public boolean isArray() {
		return isArray;
	}

	public void setArray(boolean array) {
		isArray = array;
	}

	public int getOrder() {
		return order;
	}

	public void setOrder(int order) {
		this.order = order;
	}

	public String getCssStyle() {
		return cssStyle;
	}

	public void setCssStyle(String cssStyle) {
		this.cssStyle = cssStyle;
	}

	public Boolean getIsDesktop() {
		return isDesktop;
	}

	public void setIsDesktop(Boolean isDesktop) {
		this.isDesktop = isDesktop;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;

		if (o == null || getClass() != o.getClass())
			return false;

		Information that = (Information) o;

		return new EqualsBuilder().append(getId(), that.getId()).isEquals();
	}

	@Override
	public int hashCode() {
		return new HashCodeBuilder(17, 37).append(getId()).toHashCode();
	}
}
