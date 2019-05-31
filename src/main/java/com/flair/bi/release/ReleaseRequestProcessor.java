package com.flair.bi.release;

import com.flair.bi.domain.Release;
import com.flair.bi.domain.ReleaseRequest;

public interface ReleaseRequestProcessor<T extends Release> {

    ReleaseRequest requestRelease(T entity);

}
