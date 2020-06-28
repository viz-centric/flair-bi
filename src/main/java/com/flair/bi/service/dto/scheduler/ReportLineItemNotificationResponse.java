package com.flair.bi.service.dto.scheduler;

import com.flair.bi.messages.Query;

public class ReportLineItemNotificationResponse extends ReportLineItem {
	private Query query;

	public ReportLineItemNotificationResponse() {
	}

	public Query getQuery() {
		return query;
	}

	public void setQuery(Query query) {
		this.query = query;
	}

	public ReportLineItemNotificationResponse(Query query) {
		super();
		this.query = query;
	}

}
