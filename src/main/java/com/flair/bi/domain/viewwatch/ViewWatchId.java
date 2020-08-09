package com.flair.bi.domain.viewwatch;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Embeddable;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

@Embeddable
public class ViewWatchId implements Serializable {

	@Column(name = "user_id")
	private Long userId;

	@Column(name = "view_id")
	private Long viewId;

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public Long getViewId() {
		return viewId;
	}

	public void setViewId(Long viewId) {
		this.viewId = viewId;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;

		if (o == null || getClass() != o.getClass())
			return false;

		ViewWatchId that = (ViewWatchId) o;

		return new EqualsBuilder().append(getUserId(), that.getUserId()).append(getViewId(), that.getViewId())
				.isEquals();
	}

	@Override
	public int hashCode() {
		return new HashCodeBuilder(17, 37).append(getUserId()).append(getViewId()).toHashCode();
	}
}
