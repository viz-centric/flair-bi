package com.flair.bi.domain.viewwatch;

import java.time.ZonedDateTime;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.MapsId;
import javax.persistence.Table;

import com.flair.bi.domain.User;
import com.flair.bi.domain.View;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "view_watches")
public class ViewWatch {

	@EmbeddedId
	private ViewWatchId id;

	@MapsId("userId")
	@ManyToOne
	@JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_user_id"), referencedColumnName = "id")
	private User user;

	@MapsId("viewId")
	@ManyToOne(cascade = { CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH, CascadeType.DETACH,
			CascadeType.REMOVE })
	@JoinColumn(name = "view_id", foreignKey = @ForeignKey(name = "fk_view_id"), referencedColumnName = "id")
	private View view;

	@Column(name = "watch_time", nullable = false)
	private ZonedDateTime watchTime = ZonedDateTime.now();

	@Column(name = "watch_count", nullable = false)
	private Long watchCount = 1L;

	public ViewWatch incrementWatchCount() {
		watchCount = watchCount + 1L;
		return this;
	}
}
