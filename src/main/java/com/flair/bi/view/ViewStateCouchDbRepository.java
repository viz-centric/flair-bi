package com.flair.bi.view;

import org.ektorp.CouchDbConnector;
import org.ektorp.support.CouchDbRepositorySupport;
import org.springframework.stereotype.Repository;

import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewState;

/**
 * CouchDB repository for {@link View}
 */
@Repository
class ViewStateCouchDbRepository extends CouchDbRepositorySupport<ViewState> {

	protected ViewStateCouchDbRepository(CouchDbConnector db) {
		super(ViewState.class, db, "view");
	}

}
