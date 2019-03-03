package com.flair.bi.repository;

import com.flair.bi.domain.ReleaseRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;

public interface ReleaseRequestRepository extends JpaRepository<ReleaseRequest, Long> {

    Collection<ReleaseRequest> findByReleaseId(Long releaseId);
}
