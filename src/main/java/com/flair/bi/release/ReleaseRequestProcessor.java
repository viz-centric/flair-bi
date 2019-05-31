package com.flair.bi.release;

import com.flair.bi.domain.Release;
import com.flair.bi.domain.ReleaseRequest;
import com.flair.bi.exception.UniqueConstraintsException;

public interface ReleaseRequestProcessor<T extends Release> {

    ReleaseRequest requestRelease(T entity) throws UniqueConstraintsException;

}
