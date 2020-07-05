package com.flair.bi.repository;

import java.util.Collection;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flair.bi.domain.ReleaseRequest;

public interface ReleaseRequestRepository extends JpaRepository<ReleaseRequest, Long> {

	Collection<ReleaseRequest> findByReleaseId(Long releaseId);
}
