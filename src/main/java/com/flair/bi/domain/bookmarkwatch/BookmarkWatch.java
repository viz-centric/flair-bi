package com.flair.bi.domain.bookmarkwatch;

import com.flair.bi.domain.FeatureBookmark;
import com.flair.bi.domain.User;
import com.flair.bi.domain.View;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.ZonedDateTime;

@Getter
@Setter
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "bookmark_watches")
public class BookmarkWatch {

	@EmbeddedId
	private BookmarkWatchId id;

	@MapsId("userId")
	@ManyToOne
	@JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_user_id"), referencedColumnName = "id")
	private User user;

	@MapsId("viewId")
	@ManyToOne(cascade = { CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH, CascadeType.DETACH,
			CascadeType.REMOVE })
	@JoinColumn(name = "view_id", foreignKey = @ForeignKey(name = "fk_view_id"), referencedColumnName = "id")
	private View view;

	@MapsId("bookmarkId")
	@ManyToOne(cascade = { CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH, CascadeType.DETACH,
			CascadeType.REMOVE })
	@JoinColumn(name = "bookmark_id", foreignKey = @ForeignKey(name = "fk_bookmark_id"), referencedColumnName = "id")
	private FeatureBookmark featureBookmark;

	@Column(name = "watch_time", nullable = false)
	private ZonedDateTime watchTime = ZonedDateTime.now();

	@Column(name = "watch_created_time", nullable = false)
	private ZonedDateTime watchCreatedTime = ZonedDateTime.now();

	@Column(name = "watch_count", nullable = false)
	private Long watchCount = 1L;

	public BookmarkWatch incrementWatchCount() {
		watchCount = watchCount + 1L;
		return this;
	}
}
