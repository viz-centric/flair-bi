package com.flair.bi.view;

import com.flair.bi.domain.View;
import com.flair.bi.domain.ViewState;
import org.ektorp.CouchDbConnector;
import org.ektorp.support.CouchDbRepositorySupport;
import org.springframework.stereotype.Repository;

/**
 * CouchDB repository for {@link View}
 */
@Repository
class ViewStateCouchDbRepository extends CouchDbRepositorySupport<ViewState> {

    protected ViewStateCouchDbRepository(CouchDbConnector db) {
        super(ViewState.class, db, "view");
    }

}
