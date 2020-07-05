package com.flair.bi.domain.bookmarkwatch;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Embeddable;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

@Embeddable
public class BookmarkWatchId implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -8546285681000006893L;

	@Column(name = "user_id")
	private Long userId;

	@Column(name = "view_id")
	private Long viewId;

	@Column(name = "bookmark_id")
	private Long bookmarkId;

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

	public Long getBookmarkId() {
		return bookmarkId;
	}

	public void setBookmarkId(Long bookmarkId) {
		this.bookmarkId = bookmarkId;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;

		if (o == null || getClass() != o.getClass())
			return false;

		BookmarkWatchId that = (BookmarkWatchId) o;

		return new EqualsBuilder().append(getUserId(), that.getUserId()).append(getViewId(), that.getViewId())
				.append(getBookmarkId(), that.getBookmarkId()).isEquals();
	}

	@Override
	public int hashCode() {
		return new HashCodeBuilder(17, 37).append(getUserId()).append(getViewId()).append(getBookmarkId()).toHashCode();
	}
}
