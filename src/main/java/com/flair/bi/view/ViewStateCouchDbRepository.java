package com.flair.bi.view;

import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewState;
import org.ektorp.CouchDbConnector;
import org.ektorp.support.CouchDbRepositorySupport;

/**
 * CouchDB repository for {@link View}
 */
public class ViewStateCouchDbRepository extends CouchDbRepositorySupport<ViewState> implements IViewStateRepository {

	public ViewStateCouchDbRepository(CouchDbConnector db) {
		super(ViewState.class, db, "view");
	}

}
